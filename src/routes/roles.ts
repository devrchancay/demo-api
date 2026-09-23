import type { FastifyInstance } from 'fastify'
import { listRoles } from '../services/roles.ts'

/** Reads the role list. No input to validate, so the route only answers. */
export async function roleRoutes(app: FastifyInstance): Promise<void> {
  app.get('/roles', async () => listRoles())
}
