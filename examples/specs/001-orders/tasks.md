# Tasks

1. Add `src/services/orders.ts` with an in-memory store: `createOrder({ item })` returning
   `{ id, item, createdAt }`, and `findOrder(id)` returning the order or `undefined`.
2. Add `src/routes/orders.ts` with `POST /orders` and `GET /orders/:id`, validating the
   body with zod, and register it in `src/app.ts`.
3. Cover the three acceptance criteria in `test/orders.test.ts` using `app.inject()`.
