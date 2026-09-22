# Plan

Two routes on the existing Fastify app, in the layering the service already uses for
`/health` and `/users`: the catalogue in a service module, the HTTP shape in a route file,
and `app.ts` only wiring them together.

The catalogue is a frozen module-level constant, not a `Map` and not a table. There is no
store to mutate, so the service has no write function at all.

## Inventory components

- fastify@5
- zod@3
- vitest

## Data

None on disk and none in memory beyond the constant itself:

```
3f1c2a8e-6b4d-4e2a-9c1f-8d7e5a4b3c21  Teclado mecánico      89.99
7a9d4b2c-1e3f-4a5b-8c6d-2f0e9b8a7c65  Mouse inalámbrico     24.5
c4e8f1a2-9b7d-4c3e-a5f6-1d2b3c4e5f78  Monitor 27 pulgadas   249
```

A product is `{ id, name, price }`: `id` a UUID string, `name` a non-empty string, `price`
a number. The names are product content and stay in Spanish.

## Shape of the routes

| Route | Answers |
|---|---|
| `GET /products` | 200 with the catalogue |
| `GET /products/:id` | 200 with the product - 400 id not a UUID - 404 unknown id |

## Validation

The `:id` parameter is parsed with a zod schema using `z.string().uuid()` before the
lookup. A malformed id is a 400; a well-formed UUID that no product has is a 404.
