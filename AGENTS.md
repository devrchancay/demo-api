# AGENTS.md

Read this before writing a single line. It is read by the coding agent that runs in the
platform sandbox (OpenCode) and by anyone using Claude Code in this repo.

## What this service is

A Fastify HTTP API on Node 22, TypeScript strict, ESM, run through `tsx` with no build
step. It is created from `template-backend-api@1.0.0` and deployed as a container.

## The one command

```
pnpm check      # biome + tsc --noEmit + vitest. This is the verdict.
```

It runs the service's own tests, in `test/`. The template's tests live in `test-template/`
and run in CI through `pnpm test:template`; they are not your business and not part of
the verdict.

Nothing is finished until `pnpm check` is green. Do not run the three parts separately and
call it done; do not weaken or delete a test to make it pass.

## Hard rules

- **Only the dependencies in `inventory.yaml`**, at the registered major: `fastify@5`,
  `pg@8`, `zod@3`, `vitest`, `biome`. Adding anything else is a rejection, not a
  judgement call. Never run `pnpm add` for something outside that list.
- **No `any`, no non-null assertion (`!`), no unused export.** The compiler is strict and
  biome treats these as errors.
- **Imports carry the `.ts` extension** (`import { buildApp } from './app.ts'`). That is
  how this project runs; a `.js` extension or an extensionless import will not resolve.
- **No database in tests.** The sandbox has no Postgres and no network services. Use
  `app.inject()` and fakes. `app.db` is `undefined` when `DATABASE_URL` is not set, and
  the code has to keep working in that state.
- **Never touch** `specs/`, `.specify/`, `.claude/`, `test-template/`, `inventory.yaml`
  or `.github/workflows/` unless the task says so in those words.
- Follow `.specify/memory/constitution.md`. It wins over habit.

## Where things go

```
src/config.ts          env parsed with zod, once, at startup
src/app.ts             builds the app, registers plugins then routes, never listens
src/server.ts          the only file that binds a port
src/plugins/           things that decorate the app (database)
src/routes/            parse the request, call a service, answer
src/services/          the logic; knows nothing about Fastify
test/                  one file per module, named after it
test-template/         the template's own tests; leave them alone
```

A route validates its input with zod, calls a service and answers. Logic in a route is a
review rejection.

## Runtime contract

The deployed container gets exactly `NODE_ENV=production`, `APP_ENV=dev|qa|prod` and
`PORT=3000`. Everything else must have a working default, and the server binds `0.0.0.0`.
Do not add a required environment variable without a default.

## Language

All code artifacts are English: identifiers, files, comments, tests, commit messages,
logs. What an API consumer reads keeps the product's language.
