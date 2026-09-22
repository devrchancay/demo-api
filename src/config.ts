import { z } from 'zod'

/**
 * Runtime contract for the service. Parsed once at startup so a missing or malformed
 * variable stops the process before it accepts a single request.
 *
 * The deploy target (`compose-local`) starts the container with exactly three variables:
 * `NODE_ENV=production`, `APP_ENV=dev|qa|prod` and `PORT=3000`. Everything else must have
 * a default, or the service will not boot in dev, qa or prod.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /** Which deployed environment this container is. `local` when nobody says otherwise. */
  APP_ENV: z.enum(['local', 'dev', 'qa', 'prod']).default('local'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  /**
   * Always `0.0.0.0` in a container: a service bound to `127.0.0.1` answers inside the
   * container and nowhere else, so the published port looks dead from the host.
   */
  HOST: z.string().min(1).default('0.0.0.0'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
  /**
   * Optional on purpose. `compose-local` deploys the container with no database, and the
   * sandbox that runs `pnpm check` has no Postgres either, so the service has to start and
   * answer `/health` without one.
   */
  DATABASE_URL: z.string().min(1).optional(),
})

export type Config = Readonly<z.infer<typeof envSchema>>

export type ConfigResult =
  | { readonly ok: true; readonly config: Config }
  | { readonly ok: false; readonly errors: readonly string[] }

/** Parses an arbitrary environment bag. Pure, so tests never touch `process.env`. */
export function parseConfig(env: NodeJS.ProcessEnv): ConfigResult {
  const parsed = envSchema.safeParse(env)
  if (parsed.success) {
    return { ok: true, config: Object.freeze(parsed.data) }
  }
  const errors = parsed.error.issues.map((issue) => {
    const path = issue.path.join('.')
    return path ? `${path}: ${issue.message}` : issue.message
  })
  return { ok: false, errors }
}

/** Reads `process.env` or exits with a readable list of what is wrong. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = parseConfig(env)
  if (!result.ok) {
    for (const error of result.errors) {
      console.error(`[config] ${error}`)
    }
    console.error('[config] copy .env.example to .env and fill it in')
    process.exit(1)
  }
  return result.config
}
