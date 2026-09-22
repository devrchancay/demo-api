---
name: company
description: Write, validate and submit a spec the platform agent can build. Use whenever the user wants to add a feature to this project, create a spec, check whether a spec will be accepted, or push one for the agent to implement.
---

# Company spec workflow

A developer does not write the feature here: they write the spec, and the platform agent
writes the feature in a sandbox, reviews it, runs `pnpm check` and opens the pull request.
A spec that does not match the company inventory is rejected before any model runs, so the
whole job of this skill is to produce a spec that passes the gate.

## The three steps

1. **Write** — `/company:spec <description>` creates `specs/NNN-<slug>/` from
   `templates/` and fills in `spec.md`, `plan.md` and `tasks.md`.
2. **Validate** — `/company:validate specs/NNN-<slug>` generates `spec.yaml` and runs the
   exact gate the agent runs. Nothing is pushed until this passes.
3. **Submit** — `/company:submit specs/NNN-<slug>` commits the spec on
   `feature/NNN-<slug>` and pushes it. The agent picks it up on its next poll.

## Rules the gate enforces

- The folder is `specs/<NNN>-<slug>/` with three digits. `specs/orders` is never seen.
- All four files are required: `spec.md`, `plan.md`, `tasks.md`, `spec.yaml`.
- `spec.yaml` is strict: an unknown key is an error, and all eight fields are required.
  `id` is a quoted three-digit string, `template` is `name@X.Y.Z`, components are bare
  names or `name@major` and never scoped npm names (`biome`, not `@biomejs/biome`).
- A component that is not registered for `backend-api` in `inventory.yaml` is a rejection.
- Text rules read the prose: naming a forbidden technology in `spec.md`, `plan.md` or
  `tasks.md` is a rejection even when it never appears in `components`.
- Each item in `tasks.md` is one sandbox run. Write small, ordered, self-contained tasks.
- The sandbox has no database and no network services. Tests must pass without one.

## Commands

- `pnpm spec:new <NNN> <slug>` — the folder and the three documents from the templates.
- `pnpm spec:manifest specs/NNN-<slug>` — writes `spec.yaml` from `spec.md` and `plan.md`.
- `pnpm spec:validate specs/NNN-<slug>` — the verdict, with every reason at once.

## Files

- `templates/` — `spec-template.md`, `plan-template.md`, `tasks-template.md`.
- `scripts/gen-manifest.ts`, `scripts/validate.ts` — what the commands above run.
- `lib/` — a verbatim copy of the agent's gate (`schema.ts`, `inventory.ts`,
  `validate.ts`), plus `markdown.ts` for the generator. Never edit the copied three here;
  re-copy them from ai-platform when they change, and run `pnpm test:template`.
