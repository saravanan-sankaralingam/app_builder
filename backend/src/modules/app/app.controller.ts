import { FastifyRequest, FastifyReply } from 'fastify';
import * as appService from './app.service';
import {
  createAppSchema,
  updateAppSchema,
  listAppsQuerySchema,
  CreateAppInput,
  UpdateAppInput,
  ListAppsQuery,
} from './app.schema';

// List all apps
export async function listApps(
  request: FastifyRequest<{ Querystring: ListAppsQuery }>,
  reply: FastifyReply
) {
  try {
    const query = listAppsQuerySchema.parse(request.query);
    const result = await appService.listApps(query);

    return reply.send({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Invalid query parameters',
        details: error,
      });
    }
    throw error;
  }
}

// Get app by ID
export async function getAppById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const app = await appService.getAppById(id);

  if (!app) {
    return reply.status(404).send({
      success: false,
      error: 'App not found',
    });
  }

  return reply.send({
    success: true,
    data: app,
  });
}

// Get app by slug
export async function getAppBySlug(
  request: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) {
  const { slug } = request.params;

  const app = await appService.getAppBySlug(slug);

  if (!app) {
    return reply.status(404).send({
      success: false,
      error: 'App not found',
    });
  }

  return reply.send({
    success: true,
    data: app,
  });
}

// Create new app
export async function createApp(
  request: FastifyRequest<{ Body: CreateAppInput }>,
  reply: FastifyReply
) {
  try {
    const input = createAppSchema.parse(request.body);

    // Check if name is already taken
    const nameTaken = await appService.isAppNameTaken(input.name);
    if (nameTaken) {
      return reply.status(409).send({
        success: false,
        error: 'An app with this name already exists',
      });
    }

    const app = await appService.createApp(input);

    return reply.status(201).send({
      success: true,
      data: app,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error,
      });
    }
    throw error;
  }
}

// Update app
export async function updateApp(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateAppInput }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const input = updateAppSchema.parse(request.body);

    // If name is being updated, check it's not taken
    if (input.name) {
      const nameTaken = await appService.isAppNameTaken(input.name, id);
      if (nameTaken) {
        return reply.status(409).send({
          success: false,
          error: 'An app with this name already exists',
        });
      }
    }

    const app = await appService.updateApp(id, input);

    if (!app) {
      return reply.status(404).send({
        success: false,
        error: 'App not found',
      });
    }

    return reply.send({
      success: true,
      data: app,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error,
      });
    }
    throw error;
  }
}

// Delete app
export async function deleteApp(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const deleted = await appService.deleteApp(id);

  if (!deleted) {
    return reply.status(404).send({
      success: false,
      error: 'App not found',
    });
  }

  return reply.send({
    success: true,
    message: 'App deleted successfully',
  });
}

// Check if app name is available
export async function checkAppName(
  request: FastifyRequest<{ Querystring: { name: string; excludeId?: string } }>,
  reply: FastifyReply
) {
  const { name, excludeId } = request.query;

  if (!name) {
    return reply.status(400).send({
      success: false,
      error: 'Name is required',
    });
  }

  const isTaken = await appService.isAppNameTaken(name, excludeId);

  return reply.send({
    success: true,
    data: {
      available: !isTaken,
    },
  });
}
