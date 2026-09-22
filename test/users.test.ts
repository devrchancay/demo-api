import { afterEach, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.ts'
import { parseConfig } from '../src/config.ts'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const startingUsers = [
  {
    id: '5b1f0c2e-8a4d-4f6b-9e3a-1c7d2b8f4a61',
    firstName: 'María',
    lastName: 'Andrade',
    address: 'Av. 9 de Octubre 1204, Guayaquil',
    phone: '+593 99 412 3387',
  },
  {
    id: '9c3e7a15-2d6b-4b8e-a1f4-6e0d3c9b2f78',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    address: 'Calle Larga 7-45, Cuenca',
    phone: '+593 98 765 1120',
  },
  {
    id: 'e2a4d8b6-4c1f-4e9a-b7d3-8f5c1a0e6b93',
    firstName: 'Lucía',
    lastName: 'Villacís',
    address: 'Av. Amazonas N34-120, Quito',
    phone: '+593 96 230 5541',
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

async function listUsers() {
  app ??= await buildApp(testConfig())

  return app.inject({ method: 'GET', url: '/users' })
}

describe('GET /users', () => {
  it('AC1 answers 200 with the three starting users', async () => {
    const response = await listUsers()

    expect(response.statusCode).toBe(200)
    const users: unknown = response.json()
    expect(Array.isArray(users)).toBe(true)
    expect(users).toHaveLength(3)
    expect(users).toEqual(startingUsers)
  })

  it('AC2 carries a UUID id and non-empty firstName, lastName, address and phone on every user', async () => {
    const response = await listUsers()

    expect(response.statusCode).toBe(200)
    const users = response.json() as Array<Record<string, unknown>>
    expect(users).toHaveLength(3)

    for (const user of users) {
      expect(typeof user.id).toBe('string')
      expect(user.id).toMatch(UUID)

      for (const field of ['firstName', 'lastName', 'address', 'phone'] as const) {
        expect(typeof user[field]).toBe('string')
        expect(String(user[field]).trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('AC3 answers three ids that are all different', async () => {
    const response = await listUsers()

    expect(response.statusCode).toBe(200)
    const users = response.json() as Array<{ id: string }>
    const ids = users.map((user) => user.id)

    expect(ids).toHaveLength(3)
    expect(new Set(ids).size).toBe(3)
  })

  it('AC4 lists the starting users in the order the plan gives them', async () => {
    const response = await listUsers()

    expect(response.statusCode).toBe(200)
    const users = response.json() as Array<{ id: string; firstName: string }>

    expect(users.map((user) => user.id)).toEqual(startingUsers.map((user) => user.id))
    expect(users.map((user) => user.firstName)).toEqual(startingUsers.map((user) => user.firstName))
  })

  it('AC5 answers exactly the same body on two calls in a row', async () => {
    const first = await listUsers()
    const second = await listUsers()

    expect(first.statusCode).toBe(200)
    expect(second.statusCode).toBe(200)
    expect(second.body).toBe(first.body)
  })
})
