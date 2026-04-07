import { FastifyRequest, FastifyReply } from 'fastify';
import * as navigationService from './navigation.service';
import {
  createNavigationSchema,
  updateNavigationSchema,
  listNavigationsQuerySchema,
  CreateNavigationInput,
  UpdateNavigationInput,
  ListNavigationsQuery,
} from './navigation.schema';

// List all navigations for an app
export async function listNavigations(
  request: FastifyRequest<{ Params: { appId: string }; Querystring: ListNavigationsQuery }>,
  reply: FastifyReply
) {
  try {
    const { appId } = request.params;
    const query = listNavigationsQuerySchema.parse(request.query);
    const navigations = await navigationService.listNavigations(appId, query);

    return reply.send({
      success: true,
      data: navigations,
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

// Get navigation by ID
export async function getNavigationById(
  request: FastifyRequest<{ Params: { appId: string; id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const navigation = await navigationService.getNavigationById(id);

  if (!navigation) {
    return reply.status(404).send({
      success: false,
      error: 'Navigation not found',
    });
  }

  return reply.send({
    success: true,
    data: navigation,
  });
}

// Get navigation by slug
export async function getNavigationBySlug(
  request: FastifyRequest<{ Params: { appId: string; slug: string } }>,
  reply: FastifyReply
) {
  const { appId, slug } = request.params;

  const navigation = await navigationService.getNavigationBySlug(appId, slug);

  if (!navigation) {
    return reply.status(404).send({
      success: false,
      error: 'Navigation not found',
    });
  }

  return reply.send({
    success: true,
    data: navigation,
  });
}

// Create new navigation
export async function createNavigation(
  request: FastifyRequest<{ Params: { appId: string }; Body: CreateNavigationInput }>,
  reply: FastifyReply
) {
  try {
    const { appId } = request.params;
    const input = createNavigationSchema.parse(request.body);

    // Check if name is already taken within the app
    const nameTaken = await navigationService.isNavigationNameTaken(appId, input.name);
    if (nameTaken) {
      return reply.status(409).send({
        success: false,
        error: 'A navigation with this name already exists in this app',
      });
    }

    const navigation = await navigationService.createNavigation(appId, input);

    return reply.status(201).send({
      success: true,
      data: navigation,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          success: false,
          error: 'Validation error',
          details: error,
        });
      }
      if (error.message === 'App not found') {
        return reply.status(404).send({
          success: false,
          error: 'App not found',
        });
      }
    }
    throw error;
  }
}

// Update navigation
export async function updateNavigation(
  request: FastifyRequest<{ Params: { appId: string; id: string }; Body: UpdateNavigationInput }>,
  reply: FastifyReply
) {
  try {
    const { appId, id } = request.params;
    const input = updateNavigationSchema.parse(request.body);

    // If name is being updated, check it's not taken
    if (input.name) {
      const nameTaken = await navigationService.isNavigationNameTaken(appId, input.name, id);
      if (nameTaken) {
        return reply.status(409).send({
          success: false,
          error: 'A navigation with this name already exists in this app',
        });
      }
    }

    const navigation = await navigationService.updateNavigation(id, input);

    if (!navigation) {
      return reply.status(404).send({
        success: false,
        error: 'Navigation not found',
      });
    }

    return reply.send({
      success: true,
      data: navigation,
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

// Delete navigation
export async function deleteNavigation(
  request: FastifyRequest<{ Params: { appId: string; id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const deleted = await navigationService.deleteNavigation(id);

  if (!deleted) {
    return reply.status(404).send({
      success: false,
      error: 'Navigation not found',
    });
  }

  return reply.send({
    success: true,
    message: 'Navigation deleted successfully',
  });
}
