import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import type { RegisterInput, LoginInput, UpdateProfileInput } from './auth.schema.js';
import type { SafeUser, TokenPair, JwtPayload } from '../../types/index.js';
import type { FastifyInstance } from 'fastify';

const prisma = new PrismaClient();

// Calculate expiry from string like "7d" or "15m"
function parseExpiry(expiry: string): Date {
  const match = expiry.match(/^(\d+)([mhd])$/);
  if (!match) throw new Error(`Invalid expiry format: ${expiry}`);

  const value = parseInt(match[1]);
  const unit = match[2];

  const now = new Date();
  switch (unit) {
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'd':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    default:
      throw new Error(`Unknown time unit: ${unit}`);
  }
}

function excludePassword(user: { passwordHash: string; [key: string]: unknown }): SafeUser {
  const { passwordHash, ...safeUser } = user;
  return safeUser as SafeUser;
}

export async function register(input: RegisterInput): Promise<SafeUser> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      phone: input.phone,
      department: input.department,
      jobTitle: input.jobTitle,
      location: input.location,
    },
  });

  return excludePassword(user);
}

export async function login(
  input: LoginInput,
  app: FastifyInstance,
  refreshTokenExpiry: string
): Promise<{ user: SafeUser; tokens: TokenPair }> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is disabled');
  }

  const isValidPassword = await verifyPassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate tokens
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = app.jwt.sign(payload);
  const refreshToken = randomUUID();

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: parseExpiry(refreshTokenExpiry),
    },
  });

  return {
    user: excludePassword(user),
    tokens: { accessToken, refreshToken },
  };
}

export async function refreshAccessToken(
  refreshToken: string,
  app: FastifyInstance,
  refreshTokenExpiry: string
): Promise<TokenPair> {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new Error('Invalid refresh token');
  }

  if (storedToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new Error('Refresh token expired');
  }

  if (!storedToken.user.isActive) {
    throw new Error('Account is disabled');
  }

  // Delete old refresh token
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  // Generate new tokens
  const payload: JwtPayload = {
    userId: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
  };

  const newAccessToken = app.jwt.sign(payload);
  const newRefreshToken = randomUUID();

  // Store new refresh token
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: storedToken.user.id,
      expiresAt: parseExpiry(refreshTokenExpiry),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

export async function getProfile(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return excludePassword(user);
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
  });

  return excludePassword(user);
}
