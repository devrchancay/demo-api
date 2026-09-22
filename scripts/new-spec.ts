#!/usr/bin/env -S node --experimental-strip-types
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Creates `specs/<NNN>-<slug>/` from the company templates.
 *
 * Usage: `pnpm spec:new 001 orders`
 *
 * It only copies files: the three documents are written by a human (or by
 * `/company:spec`), and `spec.yaml` comes later from `pnpm spec:manifest`.
 */
const SPECS_ROOT = 'specs'
const TEMPLATES = '.claude/skills/company/templates'

const DOCUMENTS = [
  ['spec-template.md', 'spec.md'],
  ['plan-template.md', 'plan.md'],
  ['tasks-template.md', 'tasks.md'],
] as const

async function main(): Promise<number> {
  const [id, slug] = process.argv.slice(2)

  if (id === undefined || slug === undefined) {
    console.error('usage: new-spec.ts <NNN> <slug>')
    return 2
  }
  // The poller reads the first three characters of the folder name as the spec id and
  // skips a folder that does not start with three digits, so this is not cosmetic.
  if (!/^\d{3}$/.test(id)) {
    console.error(`x id must be three digits, got '${id}'`)
    return 2
  }
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    console.error(`x slug must be kebab-case, got '${slug}'`)
    return 2
  }

  const dir = join(SPECS_ROOT, `${id}-${slug}`)
  const existing = await readdir(SPECS_ROOT).catch(() => [])
  if (existing.some((entry) => entry.startsWith(`${id}-`))) {
    console.error(`x spec ${id} already exists in ${SPECS_ROOT}`)
    return 1
  }

  await mkdir(dir, { recursive: true })
  for (const [template, target] of DOCUMENTS) {
    await copyFile(join(TEMPLATES, template), join(dir, target))
  }

  console.log(`v ${dir} created`)
  console.log('  1. fill in spec.md, plan.md and tasks.md')
  console.log(`  2. pnpm spec:manifest ${dir}`)
  console.log(`  3. pnpm spec:validate ${dir}`)
  console.log(
    `  4. git switch -c feature/${id}-${slug} && git add ${dir} && git push -u origin HEAD`,
  )
  return 0
}

main()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    console.error('new-spec.ts failed', error)
    process.exit(2)
  })
