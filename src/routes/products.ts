import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { findProduct, listProducts } from '../services/products.ts'

const idParamsSchema = z.object({
  id: z.string().uuid(),
})

export async function productRoutes(app: FastifyInstance): Promise<void> {
  app.get('/products', async () => listProducts())

  app.get('/products/:id', async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message })
    }

    const product = findProduct(parsed.data.id)
    if (product === undefined) {
      return reply.status(404).send({ error: 'product not found' })
    }

    return reply.status(200).send(product)
  })
}
