import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createUser, deleteUser, findUser, listUsers, updateUser } from '../services/users.ts'

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

const updateUserSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'name or email is required',
  })

const idParamsSchema = z.object({
  id: z.string().min(1),
})

/**
 * CRUD for the user resource. Every route validates with zod before it touches the
 * service, which holds all the logic and knows nothing about Fastify.
 */
export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.post('/users', async (request, reply) => {
    const parsed = createUserSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message })
    }

    const result = createUser(parsed.data)
    if (!result.ok) {
      return reply.status(409).send({ error: 'email already belongs to another user' })
    }

    return reply.status(201).send(result.user)
  })

  app.get('/users', async () => listUsers())

  app.get('/users/:id', async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message })
    }

    const user = findUser(parsed.data.id)
    if (user === undefined) {
      return reply.status(404).send({ error: 'user not found' })
    }

    return reply.status(200).send(user)
  })

  app.patch('/users/:id', async (request, reply) => {
    const params = idParamsSchema.safeParse(request.params)
    if (!params.success) {
      return reply.status(400).send({ error: params.error.message })
    }

    const body = updateUserSchema.safeParse(request.body)
    if (!body.success) {
      return reply.status(400).send({ error: body.error.message })
    }

    const patch = {
      ...(body.data.name !== undefined ? { name: body.data.name } : {}),
      ...(body.data.email !== undefined ? { email: body.data.email } : {}),
    }
    const result = updateUser(params.data.id, patch)
    if (!result.ok) {
      const status = result.error === 'not-found' ? 404 : 409
      const error =
        result.error === 'not-found' ? 'user not found' : 'email already belongs to another user'
      return reply.status(status).send({ error })
    }

    return reply.status(200).send(result.user)
  })

  app.delete('/users/:id', async (request, reply) => {
    const parsed = idParamsSchema.safeParse(request.params)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.message })
    }

    const result = deleteUser(parsed.data.id)
    if (!result.ok) {
      return reply.status(404).send({ error: 'user not found' })
    }

    return reply.status(204).send()
  })
}
