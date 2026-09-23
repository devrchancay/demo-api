# Plan

One route on the existing Fastify app, in the layering `/users` already uses: the store and
its logic in a service module, the HTTP shape in a route file, and `app.ts` only wiring them
together.

The store is a module-level `Map<string, Role>` in the service, filled with the two
starting roles when the module loads. A `Map` keeps insertion order, so listing returns
them in the order below without sorting. Only a read function is exposed in this
iteration; the `Map` is what later specs will write to.

## Inventory components

- fastify@5
- zod@3
- vitest

## Data

None on disk. In memory, the two starting roles, in this order:

```
id                                    name   description
7d2f4b8a-1c6e-4a3d-9f5b-2e8c0d4a6b17  admin  Administra usuarios, roles y la configuración del sistema
3a9c1e5d-6b2f-4d8a-b4e7-9c1f3a7d5e20  user   Usa el sistema con los permisos básicos de un usuario final
```

A role is `{ id, name, description }`, all strings. The `name` is a machine identifier and
stays in English; the `description` is product content and stays in Spanish.

## Shape of the route

| Route | Answers |
|---|---|
| `GET /roles` | 200 with the roles in the store, in insertion order |

The route takes no body, params or query, so there is nothing for zod to parse yet.
