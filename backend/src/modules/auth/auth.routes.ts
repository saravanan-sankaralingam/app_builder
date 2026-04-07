import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  getMeHandler,
  updateMeHandler,
} from './auth.controller.js';

export async function authRoutes(app: FastifyInstance) {
  // Public routes
  app.post('/register', registerHandler);
  app.post('/login', loginHandler);
  app.post('/refresh', refreshHandler);
  app.post('/logout', logoutHandler);

  // Protected routes
  app.get('/me', { preHandler: [authenticate] }, getMeHandler);
  app.put('/me', { preHandler: [authenticate] }, updateMeHandler);
}
