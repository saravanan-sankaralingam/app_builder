import { FastifyRequest, FastifyReply } from 'fastify';
import * as fieldService from './field.service';
import {
  createFieldSchema,
  updateFieldSchema,
  reorderFieldsSchema,
  CreateFieldInput,
  UpdateFieldInput,
  ReorderFieldsInput,
} from './field.schema';

// List all fields for a data layer
export async function listFields(
  request: FastifyRequest<{ Params: { dataLayerId: string } }>,
  reply: FastifyReply
) {
  const { dataLayerId } = request.params;
  const fields = await fieldService.listFields(dataLayerId);

  return reply.send({
    success: true,
    data: fields,
  });
}

// Get field by ID
export async function getFieldById(
  request: FastifyRequest<{ Params: { dataLayerId: string; fieldId: string } }>,
  reply: FastifyReply
) {
  const { fieldId } = request.params;

  const field = await fieldService.getFieldById(fieldId);

  if (!field) {
    return reply.status(404).send({
      success: false,
      error: 'Field not found',
    });
  }

  return reply.send({
    success: true,
    data: field,
  });
}

// Create new field
export async function createField(
  request: FastifyRequest<{ Params: { dataLayerId: string }; Body: CreateFieldInput }>,
  reply: FastifyReply
) {
  try {
    const { dataLayerId } = request.params;
    const input = createFieldSchema.parse(request.body);

    // Check if name is already taken
    const nameTaken = await fieldService.isFieldNameTaken(dataLayerId, input.name);
    if (nameTaken) {
      return reply.status(409).send({
        success: false,
        error: 'A field with this name already exists in this data layer',
      });
    }

    const field = await fieldService.createField(dataLayerId, input);

    return reply.status(201).send({
      success: true,
      data: field,
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

// Update field
export async function updateField(
  request: FastifyRequest<{ Params: { dataLayerId: string; fieldId: string }; Body: UpdateFieldInput }>,
  reply: FastifyReply
) {
  try {
    const { dataLayerId, fieldId } = request.params;
    const input = updateFieldSchema.parse(request.body);

    // If name is being updated, check it's not taken
    if (input.name) {
      const nameTaken = await fieldService.isFieldNameTaken(dataLayerId, input.name, fieldId);
      if (nameTaken) {
        return reply.status(409).send({
          success: false,
          error: 'A field with this name already exists in this data layer',
        });
      }
    }

    const field = await fieldService.updateField(fieldId, input);

    if (!field) {
      return reply.status(404).send({
        success: false,
        error: 'Field not found',
      });
    }

    return reply.send({
      success: true,
      data: field,
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

// Delete field
export async function deleteField(
  request: FastifyRequest<{ Params: { dataLayerId: string; fieldId: string } }>,
  reply: FastifyReply
) {
  const { fieldId } = request.params;

  const deleted = await fieldService.deleteField(fieldId);

  if (!deleted) {
    return reply.status(404).send({
      success: false,
      error: 'Field not found',
    });
  }

  return reply.send({
    success: true,
    message: 'Field deleted successfully',
  });
}

// Reorder fields
export async function reorderFields(
  request: FastifyRequest<{ Params: { dataLayerId: string }; Body: ReorderFieldsInput }>,
  reply: FastifyReply
) {
  try {
    const { dataLayerId } = request.params;
    const input = reorderFieldsSchema.parse(request.body);

    const fields = await fieldService.reorderFields(dataLayerId, input);

    return reply.send({
      success: true,
      data: fields,
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
