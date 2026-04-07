import { FastifyRequest, FastifyReply } from 'fastify';
import * as dataLayerService from './data-layer.service';
import {
  createDataLayerSchema,
  updateDataLayerSchema,
  listDataLayersQuerySchema,
  CreateDataLayerInput,
  UpdateDataLayerInput,
  ListDataLayersQuery,
} from './data-layer.schema';

// List all data layers for an app
export async function listDataLayers(
  request: FastifyRequest<{ Params: { appId: string }; Querystring: ListDataLayersQuery }>,
  reply: FastifyReply
) {
  try {
    const { appId } = request.params;
    const query = listDataLayersQuerySchema.parse(request.query);
    const dataLayers = await dataLayerService.listDataLayers(appId, query);

    return reply.send({
      success: true,
      data: dataLayers,
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

// Get data layer by ID
export async function getDataLayerById(
  request: FastifyRequest<{ Params: { appId: string; id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const dataLayer = await dataLayerService.getDataLayerById(id);

  if (!dataLayer) {
    return reply.status(404).send({
      success: false,
      error: 'Data layer not found',
    });
  }

  return reply.send({
    success: true,
    data: dataLayer,
  });
}

// Get data layer by slug
export async function getDataLayerBySlug(
  request: FastifyRequest<{ Params: { appId: string; slug: string } }>,
  reply: FastifyReply
) {
  const { appId, slug } = request.params;

  const dataLayer = await dataLayerService.getDataLayerBySlug(appId, slug);

  if (!dataLayer) {
    return reply.status(404).send({
      success: false,
      error: 'Data layer not found',
    });
  }

  return reply.send({
    success: true,
    data: dataLayer,
  });
}

// Create new data layer
export async function createDataLayer(
  request: FastifyRequest<{ Params: { appId: string }; Body: CreateDataLayerInput }>,
  reply: FastifyReply
) {
  try {
    const { appId } = request.params;
    const input = createDataLayerSchema.parse(request.body);

    // Check if name is already taken within the app
    const nameTaken = await dataLayerService.isDataLayerNameTaken(appId, input.name);
    if (nameTaken) {
      return reply.status(409).send({
        success: false,
        error: 'A data layer with this name already exists in this app',
      });
    }

    const dataLayer = await dataLayerService.createDataLayer(appId, input);

    return reply.status(201).send({
      success: true,
      data: dataLayer,
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

// Update data layer
export async function updateDataLayer(
  request: FastifyRequest<{ Params: { appId: string; id: string }; Body: UpdateDataLayerInput }>,
  reply: FastifyReply
) {
  try {
    const { appId, id } = request.params;
    const input = updateDataLayerSchema.parse(request.body);

    // If name is being updated, check it's not taken
    if (input.name) {
      const nameTaken = await dataLayerService.isDataLayerNameTaken(appId, input.name, id);
      if (nameTaken) {
        return reply.status(409).send({
          success: false,
          error: 'A data layer with this name already exists in this app',
        });
      }
    }

    const dataLayer = await dataLayerService.updateDataLayer(id, input);

    if (!dataLayer) {
      return reply.status(404).send({
        success: false,
        error: 'Data layer not found',
      });
    }

    return reply.send({
      success: true,
      data: dataLayer,
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

// Delete data layer
export async function deleteDataLayer(
  request: FastifyRequest<{ Params: { appId: string; id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const deleted = await dataLayerService.deleteDataLayer(id);

  if (!deleted) {
    return reply.status(404).send({
      success: false,
      error: 'Data layer not found',
    });
  }

  return reply.send({
    success: true,
    message: 'Data layer deleted successfully',
  });
}

// Get data layer by ID (direct access without appId)
export async function getDataLayerByIdDirect(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const dataLayer = await dataLayerService.getDataLayerById(id);

  if (!dataLayer) {
    return reply.status(404).send({
      success: false,
      error: 'Data layer not found',
    });
  }

  return reply.send({
    success: true,
    data: dataLayer,
  });
}

// Update data layer (direct access without appId - for config updates like list items)
export async function updateDataLayerDirect(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateDataLayerInput }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const input = updateDataLayerSchema.parse(request.body);

    const dataLayer = await dataLayerService.updateDataLayer(id, input);

    if (!dataLayer) {
      return reply.status(404).send({
        success: false,
        error: 'Data layer not found',
      });
    }

    return reply.send({
      success: true,
      data: dataLayer,
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

// Duplicate data layer
export async function duplicateDataLayer(
  request: FastifyRequest<{
    Params: { appId: string; id: string };
    Body: { name: string; includeViews?: boolean; includeReports?: boolean };
  }>,
  reply: FastifyReply
) {
  try {
    const { appId, id } = request.params;
    const { name, includeViews, includeReports } = request.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return reply.status(400).send({
        success: false,
        error: 'Name is required',
      });
    }

    if (name.trim().length > 100) {
      return reply.status(400).send({
        success: false,
        error: 'Name must be 100 characters or less',
      });
    }

    // Check if name is already taken within the app
    const nameTaken = await dataLayerService.isDataLayerNameTaken(appId, name.trim());
    if (nameTaken) {
      return reply.status(409).send({
        success: false,
        error: 'A data layer with this name already exists in this app',
      });
    }

    const dataLayer = await dataLayerService.duplicateDataLayer(appId, id, {
      name: name.trim(),
      includeViews: includeViews ?? false,
      includeReports: includeReports ?? false,
    });

    return reply.status(201).send({
      success: true,
      data: dataLayer,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Data layer not found') {
        return reply.status(404).send({
          success: false,
          error: 'Data layer not found',
        });
      }
      if (error.message === 'Data layer does not belong to this app') {
        return reply.status(403).send({
          success: false,
          error: 'Data layer does not belong to this app',
        });
      }
    }
    throw error;
  }
}
