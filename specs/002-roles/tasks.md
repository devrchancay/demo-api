# Tasks

1. Add `src/services/roles.ts` with the catalogue and nothing else. Export a `Role`
   interface of `{ name, description }`, a module-level constant holding exactly two
   entries in this order — `admin` described as full access to the service, `user` as
   ordinary access — frozen so a caller cannot change it, and the two read functions
   `listRoles()` returning the catalogue and `findRole(name)` returning the role or
   `undefined`. No write function of any kind, because the catalogue is fixed in the code.

2. Add `src/routes/roles.ts` with `GET /roles` and `GET /roles/:name`, and register it in
   `src/app.ts` next to `userRoutes`. Parse `:name` with a zod schema as
   `src/routes/users.ts` parses its `:id`, answer 200 with the role and 404 when
   `findRole` returns nothing. Register no other method on either path, and keep the
   route file free of logic beyond that mapping.

3. Cover every acceptance criterion in `test/roles.test.ts` with `app.inject()`, never a
   real port, following `test/users.test.ts`. Include the two that are about behaviour
   rather than one call: that the order is `admin` then `user`, and that two calls in a
   row return the same body.
