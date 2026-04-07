import { FastifyInstance } from 'fastify';
import * as dataLayerController from './data-layer.controller';

export async function dataLayerRoutes(app: FastifyInstance) {
  // List all data layers for an app
  app.get('/', dataLayerController.listDataLayers);

  // Get data layer by ID
  app.get('/:id', dataLayerController.getDataLayerById);

  // Get data layer by slug
  app.get('/slug/:slug', dataLayerController.getDataLayerBySlug);

  // Create new data layer
  app.post('/', dataLayerController.createDataLayer);

  // Update data layer
  app.put('/:id', dataLayerController.updateDataLayer);

  // Delete data layer
  app.delete('/:id', dataLayerController.deleteDataLayer);

  // Duplicate data layer
  app.post('/:id/duplicate', dataLayerController.duplicateDataLayer);
}
