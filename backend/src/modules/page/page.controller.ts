import { FastifyRequest, FastifyReply } from 'fastify';
import * as pageService from './page.service';
import {
  createPageSchema,
  updatePageSchema,
  listPagesQuerySchema,
  CreatePageInput,
  UpdatePageInput,
  ListPagesQuery,
} from './page.schema';

// List all pages for an app
export async function listPages(
  request: FastifyRequest<{ Params: { appId: string }; Querystring: ListPagesQuery }>,
  reply: FastifyReply
) {
  try {
    const { appId } = request.params;
    const query = listPagesQuerySchema.parse(request.query);
    const pages = await pageService.listPages(appId, query);

    return reply.send({
      success: true,
      data: pages,
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

// Get page by ID
export async function getPageById(
  request: FastifyRequest<{ Params: { appId: string; id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const page = await pageService.getPageById(id);

  if (!page) {
    return reply.status(404).send({
      success: false,
      error: 'Page not found',
    });
  }

  return reply.send({
    success: true,
    data: page,
  });
}

// Get page by slug
export async function getPageBySlug(
  request: FastifyRequest<{ Params: { appId: string; slug: string } }>,
  reply: FastifyReply
) {
  const { appId, slug } = request.params;

  const page = await pageService.getPageBySlug(appId, slug);

  if (!page) {
    return reply.status(404).send({
      success: false,
      error: 'Page not found',
    });
  }

  return reply.send({
    success: true,
    data: page,
  });
}

// Create new page
export async function createPage(
  request: FastifyRequest<{ Params: { appId: string }; Body: CreatePageInput }>,
  reply: FastifyReply
) {
  try {
    const { appId } = request.params;
    const input = createPageSchema.parse(request.body);

    // Check if name is already taken within the app
    const nameTaken = await pageService.isPageNameTaken(appId, input.name);
    if (nameTaken) {
      return reply.status(409).send({
        success: false,
        error: 'A page with this name already exists in this app',
      });
    }

    const page = await pageService.createPage(appId, input);

    return reply.status(201).send({
      success: true,
      data: page,
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

// Update page
export async function updatePage(
  request: FastifyRequest<{ Params: { appId: string; id: string }; Body: UpdatePageInput }>,
  reply: FastifyReply
) {
  try {
    const { appId, id } = request.params;
    const input = updatePageSchema.parse(request.body);

    // If name is being updated, check it's not taken
    if (input.name) {
      const nameTaken = await pageService.isPageNameTaken(appId, input.name, id);
      if (nameTaken) {
        return reply.status(409).send({
          success: false,
          error: 'A page with this name already exists in this app',
        });
      }
    }

    const page = await pageService.updatePage(id, input);

    if (!page) {
      return reply.status(404).send({
        success: false,
        error: 'Page not found',
      });
    }

    return reply.send({
      success: true,
      data: page,
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

// Delete page
export async function deletePage(
  request: FastifyRequest<{ Params: { appId: string; id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const deleted = await pageService.deletePage(id);

  if (!deleted) {
    return reply.status(404).send({
      success: false,
      error: 'Page not found',
    });
  }

  return reply.send({
    success: true,
    message: 'Page deleted successfully',
  });
}
