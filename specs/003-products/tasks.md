# Tasks

<!-- One line per task, deliberately unwrapped: the agent's parser reads a task as the
     single line its bullet starts on, so a wrapped item reaches the sandbox cut in half. -->

1. Add `src/services/products.ts` with the catalogue and nothing else. Export a `Product` interface of `{ id, name, price }`, a module-level constant holding exactly the three products listed in `specs/003-products/plan.md` with those fixed UUIDs, names and prices, frozen so a caller cannot change it, and the two read functions `listProducts()` returning the catalogue and `findProduct(id)` returning the product or `undefined`. No write function of any kind.
2. Add `src/routes/products.ts` with `GET /products` and `GET /products/:id`, and register it in `src/app.ts` next to `userRoutes`. Parse `:id` with a zod schema using `z.string().uuid()` and answer 400 when it fails, 404 when `findProduct` returns nothing and 200 with the product otherwise. Register no other method on either path, and keep the route file free of logic beyond that mapping.
3. Cover every acceptance criterion in `test/products.test.ts` with `app.inject()`, never a real port, following `test/users.test.ts`: three products each with a UUID id, a non-empty name and a numeric price, three distinct ids, 200 for a known id, 404 for an unknown UUID and 400 for an id that is not a UUID.
