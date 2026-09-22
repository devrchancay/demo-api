import { afterEach, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.ts'
import { parseConfig } from '../src/config.ts'

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

const TEKLADO_ID = '3f1c2a8e-6b4d-4e2a-9c1f-8d7e5a4b3c21'

describe('GET /products', () => {
  it('answers 200 with the three products of the catalogue (AC1)', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({ method: 'GET', url: '/products' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toHaveLength(3)
  })

  it('every product carries an id that is a UUID, a non-empty name and a price that is a number (AC2)', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({ method: 'GET', url: '/products' })
    const products = response.json() as Array<{ id: string; name: string; price: number }>

    for (const product of products) {
      expect(product).toHaveProperty('id')
      expect(typeof product.id).toBe('string')
      expect(product.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
      expect(product).toHaveProperty('name')
      expect(typeof product.name).toBe('string')
      expect(product.name.length).toBeGreaterThan(0)
      expect(product).toHaveProperty('price')
      expect(typeof product.price).toBe('number')
    }
  })

  it('the three ids in the answer are all different (AC3)', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({ method: 'GET', url: '/products' })
    const products = response.json() as Array<{ id: string }>
    const ids = products.map((p) => p.id)

    expect(new Set(ids).size).toBe(3)
  })
})

describe('GET /products/:id', () => {
  it('answers 200 with the product that has that id (AC4)', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({ method: 'GET', url: `/products/${TEKLADO_ID}` })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toMatchObject({
      id: TEKLADO_ID,
      name: 'Teclado mecánico',
      price: 89.99,
    })
  })

  it('answers 404 for a UUID that no product has (AC5)', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({
      method: 'GET',
      url: '/products/00000000-0000-0000-0000-000000000000',
    })

    expect(response.statusCode).toBe(404)
  })

  it('answers 400 when the id is not a UUID (AC6)', async () => {
    app = await buildApp(testConfig())

    const response = await app.inject({ method: 'GET', url: '/products/not-a-uuid' })

    expect(response.statusCode).toBe(400)
  })
})
