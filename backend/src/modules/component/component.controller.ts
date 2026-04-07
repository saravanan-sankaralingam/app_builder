import { FastifyRequest, FastifyReply } from 'fastify';
import * as componentService from './component.service';
import {
  createComponentSchema,
  updateComponentSchema,
  listComponentsQuerySchema,
  addParameterSchema,
  CreateComponentInput,
  UpdateComponentInput,
  ListComponentsQuery,
  AddParameterInput,
} from './component.schema';

// List all components for an app
export async function listComponents(
  request: FastifyRequest<{ Params: { appId: string }; Querystring: ListComponentsQuery }>,
  reply: FastifyReply
) {
  try {
    const { appId } = request.params;
    const query = listComponentsQuerySchema.parse(request.query);
    const components = await componentService.listComponents(appId, query);

    return reply.send({
      success: true,
      data: components,
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

// Get component by ID
export async function getComponentById(
  request: FastifyRequest<{ Params: { appId: string; id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const component = await componentService.getComponentById(id);

  if (!component) {
    return reply.status(404).send({
      success: false,
      error: 'Component not found',
    });
  }

  return reply.send({
    success: true,
    data: component,
  });
}

// Get component by slug
export async function getComponentBySlug(
  request: FastifyRequest<{ Params: { appId: string; slug: string } }>,
  reply: FastifyReply
) {
  const { appId, slug } = request.params;

  const component = await componentService.getComponentBySlug(appId, slug);

  if (!component) {
    return reply.status(404).send({
      success: false,
      error: 'Component not found',
    });
  }

  return reply.send({
    success: true,
    data: component,
  });
}

// Create new component
export async function createComponent(
  request: FastifyRequest<{ Params: { appId: string }; Body: CreateComponentInput }>,
  reply: FastifyReply
) {
  try {
    const { appId } = request.params;
    const input = createComponentSchema.parse(request.body);

    // Check if name is already taken within the app
    const nameTaken = await componentService.isComponentNameTaken(appId, input.name);
    if (nameTaken) {
      return reply.status(409).send({
        success: false,
        error: 'A component with this name already exists in this app',
      });
    }

    const component = await componentService.createComponent(appId, input);

    return reply.status(201).send({
      success: true,
      data: component,
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

// Update component
export async function updateComponent(
  request: FastifyRequest<{ Params: { appId: string; id: string }; Body: UpdateComponentInput }>,
  reply: FastifyReply
) {
  try {
    const { appId, id } = request.params;
    const input = updateComponentSchema.parse(request.body);

    // If name is being updated, check it's not taken
    if (input.name) {
      const nameTaken = await componentService.isComponentNameTaken(appId, input.name, id);
      if (nameTaken) {
        return reply.status(409).send({
          success: false,
          error: 'A component with this name already exists in this app',
        });
      }
    }

    const component = await componentService.updateComponent(id, input);

    if (!component) {
      return reply.status(404).send({
        success: false,
        error: 'Component not found',
      });
    }

    return reply.send({
      success: true,
      data: component,
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

// Delete component
export async function deleteComponent(
  request: FastifyRequest<{ Params: { appId: string; id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const deleted = await componentService.deleteComponent(id);

  if (!deleted) {
    return reply.status(404).send({
      success: false,
      error: 'Component not found',
    });
  }

  return reply.send({
    success: true,
    message: 'Component deleted successfully',
  });
}

// Add parameter to component
export async function addParameter(
  request: FastifyRequest<{ Params: { appId: string; id: string }; Body: AddParameterInput }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const parameter = addParameterSchema.parse(request.body);

    const component = await componentService.addParameter(id, parameter);

    if (!component) {
      return reply.status(404).send({
        success: false,
        error: 'Component not found',
      });
    }

    return reply.send({
      success: true,
      data: component,
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

// Delete parameter from component
export async function deleteParameter(
  request: FastifyRequest<{ Params: { appId: string; id: string; parameterId: string } }>,
  reply: FastifyReply
) {
  const { id, parameterId } = request.params;

  const component = await componentService.deleteParameter(id, parameterId);

  if (!component) {
    return reply.status(404).send({
      success: false,
      error: 'Component not found',
    });
  }

  return reply.send({
    success: true,
    data: component,
  });
}
