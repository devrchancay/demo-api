import { afterEach, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.ts'
import { parseConfig } from '../src/config.ts'
import { checkDatabase } from '../src/services/health.ts'

function testConfig() {
  const result = parseConfig({ NODE_ENV: 'test', APP_ENV: 'local', LOG_LEVEL: 'silent' })
  if (!result.ok) throw new Error(result.errors.join('; '))
  return result.config
}

let app: Awaited<ReturnType<typeof buildApp>> | undefined

afterEach(async () => {
  await app?.close()
  app = undefined
})

describe('GET /health', () => {
  it('answers 200 with no database configured', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      status: 'ok',
      env: 'local',
      database: 'not-configured',
    })
  })
})

describe('checkDatabase', () => {
  it('reports a pool that answers as up', async () => {
    const pool = { query: async () => ({ rows: [] }) }

    expect(await checkDatabase(pool as never)).toBe('up')
  })

  it('reports a pool that throws as down instead of failing the request', async () => {
    const pool = {
      query: async () => {
        throw new Error('connection refused')
      },
    }

    expect(await checkDatabase(pool as never)).toBe('down')
  })
})
