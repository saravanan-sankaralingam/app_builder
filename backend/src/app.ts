import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { env } from './config/env.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { appRoutes } from './modules/app/app.routes.js';
import { dataLayerRoutes } from './modules/data-layer/data-layer.routes.js';
import { dataLayerDirectRoutes } from './modules/data-layer/data-layer-direct.routes.js';
import { fieldRoutes } from './modules/field/field.routes.js';
import { navigationRoutes } from './modules/navigation/navigation.routes.js';
import { pageRoutes } from './modules/page/page.routes.js';
import { viewRoutes } from './modules/view/view.routes.js';
import { reportRoutes } from './modules/report/report.routes.js';
import { componentRoutes } from './modules/component/component.routes.js';
import { uploadRoutes } from './modules/upload/upload.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  // Register CORS
  await app.register(cors, {
    origin: true, // Allow all origins in production (or use specific domains)
    credentials: true,
  });

  // Register JWT
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  // Register multipart for file uploads
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
  });

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(appRoutes, { prefix: '/api/apps' });
  await app.register(dataLayerRoutes, { prefix: '/api/apps/:appId/data-layers' });
  await app.register(dataLayerDirectRoutes, { prefix: '/api/data-layers' });
  await app.register(fieldRoutes, { prefix: '/api/data-layers/:dataLayerId/fields' });
  await app.register(navigationRoutes, { prefix: '/api/apps/:appId/navigations' });
  await app.register(pageRoutes, { prefix: '/api/apps/:appId/pages' });
  await app.register(viewRoutes, { prefix: '/api/data-layers/:dataLayerId/views' });
  await app.register(reportRoutes, { prefix: '/api/data-layers/:dataLayerId/reports' });
  await app.register(componentRoutes, { prefix: '/api/apps/:appId/components' });
  await app.register(uploadRoutes, { prefix: '/api/apps/:appId/components/:componentId/upload' });

  return app;
}
