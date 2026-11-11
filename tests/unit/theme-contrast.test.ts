import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  new URL('../../docs/.vitepress/theme/styles/custom.css', import.meta.url),
  'utf8'
)

function cssBlock(selector: string) {
  const start = css.indexOf(`${selector} {`)
  expect(start, `missing CSS block ${selector}`).toBeGreaterThanOrEqual(0)
  const open = css.indexOf('{', start)
  let depth = 0
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1
    if (css[index] === '}') depth -= 1
    if (depth === 0) return css.slice(open + 1, index)
  }
  throw new Error(`unterminated CSS block ${selector}`)
}

function cssVariables(selector: string) {
  const result = new Map<string, string>()
  for (const match of cssBlock(selector).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    result.set(match[1]!, match[2]!.trim())
  }
  return result
}

function resolveVariable(name: string, variables: Map<string, string>): string {
  const value = variables.get(name)
  if (!value) throw new Error(`missing variable ${name}`)
  const alias = value.match(/^var\((--[\w-]+)(?:,\s*([^)]+))?\)$/)
  if (!alias) return value
  return resolveVariable(alias[1]!, variables)
}

function luminance(hex: string) {
  const value = hex.replace('#', '')
  const channels = [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16) / 255)
  return channels
    .map((channel) =>
      channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    )
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index]!, 0)
}

function contrast(foreground: string, background: string) {
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

const themes = {
  light: cssVariables(':root'),
  dark: cssVariables('.dark')
}

function token(name: string, theme: keyof typeof themes) {
  return resolveVariable(name, themes[theme])
}

function expectContrast(
  theme: keyof typeof themes,
  foreground: string,
  background: string,
  minimum: number
) {
  const ratio = contrast(token(foreground, theme), token(background, theme))
  expect(ratio, `${theme}: ${foreground} on ${background} (${ratio.toFixed(2)}:1)`).toBeGreaterThanOrEqual(
    minimum
  )
}

describe.each(['light', 'dark'] as const)('%s theme contrast', (theme) => {
  it('keeps normal text readable on every surface', () => {
    for (const surface of ['--lf-bg', '--lf-bg-soft', '--lf-bg-elv', '--lf-surface-raised']) {
      expectContrast(theme, '--lf-text', surface, 4.5)
      expectContrast(theme, '--lf-text-2', surface, 4.5)
      expectContrast(theme, '--lf-text-3', surface, 4.5)
    }
  })

  it('keeps links, brand controls, and hover states readable', () => {
    expectContrast(theme, '--lf-link', '--lf-bg', 4.5)
    expectContrast(theme, '--lf-link', '--lf-bg-elv', 4.5)
    expectContrast(theme, '--lf-brand-soft-text', '--lf-brand-soft', 4.5)
    expectContrast(theme, '--lf-on-brand', '--lf-brand', 4.5)
    expectContrast(theme, '--lf-on-brand', '--lf-brand-hover', 4.5)
    expectContrast(theme, '--lf-selected-text', '--lf-selected-bg', 4.5)
  })

  it('keeps semantic status labels readable', () => {
    for (const status of ['success', 'warning', 'danger', 'info', 'teal']) {
      expectContrast(theme, `--lf-${status}`, `--lf-${status}-soft`, 4.5)
      expectContrast(theme, `--lf-on-${status}`, `--lf-${status}`, 4.5)
    }
  })

  it('keeps controls, focus rings, and disabled text distinguishable', () => {
    expectContrast(theme, '--lf-border-control', '--lf-bg-elv', 3)
    expectContrast(theme, '--lf-border-control', '--lf-bg', 3)
    expectContrast(theme, '--lf-focus', '--lf-bg', 3)
    expectContrast(theme, '--lf-focus', '--lf-bg-soft', 3)
    expectContrast(theme, '--lf-text-disabled', '--lf-disabled-bg', 4.5)
  })

  it('keeps code and chart colors readable', () => {
    expectContrast(theme, '--lf-code-text', '--lf-code-bg', 4.5)
    expectContrast(theme, '--lf-inline-code-text', '--lf-inline-code-bg', 4.5)
    expectContrast(theme, '--lf-chart-line', '--lf-chart-surface', 3)
    expectContrast(theme, '--lf-text', '--lf-chart-core-fill', 4.5)
    expectContrast(theme, '--lf-text', '--lf-chart-data-fill', 4.5)
    expectContrast(theme, '--lf-text', '--lf-chart-tool-fill', 4.5)
    expectContrast(theme, '--lf-text', '--lf-chart-output-fill', 4.5)
    expectContrast(theme, '--lf-chart-core-stroke', '--lf-chart-core-fill', 3)
    expectContrast(theme, '--lf-chart-data-stroke', '--lf-chart-data-fill', 3)
    expectContrast(theme, '--lf-chart-tool-stroke', '--lf-chart-tool-fill', 3)
    expectContrast(theme, '--lf-chart-output-stroke', '--lf-chart-output-fill', 3)
  })
})

describe('token contract', () => {
  it('defines the same semantic keys in light and dark themes', () => {
    const required = [
      '--lf-bg',
      '--lf-bg-soft',
      '--lf-bg-elv',
      '--lf-surface',
      '--lf-surface-raised',
      '--lf-text',
      '--lf-text-2',
      '--lf-text-3',
      '--lf-brand',
      '--lf-brand-hover',
      '--lf-brand-soft',
      '--lf-on-brand',
      '--lf-link',
      '--lf-focus',
      '--lf-success',
      '--lf-warning',
      '--lf-danger',
      '--lf-info',
      '--lf-teal',
      '--lf-border-control',
      '--lf-chart-line',
      '--lf-mermaid-primary',
      '--lf-mermaid-primary-border'
    ]
    for (const key of required) {
      expect(themes.light.has(key), `light missing ${key}`).toBe(true)
      expect(themes.dark.has(key), `dark missing ${key}`).toBe(true)
    }
  })
})
