import { FastifyInstance } from 'fastify';
import * as fieldController from './field.controller';

export async function fieldRoutes(app: FastifyInstance) {
  // List all fields for a data layer
  app.get('/', fieldController.listFields);

  // Get field by ID
  app.get('/:fieldId', fieldController.getFieldById);

  // Create new field
  app.post('/', fieldController.createField);

  // Update field
  app.put('/:fieldId', fieldController.updateField);

  // Delete field
  app.delete('/:fieldId', fieldController.deleteField);

  // Reorder fields
  app.put('/reorder', fieldController.reorderFields);
}
