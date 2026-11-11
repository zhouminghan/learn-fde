import { readdirSync, readFileSync } from 'node:fs'
import { relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const componentsRoot = new URL('../../docs/.vitepress/theme/components/', import.meta.url)

function vueFiles(directory: URL): URL[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const child = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory)
    if (entry.isDirectory()) return vueFiles(child)
    return entry.name.endsWith('.vue') ? [child] : []
  })
}

describe('component theme token usage', () => {
  it('does not hard-code palette colors in Vue components', () => {
    const violations: string[] = []
    for (const file of vueFiles(componentsRoot)) {
      const source = readFileSync(file, 'utf8')
      const matches = source.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/g)
      if (matches?.length) {
        violations.push(`${relative(process.cwd(), file.pathname)}: ${matches.join(', ')}`)
      }
    }
    expect(violations).toEqual([])
  })
})
