#!/usr/bin/env -S node --experimental-strip-types
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { asScalar, bulletsUnder, frontmatterValue } from '../lib/markdown.ts'

/**
 * Writes `spec.yaml` from what a human already wrote in `spec.md` and `plan.md`, so the
 * manifest the agent parses is never typed twice.
 *
 * Usage: `pnpm spec:manifest specs/001-orders`
 *
 * Reads:
 *   - `spec.md` frontmatter: `id` and `project`.
 *   - `spec.md` section `## Acceptance criteria`: one bullet per criterion.
 *   - `plan.md` section `## Inventory components`: one `- name@version` per line.
 *
 * Everything else is fixed by the template. `risk` is `high` when the spec touches auth,
 * payments or migrations, and `low` otherwise: a guess a human is expected to correct.
 */

/** This template's identity. Every spec created from it declares exactly this. */
const TEMPLATE_REF = 'template-backend-api@1.0.0'
const PROJECT_TYPE = 'backend-api'
const DEPLOY_TARGET = 'compose-local'

/** A spec that touches one of these is high risk until a human says otherwise. */
const HIGH_RISK_TERMS = [
  'auth',
  'authentication',
  'authorization',
  'password',
  'token',
  'payment',
  'payments',
  'billing',
  'migration',
  'migrations',
]

async function main(): Promise<number> {
  const [specDir] = process.argv.slice(2)
  if (specDir === undefined) {
    console.error('usage: gen-manifest.ts <spec-dir>')
    return 2
  }

  const spec = await read(join(specDir, 'spec.md'))
  const plan = await read(join(specDir, 'plan.md'))
  if (spec === undefined || plan === undefined) {
    console.error(`x ${specDir} must contain spec.md and plan.md`)
    return 2
  }

  const problems: string[] = []
  const id = frontmatterValue(spec, 'id')
  const project = frontmatterValue(spec, 'project')
  const acceptance = bulletsUnder(spec, 'Acceptance criteria')
  const components = bulletsUnder(plan, 'Inventory components')

  if (id === undefined) problems.push("spec.md frontmatter has no 'id'")
  if (project === undefined) problems.push("spec.md frontmatter has no 'project'")
  if (acceptance.length === 0) problems.push("spec.md has no '## Acceptance criteria' bullets")
  if (components.length === 0) problems.push("plan.md has no '## Inventory components' bullets")

  if (id === undefined || project === undefined || problems.length > 0) {
    for (const problem of problems) {
      console.error(`x ${problem}`)
    }
    return 2
  }

  const manifest = [
    `id: '${id}'`,
    `project: ${project}`,
    `projectType: ${PROJECT_TYPE}`,
    `template: ${TEMPLATE_REF}`,
    `risk: ${riskOf(`${spec}\n${plan}`)}`,
    'components:',
    ...components.map((component) => `  - ${component}`),
    `deployTarget: ${DEPLOY_TARGET}`,
    'acceptance:',
    // A criterion is a plain scalar, so anything that would need quoting is stripped.
    ...acceptance.map((criterion) => `  - ${asScalar(criterion)}`),
    '',
  ].join('\n')

  const target = join(specDir, 'spec.yaml')
  await writeFile(target, manifest, 'utf8')
  console.log(`v ${target} written`)
  console.log('  review it, then run: pnpm spec:validate', specDir)
  return 0
}

/** `risk: high` the moment the prose mentions something that needs a careful reviewer. */
function riskOf(text: string): 'low' | 'high' {
  const lower = text.toLowerCase()
  return HIGH_RISK_TERMS.some((term) => new RegExp(`\\b${term}\\b`).test(lower)) ? 'high' : 'low'
}

async function read(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return undefined
  }
}

main()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    console.error('gen-manifest.ts failed', error)
    process.exit(2)
  })
