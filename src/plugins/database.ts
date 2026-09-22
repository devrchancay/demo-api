import type { FastifyInstance } from 'fastify'
import { Pool } from 'pg'
import type { Config } from '../config.ts'

/**
 * Postgres, when there is one. The pool is created lazily and the plugin is a no-op
 * without `DATABASE_URL`, because the service has to boot in an environment that has no
 * database: the deploy runs a bare container and the task sandbox has no services at all.
 *
 * Routes read `app.db`, which is `undefined` when no database is configured. Handle that
 * case instead of asserting it away.
 */
declare module 'fastify' {
  interface FastifyInstance {
    readonly db: Pool | undefined
  }
}

export async function registerDatabase(app: FastifyInstance, config: Config): Promise<void> {
  if (config.DATABASE_URL === undefined) {
    app.decorate('db', undefined)
    app.log.warn('DATABASE_URL is not set, the service starts without a database')
    return
  }

  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    // A request should fail fast instead of hanging on a database that is not there.
    connectionTimeoutMillis: 5_000,
    max: 10,
  })

  app.decorate('db', pool)
  app.addHook('onClose', async () => {
    await pool.end()
  })
}
