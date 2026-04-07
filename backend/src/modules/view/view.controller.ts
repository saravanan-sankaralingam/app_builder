import { FastifyRequest, FastifyReply } from 'fastify';
import * as viewService from './view.service';
import {
  createViewSchema,
  updateViewSchema,
  listViewsQuerySchema,
  CreateViewInput,
  UpdateViewInput,
  ListViewsQuery,
} from './view.schema';

// List all views for a data layer
export async function listViews(
  request: FastifyRequest<{ Params: { dataLayerId: string }; Querystring: ListViewsQuery }>,
  reply: FastifyReply
) {
  try {
    const { dataLayerId } = request.params;
    const query = listViewsQuerySchema.parse(request.query);
    const views = await viewService.listViews(dataLayerId, query);

    return reply.send({
      success: true,
      data: views,
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

// Get view by ID
export async function getViewById(
  request: FastifyRequest<{ Params: { dataLayerId: string; id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const view = await viewService.getViewById(id);

  if (!view) {
    return reply.status(404).send({
      success: false,
      error: 'View not found',
    });
  }

  return reply.send({
    success: true,
    data: view,
  });
}

// Get view by slug
export async function getViewBySlug(
  request: FastifyRequest<{ Params: { dataLayerId: string; slug: string } }>,
  reply: FastifyReply
) {
  const { dataLayerId, slug } = request.params;

  const view = await viewService.getViewBySlug(dataLayerId, slug);

  if (!view) {
    return reply.status(404).send({
      success: false,
      error: 'View not found',
    });
  }

  return reply.send({
    success: true,
    data: view,
  });
}

// Create new view
export async function createView(
  request: FastifyRequest<{ Params: { dataLayerId: string }; Body: CreateViewInput }>,
  reply: FastifyReply
) {
  try {
    const { dataLayerId } = request.params;
    const input = createViewSchema.parse(request.body);

    // Check if name is already taken within the data layer
    const nameTaken = await viewService.isViewNameTaken(dataLayerId, input.name);
    if (nameTaken) {
      return reply.status(409).send({
        success: false,
        error: 'A view with this name already exists in this data layer',
      });
    }

    const view = await viewService.createView(dataLayerId, input);

    return reply.status(201).send({
      success: true,
      data: view,
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
      if (error.message === 'Data layer not found') {
        return reply.status(404).send({
          success: false,
          error: 'Data layer not found',
        });
      }
    }
    throw error;
  }
}

// Update view
export async function updateView(
  request: FastifyRequest<{ Params: { dataLayerId: string; id: string }; Body: UpdateViewInput }>,
  reply: FastifyReply
) {
  try {
    const { dataLayerId, id } = request.params;
    const input = updateViewSchema.parse(request.body);

    // If name is being updated, check it's not taken
    if (input.name) {
      const nameTaken = await viewService.isViewNameTaken(dataLayerId, input.name, id);
      if (nameTaken) {
        return reply.status(409).send({
          success: false,
          error: 'A view with this name already exists in this data layer',
        });
      }
    }

    const view = await viewService.updateView(id, input);

    if (!view) {
      return reply.status(404).send({
        success: false,
        error: 'View not found',
      });
    }

    return reply.send({
      success: true,
      data: view,
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

// Delete view
export async function deleteView(
  request: FastifyRequest<{ Params: { dataLayerId: string; id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const deleted = await viewService.deleteView(id);

  if (!deleted) {
    return reply.status(404).send({
      success: false,
      error: 'View not found',
    });
  }

  return reply.send({
    success: true,
    message: 'View deleted successfully',
  });
}
