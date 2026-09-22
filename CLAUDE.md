# CLAUDE.md

Read `AGENTS.md` first: it holds the rules for anything that writes code here, and this
file does not repeat them.

## What a developer does in this repo

Features are not written by hand. A developer writes a spec and the platform agent builds
it. The workflow is the `company` skill in `.claude/skills/company/`:

1. `/company:spec <description>` — creates `specs/NNN-<slug>/` from the templates.
2. `/company:validate specs/NNN-<slug>` — generates `spec.yaml` and runs the same gate the
   agent runs. A rejection here is a rejection there.
3. `/company:submit specs/NNN-<slug>` — pushes it on `feature/NNN-<slug>`.

Then the agent takes over: one sandbox per task in `tasks.md`, a review of the diff,
`pnpm check`, and a pull request against `develop`.

## What to check before asking the agent for anything

- Is the component in `inventory.yaml` for `backend-api`? If not, the spec is rejected.
- Does any of the three documents name a forbidden technology in prose? Same rejection.
- Is the folder `specs/<three digits>-<slug>` and is the branch `feature/<same>`?
- Are the tasks small and ordered? Each one is a separate sandbox run.

## Direct edits

Fixing the template itself, the CI, the Dockerfile or the skill is normal hand work: those
are not specs. `pnpm check` still has to be green, and if you touched the skill, its copy
of the gate or `inventory.yaml`, run `pnpm test:template` as well — that one is kept out
of `pnpm check` so nothing about the company inventory can fail a feature inside the
agent's sandbox.
