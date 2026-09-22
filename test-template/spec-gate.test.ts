import { describe, expect, it } from 'vitest'
import { loadInventory } from '../.claude/skills/company/lib/inventory.ts'
import { validateSpec } from '../.claude/skills/company/lib/validate.ts'

/**
 * The gate, over the example specs. This is a test OF THE TEMPLATE, not of the service,
 * and that is why it lives outside `test/` and outside `pnpm check`.
 *
 * `pnpm check` is what the platform agent runs inside its sandbox to judge a feature. A
 * test in there that depends on the company inventory could fail a perfectly good feature
 * because something changed in ai-platform, and the developer would get three failed
 * rounds and an issue about flutter. So this runs in CI only, through
 * `pnpm test:template`.
 *
 * For the same reason it asserts behaviour, not wording: that the gate refuses what it
 * must refuse, and for the right file. A change in the agent's phrasing is not a failure.
 */
async function inventory() {
  const result = await loadInventory('inventory.yaml')
  if (!result.ok) throw new Error(result.reasons.join('; '))
  return result.value
}

describe('the spec gate', () => {
  it('accepts the example spec', async () => {
    const result = await validateSpec('examples/specs/001-orders', await inventory())

    expect(result.ok, result.ok ? '' : result.reasons.join('; ')).toBe(true)
    if (!result.ok) return
    expect(result.manifest.template).toBe('template-backend-api@1.0.0')
  })

  it('refuses the mobile spec for the component and for the prose', async () => {
    const result = await validateSpec('examples/specs/000-mobile-courier', await inventory())

    expect(result.ok).toBe(false)
    if (result.ok) return
    // One reason for the component that is not registered, one for the prose that names
    // it anyway. Both have to be there; their exact wording belongs to ai-platform.
    const reasons = result.reasons.map((reason) => reason.toLowerCase())
    expect(reasons.some((reason) => reason.includes('flutter'))).toBe(true)
    expect(reasons.some((reason) => reason.includes('plan.md') && reason.includes('flutter'))).toBe(
      true,
    )
  })

  it('refuses a spec folder that does not exist instead of throwing', async () => {
    const result = await validateSpec('examples/specs/404-nothing', await inventory())

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('registers this template version, so a spec created from it is accepted', async () => {
    const entry = (await inventory()).projectTypes['backend-api']

    expect(entry?.templates).toContain('template-backend-api@1.0.0')
  })
})
