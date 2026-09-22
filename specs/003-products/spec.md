---
id: '003'
project: products
---

# Products catalogue

The service needs a list of products a client can read. A product is an `id`, a `name` and
a `price`. There are three, mocked and fixed in the code: nobody creates, changes or
removes a product through the API, and nothing is persisted.

The `id` is a UUID. The three ids are fixed values written in the code, not generated at
startup, so a client can keep using the same id after the service restarts.

## Out of scope

- Creating, changing or removing a product. No `POST`, `PATCH`, `PUT` or `DELETE`.
- Persisting the catalogue anywhere.
- Stock, currency, categories, pagination or filtering.

## Acceptance criteria

- `GET /products` answers 200 with the three products of the catalogue.
- Every product in the answer carries an `id` that is a UUID, a non-empty `name` and a `price` that is a number.
- The three ids in the answer are all different.
- `GET /products/:id` answers 200 with the product that has that id.
- `GET /products/:id` answers 404 for a UUID that no product has.
- `GET /products/:id` answers 400 when the id is not a UUID.
