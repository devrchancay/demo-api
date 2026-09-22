# template-backend-api

The company template for a `backend-api` project: a Fastify service that the spec-driven
platform agent (`ai-platform`) can build features into, review, test and deploy.

Template identity: **`template-backend-api@1.0.0`**. Every `spec.yaml` in a project
created from it must carry exactly that string in `template:`, and the platform inventory
must have it registered, or every spec is rejected.

## What you get

```
src/                        the service: config, app, server, plugins, routes, services
test/                       the service's tests; this is what `pnpm check` runs
test-template/              the template's own tests; CI only, never the agent's sandbox
specs/                      where specs live; the agent polls this folder
examples/specs/             one spec that passes the gate and one that does not
.claude/skills/company/     the spec workflow: SKILL.md, templates, CLIs, the gate itself
.claude/commands/company/   /company:spec, /company:validate, /company:submit
.specify/memory/            constitution.md, injected into every agent prompt
inventory.yaml              a copy of the company inventory, for local validation
biome.json / tsconfig.json  this project; what `pnpm check` uses
*.template.json             the template's own files; what `pnpm test:template` uses
Dockerfile                  multi-stage image, runs on tsx, no build step
docker-compose.yml          local Postgres (the deployed environments are not here)
.github/workflows/ci.yml    pnpm check, then the image to GHCR tagged with the branch
docs/EXERCISE.md            the full run, end to end, command by command
```

## Create a project from it

1. On GitHub: **Use this template** → new repository. (Mark this repo as a template in
   Settings first.)
2. Rename `name` and `description` in `package.json`.
3. Create the three environment branches — the agent never creates a branch:
   ```
   git switch -c develop && git push -u origin develop
   git switch -c qa && git push -u origin qa
   git switch main
   ```
4. Point the platform at it: `GITHUB_REPO=<owner>/<repo>` and
   `DEMO_IMAGE=ghcr.io/<owner>/<repo>` in the agent's `.env`.
5. Push once to `develop` so CI publishes the first image, and make the GHCR package
   **public** — the deployer pulls without credentials.

## Daily commands

```
pnpm install
pnpm dev                    # the service on http://localhost:3000, reloading
pnpm check                  # biome + tsc + vitest. The only verdict that counts.
pnpm test:template          # the template's own tests: the gate and the generator
pnpm check:all              # both, for when you are changing the template itself
pnpm db:up                  # local Postgres, if you want one
pnpm spec:new 001 orders    # a spec folder from the templates
pnpm spec:manifest specs/001-orders
pnpm spec:validate specs/001-orders
```

## The contract with the platform

What the agent expects, and what breaks if it is not there:

| Thing | Value | Why |
|---|---|---|
| Spec folder | `specs/<NNN>-<slug>/` | the poller reads the first three digits as the spec id; a folder without them is skipped |
| Spec files | `spec.md`, `plan.md`, `tasks.md`, `spec.yaml` | all four required, and every missing one is reported at once |
| Branch | `feature/<NNN>-<slug>` | only the `feature/` prefix is polled |
| Pull request | opened against `develop`, squash merged | `develop`, `qa` and `main` must already exist |
| Check | `pnpm check` | run inside the sandbox; its exit code is the test verdict |
| Constitution | `.specify/memory/constitution.md` | optional, but it is what the reviewer holds the diff against |
| Image | `ghcr.io/<owner>/<repo>:<branch>` | the deployer pulls the tag that matches the branch: `develop`, `qa`, `main` |
| Container | `PORT=3000`, bound to `0.0.0.0` | published on 3001 dev, 3002 qa, 3003 prod |

Two things the agent does **not** do: it does not read CI status before merging (the
verdict is the sandbox's `pnpm check`), and it does not create branches or check that a
deployed container stayed up.

## Why there is no build step

The image runs `tsx src/server.ts`. The sandbox image the agent uses has its pnpm store
warmed with exactly `fastify@5 pg@8 zod@3 vitest biome typescript@5 tsx`, so an install
inside a task is close to instant, and one less build stage is one less thing for an
agent to get wrong. Imports carry the `.ts` extension for the same reason.

## Keeping the inventory in sync

`inventory.yaml` here is a copy for local validation; the agent loads its own. So is
`.claude/skills/company/lib/`, a verbatim copy of the agent's gate. When the platform
changes either, copy the change here — `pnpm test:template` fails the moment the two
disagree about the example specs.

That check lives in `test-template/` and **not** in `pnpm check` on purpose. `pnpm check`
is the verdict the agent gives a feature from inside its sandbox: if anything in there
depended on the company inventory, a change in ai-platform could fail a perfectly good
feature and the developer would get three failed rounds and an issue about something they
never asked for.

The split is complete, not just the test file: `biome.json` and `tsconfig.json` cover
`src/`, `test/` and `scripts/`, while `biome.template.json` and `tsconfig.template.json`
cover `.claude/` and `test-template/`. So a copied gate that stops compiling or stops
matching the house style fails `pnpm test:template` in CI and never the agent's run.
`pnpm check:all` runs both, which is what you want while editing the template itself.
