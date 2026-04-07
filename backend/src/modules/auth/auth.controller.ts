import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  refreshTokenSchema,
} from './auth.schema.js';
import * as authService from './auth.service.js';
import { env } from '../../config/env.js';

export async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const input = registerSchema.parse(request.body);
    const user = await authService.register(input);
    return reply.status(201).send({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Email already registered') {
        return reply.status(409).send({ success: false, error: error.message });
      }
      if (error.name === 'ZodError') {
        return reply.status(400).send({ success: false, error: 'Validation failed', details: error });
      }
    }
    return reply.status(500).send({ success: false, error: 'Internal server error' });
  }
}

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const input = loginSchema.parse(request.body);
    const result = await authService.login(input, request.server, env.REFRESH_TOKEN_EXPIRES_IN);
    return reply.send({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid email or password' || error.message === 'Account is disabled') {
        return reply.status(401).send({ success: false, error: error.message });
      }
      if (error.name === 'ZodError') {
        return reply.status(400).send({ success: false, error: 'Validation failed', details: error });
      }
    }
    return reply.status(500).send({ success: false, error: 'Internal server error' });
  }
}

export async function refreshHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const input = refreshTokenSchema.parse(request.body);
    const tokens = await authService.refreshAccessToken(
      input.refreshToken,
      request.server,
      env.REFRESH_TOKEN_EXPIRES_IN
    );
    return reply.send({ success: true, data: tokens });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('token')) {
        return reply.status(401).send({ success: false, error: error.message });
      }
    }
    return reply.status(500).send({ success: false, error: 'Internal server error' });
  }
}

export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const input = refreshTokenSchema.parse(request.body);
    await authService.logout(input.refreshToken);
    return reply.send({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return reply.status(500).send({ success: false, error: 'Internal server error' });
  }
}

export async function getMeHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = await authService.getProfile(request.user.userId);
    return reply.send({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return reply.status(404).send({ success: false, error: error.message });
    }
    return reply.status(500).send({ success: false, error: 'Internal server error' });
  }
}

export async function updateMeHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    const input = updateProfileSchema.parse(request.body);
    const user = await authService.updateProfile(request.user.userId, input);
    return reply.send({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({ success: false, error: 'Validation failed', details: error });
      }
    }
    return reply.status(500).send({ success: false, error: 'Internal server error' });
  }
}
