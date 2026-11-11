import { expect, type Page } from '@playwright/test'
import axe from 'axe-core'

export async function assertNoA11yViolations(page: Page, label: string) {
  await page.addScriptTag({ content: axe.source })
  const violations = await page.evaluate(async () => {
    const results = await (
      window as typeof window & {
        axe: {
          run: (
            context: Document,
            options: Record<string, unknown>
          ) => Promise<{
            violations: {
              id: string
              impact: string | null
              help: string
              nodes: { target: string[]; failureSummary?: string }[]
            }[]
          }>
        }
      }
    ).axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']
      }
    })
    return results.violations
  })

  const summary = violations
    .map((violation) => {
      const nodes = violation.nodes
        .slice(0, 4)
        .map((node) => `  - ${node.target.join(' ')}`)
        .join('\n')
      return `${violation.id} (${violation.impact ?? 'unknown'}): ${violation.help}\n${nodes}`
    })
    .join('\n')

  expect(violations.length, `${label} accessibility violations:\n${summary}`).toBe(0)
}
