import { describe, expect, it } from 'vitest'
import { asScalar, bulletsUnder, frontmatterValue } from '../.claude/skills/company/lib/markdown.ts'

describe('frontmatterValue', () => {
  it('reads a quoted id without its quotes', () => {
    const markdown = "---\nid: '001'\nproject: orders\n---\n\n# Orders\n"

    expect(frontmatterValue(markdown, 'id')).toBe('001')
    expect(frontmatterValue(markdown, 'project')).toBe('orders')
  })

  it('returns undefined when there is no frontmatter', () => {
    expect(frontmatterValue('# Orders\n', 'id')).toBeUndefined()
  })
})

describe('bulletsUnder', () => {
  const plan = [
    '# Plan',
    '',
    'Prose that is not a bullet.',
    '',
    '## Inventory components',
    '',
    '- fastify@5',
    '- `zod@3`',
    '',
    '## Data',
    '',
    '- orders table',
    '',
  ].join('\n')

  it('takes the bullets of the section and stops at the next heading', () => {
    expect(bulletsUnder(plan, 'Inventory components')).toEqual(['fastify@5', 'zod@3'])
  })

  it('returns nothing for a section that is not there', () => {
    expect(bulletsUnder(plan, 'Acceptance criteria')).toEqual([])
  })
})

describe('asScalar', () => {
  it('leaves a criterion with a path parameter alone', () => {
    expect(asScalar('GET /orders/:id answers 200')).toBe('GET /orders/:id answers 200')
  })

  it('quotes what YAML would read as a mapping', () => {
    expect(asScalar('note: the order is created')).toBe("'note: the order is created'")
  })
})
