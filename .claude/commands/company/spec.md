---
description: Create a new spec folder for the platform agent from the company templates
argument-hint: <description of the feature>
---

Write a new spec for this project so the platform agent can build it.

The feature to specify: $ARGUMENTS

Steps:

1. Read `.claude/skills/company/SKILL.md` and `inventory.yaml`. Everything below has to
   obey both.
2. Pick the next free three-digit id: look at the folders already in `specs/` and add one.
   Derive a kebab-case slug from the description.
3. Run `pnpm spec:new <NNN> <slug>`. It copies the three templates into
   `specs/<NNN>-<slug>/`.
4. Fill in the three documents:
   - `spec.md`: frontmatter `id` and `project`, the context, and one `## Acceptance
     criteria` bullet per checkable behaviour (request, response, status code).
   - `plan.md`: how it is built, and a `## Inventory components` list using only what
     `inventory.yaml` registers for `backend-api`.
   - `tasks.md`: a flat numbered list. Each item is one sandbox run: small, ordered,
     naming the files it touches.
5. Never name a technology that a text rule in `inventory.yaml` forbids, not even as an
   aside — the prose is scanned.
6. Finish by running `/company:validate specs/<NNN>-<slug>` and fixing whatever it
   reports. Do not push anything.
