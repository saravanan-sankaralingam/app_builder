import { FastifyInstance } from 'fastify';
import * as pageController from './page.controller';

export async function pageRoutes(app: FastifyInstance) {
  // List all pages for an app
  app.get('/', pageController.listPages);

  // Get page by ID
  app.get('/:id', pageController.getPageById);

  // Get page by slug
  app.get('/slug/:slug', pageController.getPageBySlug);

  // Create new page
  app.post('/', pageController.createPage);

  // Update page
  app.put('/:id', pageController.updatePage);

  // Delete page
  app.delete('/:id', pageController.deletePage);
}
