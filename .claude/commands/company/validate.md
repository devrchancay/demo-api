---
description: Generate spec.yaml and run the exact gate the platform agent runs
argument-hint: specs/NNN-slug
---

Validate the spec in $ARGUMENTS before it is pushed.

1. Run `pnpm spec:manifest $ARGUMENTS` to write `spec.yaml` from `spec.md` and `plan.md`.
   If the spec already has a hand-written `spec.yaml` that is correct, keep it instead.
2. Read the generated `spec.yaml` and check `risk` by hand: the generator guesses `high`
   only from the words auth, payments and migrations.
3. Run `pnpm spec:validate $ARGUMENTS`.
4. Exit 0 means the agent will accept it. On exit 1, fix every reason it printed — they
   are all reported at once — and run it again. Exit 2 means the command or
   `inventory.yaml` is wrong, not the spec.
5. Report the verdict and, if it passed, tell the user they can run `/company:submit`.
