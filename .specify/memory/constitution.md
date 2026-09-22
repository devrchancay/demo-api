# Constitution

The rules of this project. The platform agent reads this file at the start of every run
and puts it in front of every subagent and of the reviewer, above the inventory rules. A
diff that breaks one of these is rejected in review, so keep the list short and enforceable.

## Architecture

- A route parses and answers. The logic lives in `src/services/`, which knows nothing
  about Fastify and is testable on its own.
- Plugins in `src/plugins/` decorate the app. They are registered in `src/app.ts`, before
  the routes, and nowhere else.
- `src/app.ts` builds the app without listening. `src/server.ts` is the only file that
  binds a port.

## Validation and errors

- Every route validates its body, its params and its query with zod before touching a
  service. An unvalidated request never reaches the database.
- A rejected request answers 400 with a body the caller can act on. A duplicate answers
  409. Never answer 200 to something that failed.
- Error messages shown to an API consumer are the product's language; identifiers,
  comments and logs are English.

## Data

- No query outside a service. No SQL string built by concatenation: parameters always.
- `app.db` is `undefined` when the environment has no database. Handle that case; never
  assert it away.

## Tests

- Every acceptance criterion in the spec has a test that would fail without the feature.
- Tests run with no network and no database: use `app.inject()` and fakes. The sandbox
  that runs `pnpm check` has no Postgres.
- A test is never weakened or deleted to make `pnpm check` pass.

## Dependencies

- Only what `inventory.yaml` registers for `backend-api`, at the registered major.
  Adding anything else is a rejection, not a judgement call.
- No `any`, no non-null assertion. `pnpm check` is green before anything is pushed.
