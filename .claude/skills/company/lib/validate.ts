/*
 * Copied verbatim from ai-platform/src/validate.ts. Do not edit here.
 *
 * The plan left the choice open between publishing ai-platform's `src/` as a package and
 * copying these three modules next to the skill. This template copies them: a project
 * created from the template must validate a spec with no access to the agent's repo and
 * no private registry. The cost is that a change in ai-platform has to be re-copied, which
 * `pnpm check` catches the moment the verdicts drift — see test/spec-gate.test.ts.
 *
 * These modules target zod 3, the major this project type is pinned to in the inventory.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import {
  findForbiddenMentions,
  isComponentAllowed,
  isDeployTargetAllowed,
  isTemplateRegistered,
} from './inventory.ts'
import { type Inventory, parseManifest, type SpecManifest } from './schema.ts'

/**
 * Deterministic gate. No LLM ever runs here: a spec that asks for something outside the
 * inventory is rejected on the reasons below, the same way every time.
 */

/** The documents Spec Kit produces, all three required. */
export const REQUIRED_DOCUMENTS = ['spec.md', 'plan.md', 'tasks.md'] as const

export const MANIFEST_FILE = 'spec.yaml'

/** Every file a spec folder must carry, the manifest included. */
export const SPEC_FILES = [...REQUIRED_DOCUMENTS, MANIFEST_FILE] as const

export type ValidationResult =
  | { readonly ok: true; readonly manifest: SpecManifest }
  | { readonly ok: false; readonly reasons: readonly string[] }

/**
 * Validates a spec that is already in memory. The agent pulls the files out of a branch on
 * GitHub and a developer reads them off disk, so the gate itself never touches either.
 * `origin` only names the spec in the reasons.
 */
export function validateSpecDocuments(
  documents: ReadonlyMap<string, string>,
  inventory: Inventory,
  origin: string,
): ValidationResult {
  const missing = REQUIRED_DOCUMENTS.filter((file) => documents.get(file) === undefined).map(
    (file) => `${file} is missing from ${origin}`,
  )

  const manifestRaw = documents.get(MANIFEST_FILE)
  if (manifestRaw === undefined) {
    return { ok: false, reasons: [...missing, `${MANIFEST_FILE} is missing from ${origin}`] }
  }

  let document: unknown
  try {
    document = parseYaml(manifestRaw)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, reasons: [...missing, `${MANIFEST_FILE} is not valid YAML: ${message}`] }
  }

  const parsed = parseManifest(document)
  if (!parsed.ok) {
    return { ok: false, reasons: [...missing, ...parsed.reasons] }
  }

  const manifest = parsed.value
  const prose = new Map(
    REQUIRED_DOCUMENTS.flatMap((file) => {
      const text = documents.get(file)
      return text === undefined ? [] : [[file, text] as const]
    }),
  )

  const reasons = [
    ...missing,
    ...checkAgainstInventory(manifest, inventory),
    ...findForbiddenMentions(inventory, prose),
  ]

  if (reasons.length > 0) {
    return { ok: false, reasons }
  }
  return { ok: true, manifest }
}

/**
 * Validates one spec folder on disk. Collects every reason instead of stopping at the
 * first: the rejection issue should say everything that is wrong.
 */
export async function validateSpec(
  specDir: string,
  inventory: Inventory,
): Promise<ValidationResult> {
  const documents = new Map<string, string>()

  for (const file of SPEC_FILES) {
    const text = await readOptional(join(specDir, file))
    if (text !== undefined) {
      documents.set(file, text)
    }
  }

  return validateSpecDocuments(documents, inventory, specDir)
}

/** The inventory half of the gate, separated so it can be tested without touching disk. */
export function checkAgainstInventory(
  manifest: SpecManifest,
  inventory: Inventory,
): readonly string[] {
  const reasons: string[] = []

  const template = isTemplateRegistered(inventory, manifest.projectType, manifest.template)
  if (!template.allowed) {
    reasons.push(template.reason)
  }

  for (const component of manifest.components) {
    const check = isComponentAllowed(inventory, manifest.projectType, component)
    if (!check.allowed) {
      reasons.push(check.reason)
    }
  }

  const target = isDeployTargetAllowed(inventory, manifest.projectType, manifest.deployTarget)
  if (!target.allowed) {
    reasons.push(target.reason)
  }

  return reasons
}

async function readOptional(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return undefined
  }
}
