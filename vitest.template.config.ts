import { defineConfig } from 'vitest/config'

/**
 * The template's own tests: the spec gate and the manifest generator. Deliberately a
 * separate run from `pnpm check`, because `pnpm check` is the verdict the platform agent
 * gives a feature inside its sandbox and must depend on this project alone.
 */
export default defineConfig({
  test: {
    include: ['test-template/**/*.test.ts'],
    environment: 'node',
  },
})
