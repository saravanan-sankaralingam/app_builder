import { FastifyInstance } from 'fastify';
import * as navigationController from './navigation.controller';

export async function navigationRoutes(app: FastifyInstance) {
  // List all navigations for an app
  app.get('/', navigationController.listNavigations);

  // Get navigation by ID
  app.get('/:id', navigationController.getNavigationById);

  // Get navigation by slug
  app.get('/slug/:slug', navigationController.getNavigationBySlug);

  // Create new navigation
  app.post('/', navigationController.createNavigation);

  // Update navigation
  app.put('/:id', navigationController.updateNavigation);

  // Delete navigation
  app.delete('/:id', navigationController.deleteNavigation);
}
