# Example specs

Two specs kept out of `specs/` on purpose: the agent polls `specs/` and would try to build
anything that lands there.

- `001-orders` — a valid spec. Copy it into `specs/` to see the whole pipeline run.
- `000-mobile-courier` — rejected by the gate twice over: `flutter` is not a registered
  component, and the prose of `plan.md` names it, which a text rule forbids on its own.

Both are validated by `test-template/spec-gate.test.ts` (`pnpm test:template`), so they
cannot rot silently: if the company inventory changes and the copy in this repo is not
updated, that test fails in CI. It is kept out of `pnpm check` so it can never fail a
feature inside the agent's sandbox.
