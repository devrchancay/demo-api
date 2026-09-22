---
id: '001'
project: orders
---

# Orders endpoint

A client creates an order with a single call and reads it back by id. This is the first
feature of the service, so it defines the shape the rest will follow.

## Out of scope

- Payment of the order.
- Any notification to the customer.

## Acceptance criteria

- `POST /orders` answers 201 with the created order and its id.
- A request with no `item` answers 400.
- `GET /orders/:id` answers 200 with the order, and 404 when it does not exist.
