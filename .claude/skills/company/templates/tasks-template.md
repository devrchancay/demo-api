# Tasks

<One item per task. Every item is a separate sandbox run, in order, each with its own
commit: keep them small, self-contained and phrased as an instruction. Refer to files by
path so the agent does not have to guess.>

1. Add `<route>` to `src/routes/<name>.ts` and register it in `src/app.ts`. It takes
   `{ <field>: string }`, answers 201 with `{ id, <field> }` and answers 400 when
   `<field>` is missing.
2. Put the logic in `src/services/<name>.ts` so the route only parses and answers.
3. Cover every acceptance criterion in `test/<name>.test.ts` with `app.inject()`.
