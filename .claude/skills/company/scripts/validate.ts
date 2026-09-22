#!/usr/bin/env -S node --experimental-strip-types
import { loadInventory } from '../lib/inventory.ts'
import { validateSpec } from '../lib/validate.ts'

/**
 * The same gate the agent runs, as a CLI, so a developer gets the identical verdict
 * before pushing instead of discovering it in a rejection issue.
 *
 * Usage: `pnpm spec:validate specs/001-orders [inventory.yaml]`
 * Exit codes: 0 accepted, 1 rejected, 2 the command or the inventory is wrong.
 */
const DEFAULT_INVENTORY = 'inventory.yaml'

async function main(): Promise<number> {
  const [specDir, inventoryPath = DEFAULT_INVENTORY] = process.argv.slice(2)

  if (specDir === undefined) {
    console.error('usage: validate.ts <spec-dir> [inventory.yaml]')
    return 2
  }

  const inventory = await loadInventory(inventoryPath)
  if (!inventory.ok) {
    for (const reason of inventory.reasons) {
      console.error(`x ${reason}`)
    }
    return 2
  }

  const result = await validateSpec(specDir, inventory.value)
  if (!result.ok) {
    console.error(`x ${specDir} rejected:`)
    for (const reason of result.reasons) {
      console.error(`  - ${reason}`)
    }
    return 1
  }

  const { id, project, projectType, template, risk } = result.manifest
  console.log(`v ${specDir} accepted`)
  console.log(`  ${id} ${project} - ${projectType} - ${template} - risk ${risk}`)
  return 0
}

main()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    console.error('validate.ts failed', error)
    process.exit(2)
  })
