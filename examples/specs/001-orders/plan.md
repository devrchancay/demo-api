# Plan

Two routes on the existing Fastify app, one service holding the logic, one zod schema for
the body. No database in this iteration: the orders live in an in-memory map inside the
service, so the tests run in a sandbox with no Postgres.

## Inventory components

- fastify@5
- zod@3
- vitest

## Data

None. The in-memory store is replaced by a table in a later spec, which is when `pg@8`
enters the components list.
