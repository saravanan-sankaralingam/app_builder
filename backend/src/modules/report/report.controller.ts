import { FastifyRequest, FastifyReply } from 'fastify';
import * as reportService from './report.service.js';
import {
  createReportSchema,
  updateReportSchema,
  listReportsQuerySchema,
  CreateReportInput,
  UpdateReportInput,
  ListReportsQuery,
} from './report.schema.js';

// List all reports for a data layer
export async function listReports(
  request: FastifyRequest<{ Params: { dataLayerId: string }; Querystring: ListReportsQuery }>,
  reply: FastifyReply
) {
  try {
    const { dataLayerId } = request.params;
    const query = listReportsQuerySchema.parse(request.query);
    const reports = await reportService.listReports(dataLayerId, query);

    return reply.send({
      success: true,
      data: reports,
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

// Get report by ID
export async function getReportById(
  request: FastifyRequest<{ Params: { dataLayerId: string; id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const report = await reportService.getReportById(id);

  if (!report) {
    return reply.status(404).send({
      success: false,
      error: 'Report not found',
    });
  }

  return reply.send({
    success: true,
    data: report,
  });
}

// Get report by slug
export async function getReportBySlug(
  request: FastifyRequest<{ Params: { dataLayerId: string; slug: string } }>,
  reply: FastifyReply
) {
  const { dataLayerId, slug } = request.params;

  const report = await reportService.getReportBySlug(dataLayerId, slug);

  if (!report) {
    return reply.status(404).send({
      success: false,
      error: 'Report not found',
    });
  }

  return reply.send({
    success: true,
    data: report,
  });
}

// Create new report
export async function createReport(
  request: FastifyRequest<{ Params: { dataLayerId: string }; Body: CreateReportInput }>,
  reply: FastifyReply
) {
  try {
    const { dataLayerId } = request.params;
    const input = createReportSchema.parse(request.body);

    // Check if name is already taken within the data layer
    const nameTaken = await reportService.isReportNameTaken(dataLayerId, input.name);
    if (nameTaken) {
      return reply.status(409).send({
        success: false,
        error: 'A report with this name already exists in this data layer',
      });
    }

    const report = await reportService.createReport(dataLayerId, input);

    return reply.status(201).send({
      success: true,
      data: report,
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

// Update report
export async function updateReport(
  request: FastifyRequest<{ Params: { dataLayerId: string; id: string }; Body: UpdateReportInput }>,
  reply: FastifyReply
) {
  try {
    const { dataLayerId, id } = request.params;
    const input = updateReportSchema.parse(request.body);

    // If name is being updated, check it's not taken
    if (input.name) {
      const nameTaken = await reportService.isReportNameTaken(dataLayerId, input.name, id);
      if (nameTaken) {
        return reply.status(409).send({
          success: false,
          error: 'A report with this name already exists in this data layer',
        });
      }
    }

    const report = await reportService.updateReport(id, input);

    if (!report) {
      return reply.status(404).send({
        success: false,
        error: 'Report not found',
      });
    }

    return reply.send({
      success: true,
      data: report,
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

// Delete report
export async function deleteReport(
  request: FastifyRequest<{ Params: { dataLayerId: string; id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const deleted = await reportService.deleteReport(id);

  if (!deleted) {
    return reply.status(404).send({
      success: false,
      error: 'Report not found',
    });
  }

  return reply.send({
    success: true,
    message: 'Report deleted successfully',
  });
}
