import { FastifyInstance } from 'fastify';
import * as componentController from './component.controller';

export async function componentRoutes(app: FastifyInstance) {
  // List all components for an app
  app.get('/', componentController.listComponents);

  // Get component by ID
  app.get('/:id', componentController.getComponentById);

  // Get component by slug
  app.get('/slug/:slug', componentController.getComponentBySlug);

  // Create new component
  app.post('/', componentController.createComponent);

  // Update component
  app.put('/:id', componentController.updateComponent);

  // Delete component
  app.delete('/:id', componentController.deleteComponent);

  // Add parameter to component
  app.post('/:id/parameters', componentController.addParameter);

  // Delete parameter from component
  app.delete('/:id/parameters/:parameterId', componentController.deleteParameter);
}
