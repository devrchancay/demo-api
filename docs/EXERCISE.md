# The full exercise

End to end: a developer pushes a spec, the agent builds it, opens a pull request, merges
it and the environments come up. Two acts — a spec the gate refuses, and a real feature
that ships.

Everything below runs on one machine. `ai-platform` is the agent's repo; this one is the
project the agent works on.

## 0. Before the first run

**The project repo**

```bash
# 1. Create a repository from this template on GitHub (Settings -> Template repository
#    on this repo first, then "Use this template"), then clone it.
git clone https://github.com/<owner>/<repo>.git && cd <repo>

# 2. Rename the package.
#    package.json: "name": "<repo>", "description": "..."

# 3. The three environment branches. The agent never creates a branch.
git switch -c develop && git push -u origin develop
git switch -c qa && git push -u origin qa
git switch main && git push -u origin main

# 4. Green before anything else.
pnpm install && pnpm check       # the service: what the agent runs in its sandbox
pnpm test:template               # the template itself: the gate and the generator
```

**CI and the registry**

Push once to `develop` and let `.github/workflows/ci.yml` publish
`ghcr.io/<owner>/<repo>:develop`. Then open the package on GHCR and make it **public**:
the deployer pulls with no credentials and a private package fails with a 401 it reports
as "the image was never published".

**The token**

A fine-grained token on this repository with `contents: write`,
`pull_requests: write` and `issues: write`. Less than that and the agent gets a 403 in
the middle of a run.

**The agent**

```bash
cd ../ai-platform
cp .env.example .env     # then edit:
#   GITHUB_TOKEN=<the token>
#   GITHUB_REPO=<owner>/<repo>
#   DEMO_IMAGE=ghcr.io/<owner>/<repo>
#   LITELLM_MASTER_KEY / the provider key behind LiteLLM

pnpm install
pnpm sandbox:build       # the sandbox image, with its pnpm store warmed
pnpm up                  # litellm + agent
pnpm logs                # follow it in another terminal
```

The agent polls every 30 seconds. Nothing happens until a `feature/*` branch carries a
spec folder.

## Act 1 — the spec that is refused

The point: the gate is deterministic and costs nothing. No model runs.

```bash
cd <repo>
git switch develop && git switch -c feature/000-mobile-courier
mkdir -p specs/000-mobile-courier
cp examples/specs/000-mobile-courier/* specs/000-mobile-courier/

# The same verdict the agent will give, before pushing:
pnpm spec:validate specs/000-mobile-courier
#   x specs/000-mobile-courier rejected:
#     - flutter is not in the inventory for backend-api
#     - plan.md mentions flutter: mobile work ships with react-native only

git add specs/000-mobile-courier
git commit -m "spec 000: courier mobile app"
git push -u origin HEAD
```

Within one poll the agent opens an issue in the repo, labelled `spec-rejected`, listing
both reasons. No sandbox started, no tokens spent. Note that the second reason comes from
the prose of `plan.md`, not from the components list: a spec cannot smuggle a banned
technology past the gate by leaving it out of the manifest.

## Act 2 — the feature that ships

```bash
git switch develop && git switch -c feature/001-orders
mkdir -p specs/001-orders
cp examples/specs/001-orders/* specs/001-orders/

pnpm spec:validate specs/001-orders
#   v specs/001-orders accepted
#     001 orders - backend-api - template-backend-api@1.0.0 - risk low

git add specs/001-orders
git commit -m "spec 001: orders endpoint"
git push -u origin HEAD
```

What the agent does next, visible in `pnpm logs`:

1. **validate** — the gate passes; it reads `.specify/memory/constitution.md` and the
   inventory rules once and carries them through the run.
2. **develop** — one throwaway container per item in `tasks.md`, in order. Each one
   clones the branch, runs the coding agent, commits and pushes.
3. **review** — the accumulated diff against the constitution: `{ approved, issues }`.
4. **tests** — a sandbox that runs `pnpm check` and writes any test an acceptance
   criterion is missing.
5. A failed review or a failed check sends it back to **develop** with the reason, up to
   three rounds. After that: an issue labelled `needs-human`, and it stops.
6. **openPr** — a pull request against `develop` whose body carries the spec, the tasks,
   the verdicts, the token cost and the three environment URLs. Approved and green, it is
   squash merged.

## Act 3 — the environments

The merge into `develop` moves that branch's head, CI publishes
`ghcr.io/<owner>/<repo>:develop`, and the agent's next pass deploys it. If the image is
not there yet it retries with backoff for up to five minutes.

```bash
curl -s http://localhost:3001/health   # dev
```

Promote, which in a real setup is the pull request merge on GitHub:

```bash
cd ../ai-platform
pnpm approve 001 qa      # merges develop into qa
curl -s http://localhost:3002/health

pnpm approve 001 prod    # merges qa into main
curl -s http://localhost:3003/health
```

Each promotion moves the branch head, CI publishes the image with the new branch's tag
and the agent replaces the container for that environment.

Try the feature itself:

```bash
curl -s -X POST http://localhost:3003/orders \
  -H 'content-type: application/json' -d '{"item":"coffee"}'
```

## A rehearsal with no GitHub

`ai-platform` has a smoke run that stands up a throwaway project on a local git daemon and
drives the real agent against it — real sandboxes, real model, no GitHub account:

```bash
cd ../ai-platform
pnpm smoke          # the valid spec
pnpm smoke reject   # the refused one
```

Useful to check LiteLLM, the sandbox image and the graph before touching a real repo.

## When something goes wrong

| What you see | Where to look |
|---|---|
| The agent never picks the spec up | branch not prefixed `feature/`, or the folder is not `specs/<three digits>-<slug>` |
| Rejection issue you did not expect | run `pnpm spec:validate` locally; the reasons are identical |
| Three rounds and a `needs-human` issue | the sandbox log in `pnpm logs`: usually `pnpm check` failing for a reason the task cannot fix, or a test that needs a database |
| PR opened but not merged | review did not approve, or checks did not pass; both verdicts are in the PR body |
| `/health` refuses the connection | the service bound `127.0.0.1` instead of `0.0.0.0`, or it read a port other than `PORT` |
| Deploy reports the image was never published | CI did not run, the tag is not the branch name, or the GHCR package is private |
| Tasks time out | one item in `tasks.md` is doing too much; split it. The limit is `TASK_TIMEOUT_MS`, 15 minutes |
