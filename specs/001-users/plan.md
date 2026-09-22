# Plan

One route on the existing Fastify app, in the layering the service already uses for
`/health`: the store and its logic in a service module, the HTTP shape in a route file, and
`app.ts` only wiring them together.

The store is a module-level `Map<string, User>` in the service, filled with the three
starting users when the module loads. A `Map` keeps insertion order, so listing returns
them in the order below without sorting. Only a read function is exposed in this
iteration; the `Map` is what later specs will write to.

## Inventory components

- fastify@5
- zod@3
- vitest

## Data

None on disk. In memory, the three starting users, in this order:

```
id                                    firstName  lastName  address                              phone
5b1f0c2e-8a4d-4f6b-9e3a-1c7d2b8f4a61  María      Andrade   Av. 9 de Octubre 1204, Guayaquil      +593 99 412 3387
9c3e7a15-2d6b-4b8e-a1f4-6e0d3c9b2f78  Carlos     Mendoza   Calle Larga 7-45, Cuenca              +593 98 765 1120
e2a4d8b6-4c1f-4e9a-b7d3-8f5c1a0e6b93  Lucía      Villacís  Av. Amazonas N34-120, Quito           +593 96 230 5541
```

A user is `{ id, firstName, lastName, address, phone }`, all strings. The names and
addresses are product content and stay in Spanish.

## Shape of the route

| Route | Answers |
|---|---|
| `GET /users` | 200 with the users in the store, oldest first |

The route takes no body, params or query, so there is nothing for zod to parse yet.
