/*
 * Copied verbatim from ai-platform/src/schema.ts. Do not edit here.
 *
 * The plan left the choice open between publishing ai-platform's `src/` as a package and
 * copying these three modules next to the skill. This template copies them: a project
 * created from the template must validate a spec with no access to the agent's repo and
 * no private registry. The cost is that a change in ai-platform has to be re-copied, which
 * `pnpm check` catches the moment the verdicts drift — see test/spec-gate.test.ts.
 *
 * These modules target zod 3, the major this project type is pinned to in the inventory.
 */
import { z } from 'zod'

/**
 * The contract between a developer's spec and the agent. Both documents are parsed with
 * `strictObject`: an unknown key is a typo, and a typo that goes unnoticed would let a
 * spec ask for something nobody reviewed.
 */

/** Project types the platform knows how to build. `backend-api` only in the MVP. */
export const PROJECT_TYPES = ['backend-api'] as const
export type ProjectType = (typeof PROJECT_TYPES)[number]

/** Deploy targets the platform knows how to reach. `compose-local` only in the MVP. */
export const DEPLOY_TARGETS = ['compose-local'] as const
export type DeployTarget = (typeof DEPLOY_TARGETS)[number]

export const RISK_LEVELS = ['low', 'medium', 'high'] as const
export type RiskLevel = (typeof RISK_LEVELS)[number]

/** `NNN`, the number that also names the branch (`feature/NNN-<slug>`). */
const specIdSchema = z.string().regex(/^\d{3}$/, 'id must be three digits, like 001')

/** `name@version`, a template registered in the inventory. */
const templateRefSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*@\d+\.\d+\.\d+$/, 'template must look like name@1.0.0')

/**
 * A component as written in a spec: a bare name (`vitest`) or a name pinned to a major
 * (`fastify@5`). Scoped npm names are out on purpose; the inventory names the tool, not
 * the package (`biome`, not `@biomejs/biome`).
 */
const componentRefSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*(@\d+(\.\d+){0,2})?$/, 'component must look like name or name@5')

export const specManifestSchema = z.strictObject({
  id: specIdSchema,
  project: z.string().regex(/^[a-z][a-z0-9-]*$/, 'project must be a kebab-case slug'),
  projectType: z.enum(PROJECT_TYPES),
  template: templateRefSchema,
  risk: z.enum(RISK_LEVELS),
  components: z.array(componentRefSchema).min(1, 'components must not be empty'),
  deployTarget: z.enum(DEPLOY_TARGETS),
  acceptance: z.array(z.string().min(1)).min(1, 'acceptance must carry at least one criterion'),
})

export type SpecManifest = Readonly<z.infer<typeof specManifestSchema>>

const inventoryComponentSchema = z.strictObject({
  name: z.string().regex(/^[a-z][a-z0-9-]*$/, 'component name must be a kebab-case slug'),
  /** Allowed major, as a string so `'5'` does not become `5` in YAML. */
  version: z
    .string()
    .regex(/^\d+(\.\d+){0,2}$/)
    .optional(),
})

export type InventoryComponent = Readonly<z.infer<typeof inventoryComponentSchema>>

const inventoryProjectTypeSchema = z.strictObject({
  description: z.string().min(1),
  components: z.array(inventoryComponentSchema).min(1),
  templates: z.array(templateRefSchema).min(1),
  deployTargets: z.array(z.enum(DEPLOY_TARGETS)).min(1),
})

/** A technology that is banned in prose, not just in the components list. */
const textRuleSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/),
  forbid: z.array(z.string().min(1)).min(1),
  reason: z.string().min(1),
})

export type TextRule = Readonly<z.infer<typeof textRuleSchema>>

export const inventorySchema = z.strictObject({
  version: z.literal(1),
  projectTypes: z.record(z.enum(PROJECT_TYPES), inventoryProjectTypeSchema),
  textRules: z.array(textRuleSchema).default([]),
})

export type Inventory = Readonly<z.infer<typeof inventorySchema>>

/** A component split into the parts the inventory compares. */
export interface ParsedComponent {
  readonly raw: string
  readonly name: string
  /** The major the spec asked for, or `undefined` when it named no version. */
  readonly major: string | undefined
}

export function parseComponent(raw: string): ParsedComponent {
  const at = raw.indexOf('@')
  if (at === -1) {
    return { raw, name: raw, major: undefined }
  }
  const name = raw.slice(0, at)
  const version = raw.slice(at + 1)
  return { raw, name, major: version.split('.')[0] }
}

export type ParseResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly reasons: readonly string[] }

function toReasons(error: z.ZodError, prefix: string): readonly string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join('.')
    return path ? `${prefix} ${path}: ${issue.message}` : `${prefix}: ${issue.message}`
  })
}

/** Parses the object a `spec.yaml` deserializes into. */
export function parseManifest(input: unknown): ParseResult<SpecManifest> {
  const parsed = specManifestSchema.safeParse(input)
  if (parsed.success) {
    return { ok: true, value: Object.freeze(parsed.data) }
  }
  return { ok: false, reasons: toReasons(parsed.error, 'spec.yaml') }
}

/** Parses the object an `inventory.yaml` deserializes into. */
export function parseInventory(input: unknown): ParseResult<Inventory> {
  const parsed = inventorySchema.safeParse(input)
  if (parsed.success) {
    return { ok: true, value: Object.freeze(parsed.data) }
  }
  return { ok: false, reasons: toReasons(parsed.error, 'inventory.yaml') }
}
