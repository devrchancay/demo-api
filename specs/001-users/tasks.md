# Tasks

1. Add `src/services/users.ts`: the in-memory store and all the logic, as the only module
   that touches it. A `User` is `{ id, name, email, createdAt, updatedAt }`, ids come from
   `crypto.randomUUID()`, and the store is a module-level `Map<string, User>`. Export
   `createUser({ name, email })`, `listUsers()`, `findUser(id)`,
   `updateUser(id, { name?, email? })` and `deleteUser(id)`. Report the two failures the
   routes have to turn into status codes without knowing about HTTP: a taken email and an
   unknown id — a discriminated result or a named error, whichever reads better with the
   rest of the file. `listUsers()` returns them oldest first.

2. Add `src/routes/users.ts` with the five routes, and register it in `src/app.ts` next to
   `healthRoutes`. Validate the bodies with zod: create requires a non-empty `name` and an
   `email` that passes `z.string().email()`; patch takes both as optional but rejects an
   empty object. Map the service's failures to their codes: invalid body 400, taken email
   409, unknown id 404, created 201, deleted 204 with no body. Do not put logic in the
   route file beyond that mapping.

3. Cover every acceptance criterion in `test/users.test.ts` with `app.inject()`, never a
   real port, following `test/health.test.ts`. Include the two that are about behaviour
   rather than one call: that `GET /users` starts empty, and that a user removed with
   `DELETE` no longer shows up in `GET /users`. Reset the store between tests so they do
   not depend on each other's order.
