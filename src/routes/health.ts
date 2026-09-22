import type { FastifyInstance } from 'fastify'
import type { Config } from '../config.ts'
import { buildHealthReport } from '../services/health.ts'

/**
 * The one route every project of this type ships with. It is how a human checks a
 * deployed environment: `curl http://localhost:3001/health` for dev, 3002 qa, 3003 prod.
 */
export async function healthRoutes(app: FastifyInstance, config: Config): Promise<void> {
  app.get('/health', async () => buildHealthReport(app.db, config.APP_ENV, process.uptime()))
}
