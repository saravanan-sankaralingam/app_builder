import { FastifyInstance } from 'fastify';
import * as reportController from './report.controller.js';

export async function reportRoutes(app: FastifyInstance) {
  // List all reports for a data layer
  app.get('/', reportController.listReports);

  // Get report by ID
  app.get('/:id', reportController.getReportById);

  // Get report by slug
  app.get('/slug/:slug', reportController.getReportBySlug);

  // Create new report
  app.post('/', reportController.createReport);

  // Update report
  app.put('/:id', reportController.updateReport);

  // Delete report
  app.delete('/:id', reportController.deleteReport);
}
