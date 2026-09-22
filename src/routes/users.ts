import type { FastifyInstance } from 'fastify'
import { listUsers } from '../services/users.ts'

/** Reads the user list. No input to validate, so the route only answers. */
export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.get('/users', async () => listUsers())
}
