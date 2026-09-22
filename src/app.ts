import Fastify, { type FastifyInstance } from 'fastify'
import type { Config } from './config.ts'
import { registerDatabase } from './plugins/database.ts'
import { healthRoutes } from './routes/health.ts'

/**
 * Builds the service without listening, so a test can drive it with `app.inject()` and
 * never open a port. `server.ts` is the only place that binds one.
 *
 * Wiring order: plugins first (they decorate the instance), then routes.
 */
export async function buildApp(config: Config): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: config.LOG_LEVEL },
    // Trust the proxy in a deployed environment; locally there is none.
    trustProxy: config.APP_ENV !== 'local',
  })

  await registerDatabase(app, config)
  await app.register(async (instance) => healthRoutes(instance, config))

  return app
}
