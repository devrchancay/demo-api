import { buildApp } from './app.ts'
import { loadConfig } from './config.ts'

/**
 * Entry point. Binds the port the platform gives it and shuts down cleanly, because the
 * deploy replaces the container on every promotion.
 */
const config = loadConfig()
const app = await buildApp(config)

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    app.log.info({ signal }, 'shutting down')
    void app.close().then(() => process.exit(0))
  })
}

try {
  await app.listen({ port: config.PORT, host: config.HOST })
} catch (error) {
  app.log.error(error, 'the server could not start')
  process.exit(1)
}
