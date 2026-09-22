# Plan

<How the feature is built, in prose: which routes, which services, which tables. Say what
is deliberately left out of this iteration.>

## Inventory components

<Only what is registered in inventory.yaml for backend-api, one per line, as
`- name@major` or `- name`. Anything else is an automatic rejection, and so is naming a
technology in the prose above that a text rule forbids.>

- fastify@5
- zod@3
- vitest

## Data

<Tables, columns and migrations, or "none in this iteration". The task sandbox has no
Postgres running, so tests must not need a live database.>
