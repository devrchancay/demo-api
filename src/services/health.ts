import type { Pool } from 'pg'

/** What `/health` reports about the database behind the service. */
export type DatabaseStatus = 'up' | 'down' | 'not-configured'

export interface HealthReport {
  readonly status: 'ok' | 'degraded'
  readonly env: string
  readonly uptimeSeconds: number
  readonly database: DatabaseStatus
}

/**
 * A database that is configured but unreachable makes the service `degraded`, never
 * `down`: the container still answers, and an environment with no database at all is a
 * valid deployment here.
 */
export async function checkDatabase(db: Pool | undefined): Promise<DatabaseStatus> {
  if (db === undefined) return 'not-configured'
  try {
    await db.query('select 1')
    return 'up'
  } catch {
    return 'down'
  }
}

export async function buildHealthReport(
  db: Pool | undefined,
  env: string,
  uptimeSeconds: number,
): Promise<HealthReport> {
  const database = await checkDatabase(db)
  return {
    status: database === 'down' ? 'degraded' : 'ok',
    env,
    uptimeSeconds: Math.round(uptimeSeconds),
    database,
  }
}
