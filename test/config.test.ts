import { describe, expect, it } from 'vitest'
import { parseConfig } from '../src/config.ts'

describe('parseConfig', () => {
  it('starts with nothing but the three variables a deploy provides', () => {
    const result = parseConfig({ NODE_ENV: 'production', APP_ENV: 'qa', PORT: '3000' })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.config.PORT).toBe(3000)
    expect(result.config.APP_ENV).toBe('qa')
    // A container must not bind the loopback interface or the published port looks dead.
    expect(result.config.HOST).toBe('0.0.0.0')
    expect(result.config.DATABASE_URL).toBeUndefined()
  })

  it('defaults every optional variable so an empty environment still boots', () => {
    const result = parseConfig({})

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.config).toMatchObject({
      NODE_ENV: 'development',
      APP_ENV: 'local',
      PORT: 3000,
      LOG_LEVEL: 'info',
    })
  })

  it('reports every malformed variable instead of the first one', () => {
    const result = parseConfig({ PORT: 'http', APP_ENV: 'staging' })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors).toHaveLength(2)
    expect(result.errors.join(' ')).toContain('PORT')
    expect(result.errors.join(' ')).toContain('APP_ENV')
  })
})
