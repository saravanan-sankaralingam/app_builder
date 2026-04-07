import { FastifyInstance } from 'fastify';
import * as appController from './app.controller';

export async function appRoutes(app: FastifyInstance) {
  // List all apps (with optional filters)
  app.get('/', appController.listApps);

  // Check if app name is available
  app.get('/check-name', appController.checkAppName);

  // Get app by ID
  app.get('/:id', appController.getAppById);

  // Get app by slug
  app.get('/slug/:slug', appController.getAppBySlug);

  // Create new app
  app.post('/', appController.createApp);

  // Update app
  app.put('/:id', appController.updateApp);

  // Delete app
  app.delete('/:id', appController.deleteApp);
}
