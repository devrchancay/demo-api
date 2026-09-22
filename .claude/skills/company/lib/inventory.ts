/*
 * Copied verbatim from ai-platform/src/inventory.ts. Do not edit here.
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
import { parse as parseYaml } from 'yaml'
import {
  type Inventory,
  type ParseResult,
  type ProjectType,
  parseComponent,
  parseInventory,
} from './schema.ts'

/** Where the inventory lives when nobody says otherwise. */
export const DEFAULT_INVENTORY_PATH = 'inventory.yaml'

/**
 * Reads and validates the inventory. Every answer below is derived from this file, so a
 * malformed inventory is reported as a list of reasons instead of throwing.
 */
export async function loadInventory(
  path: string = DEFAULT_INVENTORY_PATH,
): Promise<ParseResult<Inventory>> {
  let raw: string
  try {
    raw = await readFile(path, 'utf8')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, reasons: [`inventory.yaml could not be read: ${message}`] }
  }

  let document: unknown
  try {
    document = parseYaml(raw)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, reasons: [`inventory.yaml is not valid YAML: ${message}`] }
  }

  return parseInventory(document)
}

/** The answer to an inventory question: allowed, or not allowed with the reason why. */
export type InventoryCheck =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: string }

const ALLOWED: InventoryCheck = { allowed: true }

function deny(reason: string): InventoryCheck {
  return { allowed: false, reason }
}

/**
 * Is this component in the inventory for this project type? A component with no version
 * matches any registered major; a pinned major has to match exactly.
 */
export function isComponentAllowed(
  inventory: Inventory,
  projectType: ProjectType,
  component: string,
): InventoryCheck {
  const entry = inventory.projectTypes[projectType]
  if (entry === undefined) {
    return deny(`project type '${projectType}' is not in the inventory`)
  }

  const asked = parseComponent(component)
  const registered = entry.components.find((candidate) => candidate.name === asked.name)
  if (registered === undefined) {
    return deny(`${asked.name} is not in the inventory for ${projectType}`)
  }

  if (asked.major === undefined) {
    return ALLOWED
  }

  const registeredMajor = registered.version?.split('.')[0]
  if (registeredMajor === undefined) {
    return deny(
      `${asked.name} is registered without a version for ${projectType}, so it cannot be pinned to ${asked.major}`,
    )
  }
  if (registeredMajor !== asked.major) {
    return deny(
      `${asked.name}@${asked.major} is not in the inventory for ${projectType}; the registered version is ${registered.version}`,
    )
  }

  return ALLOWED
}

/** Is this `name@version` one of the templates registered for this project type? */
export function isTemplateRegistered(
  inventory: Inventory,
  projectType: ProjectType,
  template: string,
): InventoryCheck {
  const entry = inventory.projectTypes[projectType]
  if (entry === undefined) {
    return deny(`project type '${projectType}' is not in the inventory`)
  }
  if (!entry.templates.includes(template)) {
    return deny(
      `template ${template} is not registered for ${projectType}; registered: ${entry.templates.join(', ')}`,
    )
  }
  return ALLOWED
}

/** Can this project type be deployed to this target? */
export function isDeployTargetAllowed(
  inventory: Inventory,
  projectType: ProjectType,
  deployTarget: string,
): InventoryCheck {
  const entry = inventory.projectTypes[projectType]
  if (entry === undefined) {
    return deny(`project type '${projectType}' is not in the inventory`)
  }
  if (!entry.deployTargets.some((target) => target === deployTarget)) {
    return deny(
      `deploy target ${deployTarget} is not allowed for ${projectType}; allowed: ${entry.deployTargets.join(', ')}`,
    )
  }
  return ALLOWED
}

/**
 * Applies the text rules to the prose of a spec. Catches a forbidden technology that is
 * described in the documents but never listed as a component.
 */
export function findForbiddenMentions(
  inventory: Inventory,
  documents: ReadonlyMap<string, string>,
): readonly string[] {
  const reasons: string[] = []
  for (const rule of inventory.textRules) {
    for (const term of rule.forbid) {
      const pattern = new RegExp(`\\b${escapeForRegExp(term)}\\b`, 'i')
      for (const [file, text] of documents) {
        if (pattern.test(text)) {
          reasons.push(`${file} mentions ${term}: ${rule.reason} (rule ${rule.id})`)
          break
        }
      }
    }
  }
  return reasons
}

function escapeForRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
