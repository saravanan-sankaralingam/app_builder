import { FastifyInstance } from 'fastify';
import { uploadController } from './upload.controller.js';

export async function uploadRoutes(app: FastifyInstance) {
  // Upload bundle file
  app.post('/', uploadController.uploadBundle);

  // Get bundle file info
  app.get('/', uploadController.getBundleInfo);

  // Delete bundle file
  app.delete('/', uploadController.deleteBundle);
}
