# Tasks

<!-- One line per task, deliberately unwrapped: the agent's parser reads a task as the
     single line its bullet starts on, so a wrapped item reaches the sandbox cut in half. -->

1. Add `src/services/roles.ts` with the in-memory store and nothing else. Export a `Role` interface of `{ id, name, description }`, a module-level `Map<string, Role>` filled when the module loads with exactly the two roles listed in `specs/002-roles/plan.md`, in that order and with those fixed UUIDs and values, and a `listRoles()` function returning the roles in insertion order. No other export.
2. Add `src/routes/roles.ts` with `GET /roles` answering 200 with `listRoles()`, and register it in `src/app.ts` after `userRoutes`. Register no other method or path, and keep the route file free of logic.
3. Cover every acceptance criterion in `test/roles.test.ts` with `app.inject()`, never a real port, following `test/users.test.ts`: two roles, each with a UUID id and non-empty name and description, two distinct ids, the names `admin` then `user` in that order, and the same body on two calls in a row.
