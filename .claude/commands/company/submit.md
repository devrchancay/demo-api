---
description: Commit a validated spec on its feature branch and push it for the agent
argument-hint: specs/NNN-slug
---

Push the spec in $ARGUMENTS so the platform agent picks it up.

1. Run `pnpm spec:validate $ARGUMENTS` first. If it does not exit 0, stop and report why:
   pushing a spec that fails the gate only produces a rejection issue.
2. Check the working tree with `git status`. Only the files under $ARGUMENTS belong in
   this commit; anything else has to be committed separately by the user.
3. Create the branch from `develop`: the spec folder is `specs/<NNN>-<slug>`, so the
   branch is `feature/<NNN>-<slug>`. The prefix `feature/` is what the agent polls.
4. Commit with `spec <NNN>: <what the feature is>` and push with `-u origin`.
5. Tell the user what to expect: the agent polls every 30 seconds, runs one sandbox per
   task in `tasks.md`, reviews the diff, runs `pnpm check`, and opens a pull request
   against `develop` — or an issue labelled `spec-rejected` if the gate refused it.
