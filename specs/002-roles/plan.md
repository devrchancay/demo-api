# Plan

Two routes on the existing Fastify app, in the layering the service already uses for
`/health` and `/users`: the catalogue in a service module, the HTTP shape in a route file,
and `app.ts` only wiring them together.

The catalogue is a frozen module-level constant, not a `Map` and not a table. Unlike
`src/services/users.ts` there is no store to mutate, so the service has no write function
at all — that is what makes "only `GET`" a property of the code and not a promise in a
document.

Lookup by name is a scan of two entries. The name is the identifier, so there is no
generated id and nothing to keep unique at runtime.

## Inventory components

- fastify@5
- zod@3
- vitest

## Data

None on disk and none in memory beyond the constant itself:

```
admin  full access to the service
user   ordinary access to the service
```

A role is `{ name, description }`, both non-empty strings. The array is frozen so a route
cannot hand a caller something another caller could have changed.

## Shape of the routes

| Route | Answers |
|---|---|
| `GET /roles` | 200 with the catalogue, `admin` first |
| `GET /roles/:name` | 200 with the role - 404 unknown name |

No other method is registered for either path, so anything else answers Fastify's own 404.

## Validation

The `:name` parameter is parsed with a zod schema before the lookup, the same way
`src/routes/users.ts` parses its `:id`. An unknown name is a 404, not a 400: the shape of
the request was fine, the catalogue simply has no such entry.
