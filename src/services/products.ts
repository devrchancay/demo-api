export interface Product {
  readonly id: string
  readonly name: string
  readonly price: number
}

const catalogue: readonly Product[] = Object.freeze([
  Object.freeze({
    id: '3f1c2a8e-6b4d-4e2a-9c1f-8d7e5a4b3c21',
    name: 'Teclado mecánico',
    price: 89.99,
  }),
  Object.freeze({
    id: '7a9d4b2c-1e3f-4a5b-8c6d-2f0e9b8a7c65',
    name: 'Mouse inalámbrico',
    price: 24.5,
  }),
  Object.freeze({
    id: 'c4e8f1a2-9b7d-4c3e-a5f6-1d2b3c4e5f78',
    name: 'Monitor 27 pulgadas',
    price: 249,
  }),
])

export function listProducts(): readonly Product[] {
  return catalogue
}

export function findProduct(id: string): Product | undefined {
  return catalogue.find((p) => p.id === id)
}
