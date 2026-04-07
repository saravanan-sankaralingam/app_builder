import { FastifyInstance } from 'fastify';
import * as viewController from './view.controller';

export async function viewRoutes(app: FastifyInstance) {
  // List all views for a data layer
  app.get('/', viewController.listViews);

  // Get view by ID
  app.get('/:id', viewController.getViewById);

  // Get view by slug
  app.get('/slug/:slug', viewController.getViewBySlug);

  // Create new view
  app.post('/', viewController.createView);

  // Update view
  app.put('/:id', viewController.updateView);

  // Delete view
  app.delete('/:id', viewController.deleteView);
}
