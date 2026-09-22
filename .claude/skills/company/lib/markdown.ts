/**
 * The little bit of markdown reading `gen-manifest.ts` needs: the frontmatter of
 * `spec.md` and the bullets of a named section. Kept apart from the script so it can be
 * tested without running the CLI, and written by hand because a markdown parser is not
 * in the inventory.
 */

/** `key: value` inside the leading `---` block, or `undefined`. */
export function frontmatterValue(markdown: string, key: string): string | undefined {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)
  const block = match?.[1]
  if (block === undefined) return undefined

  for (const line of block.split('\n')) {
    const entry = new RegExp(`^${key}\\s*:\\s*(.+)$`).exec(line.trim())
    const value = entry?.[1]
    if (value !== undefined) {
      return value.trim().replace(/^['"]|['"]$/g, '')
    }
  }
  return undefined
}

/** The bullets of the first section whose heading matches, until the next heading. */
export function bulletsUnder(markdown: string, heading: string): readonly string[] {
  const lines = markdown.split('\n')
  const start = lines.findIndex((line) => /^#{1,6}\s+/.test(line) && line.includes(heading))
  if (start === -1) return []

  const bullets: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (/^#{1,6}\s+/.test(line)) break
    const item = /^\s*(?:\d+[.)]|[-*+])\s+(.*)$/.exec(line)
    const body = item?.[1]?.replace(/^\[[ xX]\]\s*/, '').trim()
    if (body !== undefined && body.length > 0) {
      // Backticks and asterisks read as markup in prose and as noise in a manifest.
      bullets.push(body.replace(/[`*_]/g, '').trim())
    }
  }
  return bullets
}

/**
 * One line, quoted only when YAML would misread it. Quoting instead of stripping keeps
 * `GET /orders/:id answers 200` intact, which is exactly the text a criterion needs.
 */
export function asScalar(text: string): string {
  const oneLine = text.replace(/\s+/g, ' ').trim()
  const needsQuotes = /:\s|\s#|^[-?:,[\]{}#&*!|>'"%@`]/.test(oneLine) || oneLine.includes("'")
  return needsQuotes ? `'${oneLine.replace(/'/g, "''")}'` : oneLine
}
