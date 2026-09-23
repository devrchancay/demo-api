import { afterEach, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.ts'
import { parseConfig } from '../src/config.ts'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const startingRoles = [
  {
    id: '7d2f4b8a-1c6e-4a3d-9f5b-2e8c0d4a6b17',
    name: 'admin',
    description: 'Administra usuarios, roles y la configuración del sistema',
  },
  {
    id: '3a9c1e5d-6b2f-4d8a-b4e7-9c1f3a7d5e20',
    name: 'user',
    description: 'Usa el sistema con los permisos básicos de un usuario final',
  },
]

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

async function listRoles() {
  app ??= await buildApp(testConfig())

  return app.inject({ method: 'GET', url: '/roles' })
}

describe('GET /roles', () => {
  it('AC1 answers 200 with the two starting roles', async () => {
    const response = await listRoles()

    expect(response.statusCode).toBe(200)
    const roles: unknown = response.json()
    expect(Array.isArray(roles)).toBe(true)
    expect(roles).toHaveLength(2)
    expect(roles).toEqual(startingRoles)
  })

  it('AC2 carries a UUID id and a non-empty name and description on every role', async () => {
    const response = await listRoles()

    expect(response.statusCode).toBe(200)
    const roles = response.json() as Array<Record<string, unknown>>
    expect(roles).toHaveLength(2)

    for (const role of roles) {
      expect(typeof role.id).toBe('string')
      expect(role.id).toMatch(UUID)

      for (const field of ['name', 'description'] as const) {
        expect(typeof role[field]).toBe('string')
        expect(String(role[field]).trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('AC3 answers two ids that are all different', async () => {
    const response = await listRoles()

    expect(response.statusCode).toBe(200)
    const roles = response.json() as Array<{ id: string }>
    const ids = roles.map((role) => role.id)

    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
  })

  it('AC4 answers the names admin and user, in that order', async () => {
    const response = await listRoles()

    expect(response.statusCode).toBe(200)
    const roles = response.json() as Array<{ name: string }>

    expect(roles.map((role) => role.name)).toEqual(['admin', 'user'])
  })

  it('AC5 answers exactly the same body on two calls in a row', async () => {
    const first = await listRoles()
    const second = await listRoles()

    expect(first.statusCode).toBe(200)
    expect(second.statusCode).toBe(200)
    expect(second.body).toBe(first.body)
  })
})
