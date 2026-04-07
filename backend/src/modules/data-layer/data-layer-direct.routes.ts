import { FastifyInstance } from 'fastify';
import * as dataLayerController from './data-layer.controller';

// Direct data layer routes (without appId prefix)
export async function dataLayerDirectRoutes(app: FastifyInstance) {
  // Get data layer by ID (direct access)
  app.get('/:id', dataLayerController.getDataLayerByIdDirect);

  // Update data layer (direct access)
  app.patch('/:id', dataLayerController.updateDataLayerDirect);
}
