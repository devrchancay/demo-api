import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.ts'
import { parseConfig } from '../src/config.ts'
import { resetUsers } from '../src/services/users.ts'

function testConfig() {
  const result = parseConfig({ NODE_ENV: 'test', APP_ENV: 'local', LOG_LEVEL: 'silent' })
  if (!result.ok) throw new Error(result.errors.join('; '))
  return result.config
}

let app: Awaited<ReturnType<typeof buildApp>> | undefined

beforeEach(() => {
  resetUsers()
})

afterEach(async () => {
  await app?.close()
  app = undefined
})

async function createUser(name: string, email: string) {
  if (!app) throw new Error('app is not built')
  return app.inject({ method: 'POST', url: '/users', payload: { name, email } })
}

describe('POST /users', () => {
  it('answers 201 with the created user, carrying an id the caller did not send', async () => {
    app = await buildApp(testConfig())

    const response = await createUser('Ada Lovelace', 'ada@example.com')

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com' })
    expect(typeof body.id).toBe('string')
    expect(body.id.length).toBeGreaterThan(0)
  })

  it('answers 400 when name is missing', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { email: 'ada@example.com' },
    })

    expect(response.statusCode).toBe(400)
  })

  it('answers 400 when email is not an email', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: { name: 'Ada Lovelace', email: 'not-an-email' },
    })

    expect(response.statusCode).toBe(400)
  })

  it('answers 409 when email already belongs to another user', async () => {
    app = await buildApp(testConfig())

    await createUser('Ada Lovelace', 'ada@example.com')
    const response = await createUser('Grace Hopper', 'ada@example.com')

    expect(response.statusCode).toBe(409)
  })
})

describe('GET /users', () => {
  it('answers 200 with an empty list when there are none', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({ method: 'GET', url: '/users' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([])
  })

  it('answers 200 with the list of users', async () => {
    app = await buildApp(testConfig())

    await createUser('Ada Lovelace', 'ada@example.com')
    await createUser('Grace Hopper', 'grace@example.com')

    const response = await app.inject({ method: 'GET', url: '/users' })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toHaveLength(2)
    expect(body).toMatchObject([
      { name: 'Ada Lovelace', email: 'ada@example.com' },
      { name: 'Grace Hopper', email: 'grace@example.com' },
    ])
  })
})

describe('GET /users/:id', () => {
  it('answers 200 with the user', async () => {
    app = await buildApp(testConfig())

    const created = await createUser('Ada Lovelace', 'ada@example.com')
    const id = created.json().id as string

    const response = await app.inject({ method: 'GET', url: `/users/${id}` })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ id, name: 'Ada Lovelace', email: 'ada@example.com' })
  })

  it('answers 404 when no user has that id', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({ method: 'GET', url: '/users/does-not-exist' })

    expect(response.statusCode).toBe(404)
  })
})

describe('PATCH /users/:id', () => {
  it('answers 200 with the updated user, taking name and email', async () => {
    app = await buildApp(testConfig())

    const created = await createUser('Ada Lovelace', 'ada@example.com')
    const id = created.json().id as string

    const response = await app.inject({
      method: 'PATCH',
      url: `/users/${id}`,
      payload: { name: 'Ada Byron', email: 'ada.byron@example.com' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      id,
      name: 'Ada Byron',
      email: 'ada.byron@example.com',
    })
  })

  it('answers 200 with the updated user, taking only name', async () => {
    app = await buildApp(testConfig())

    const created = await createUser('Ada Lovelace', 'ada@example.com')
    const id = created.json().id as string

    const response = await app.inject({
      method: 'PATCH',
      url: `/users/${id}`,
      payload: { name: 'Ada Byron' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({ id, name: 'Ada Byron', email: 'ada@example.com' })
  })

  it('answers 200 with the updated user, taking only email', async () => {
    app = await buildApp(testConfig())

    const created = await createUser('Ada Lovelace', 'ada@example.com')
    const id = created.json().id as string

    const response = await app.inject({
      method: 'PATCH',
      url: `/users/${id}`,
      payload: { email: 'ada.byron@example.com' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      id,
      name: 'Ada Lovelace',
      email: 'ada.byron@example.com',
    })
  })

  it('answers 404 when no user has that id', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({
      method: 'PATCH',
      url: '/users/does-not-exist',
      payload: { name: 'Ada Byron' },
    })

    expect(response.statusCode).toBe(404)
  })
})

describe('DELETE /users/:id', () => {
  it('answers 204 with no body', async () => {
    app = await buildApp(testConfig())

    const created = await createUser('Ada Lovelace', 'ada@example.com')
    const id = created.json().id as string

    const response = await app.inject({ method: 'DELETE', url: `/users/${id}` })

    expect(response.statusCode).toBe(204)
    expect(response.body).toBe('')
  })

  it('answers 404 when no user has that id', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({ method: 'DELETE', url: '/users/does-not-exist' })

    expect(response.statusCode).toBe(404)
  })

  it('a user removed with DELETE is gone from GET /users', async () => {
    app = await buildApp(testConfig())

    const created = await createUser('Ada Lovelace', 'ada@example.com')
    const id = created.json().id as string

    await app.inject({ method: 'DELETE', url: `/users/${id}` })
    const response = await app.inject({ method: 'GET', url: '/users' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([])
  })
})
