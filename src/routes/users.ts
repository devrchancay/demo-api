import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { createUser, deleteUser, findUser, listUsers, updateUser } from '../services/users.ts'

/**
 * The user resource: an in-memory store and all the logic around it. Nothing here knows
 * about Fastify or HTTP; a route maps the results below to status codes.
 */
export async function userRoutes(app: FastifyInstance): Promise<void> {
  // POST /users
  app.post(
    '/users',
    {
      schema: {
        body: z.object({
          name: z.string().min(1),
          email: z.string().email(),
        }),
        response: {
          201: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
          400: z.object({
            error: z.literal('invalid-body'),
          }),
          409: z.object({
            error: z.literal('email-taken'),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = createUser(request.body as { name: string; email: string })
      if (!result.ok) {
        if (result.error === 'email-taken') {
          return reply.status(409).send({ error: 'email-taken' })
        }
        return reply.status(400).send({ error: 'invalid-body' })
      }
      return reply.status(201).send(result.user)
    }
  )

  // GET /users
  app.get(
    '/users',
    {
      schema: {
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              email: z.string().email(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
          ),
        },
      },
    },
    async (_request, reply) => {
      return reply.send(listUsers())
    }
  )

  // GET /users/:id
  app.get(
    '/users/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
          404: z.object({
            error: z.literal('not-found'),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = findUser((request.params as { id: string }).id)
      if (user === undefined) {
        return reply.status(404).send({ error: 'not-found' })
      }
      return reply.send(user)
    }
  )

  // PATCH /users/:id
  app.patch(
    '/users/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: z
          .object({
            name: z.string().min(1).optional(),
            email: z.string().email().optional(),
          })
          .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field (name or email) must be provided',
          }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
          400: z.object({
            error: z.literal('invalid-body'),
          }),
          404: z.object({
            error: z.literal('not-found'),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = updateUser((request.params as { id: string }).id, request.body as { name?: string; email?: string })
      if (!result.ok) {
        if (result.error === 'not-found') {
          return reply.status(404).send({ error: 'not-found' })
        }
        return reply.status(400).send({ error: 'invalid-body' })
      }
      return reply.send(result.user)
    }
  )

  // DELETE /users/:id
  app.delete(
    '/users/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        response: {
          204: z.null(),
          404: z.object({
            error: z.literal('not-found'),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = deleteUser((request.params as { id: string }).id)
      if (!result.ok) {
        return reply.status(404).send({ error: 'not-found' })
      }
      return reply.status(204).send(null)
    }
  )
}
