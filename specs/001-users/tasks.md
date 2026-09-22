# Tasks

<!-- One line per task, deliberately unwrapped: the agent's parser reads a task as the
     single line its bullet starts on, so a wrapped item reaches the sandbox cut in half. -->

1. Add `src/services/users.ts` with the in-memory store and nothing else. Export a `User` interface of `{ id, firstName, lastName, address, phone }`, a module-level `Map<string, User>` filled when the module loads with exactly the three users listed in `specs/001-users/plan.md`, in that order and with those fixed UUIDs and values, and a `listUsers()` function returning the users oldest first. No other export.
2. Add `src/routes/users.ts` with `GET /users` answering 200 with `listUsers()`, and register it in `src/app.ts` after `healthRoutes`. Register no other method or path, and keep the route file free of logic.
3. Cover every acceptance criterion in `test/users.test.ts` with `app.inject()`, never a real port, following `test/health.test.ts`: three users, each with a UUID id and non-empty firstName, lastName, address and phone, three distinct ids, the order given in the plan, and the same body on two calls in a row.
