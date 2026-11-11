import { expect, test, type Locator, type Page } from '@playwright/test'
import { prepareThemePage } from './helpers/theme'

function parseColor(value: string) {
  const channels = value.match(/[\d.]+/g)?.map(Number)
  if (!channels || channels.length < 3) throw new Error(`Unsupported color: ${value}`)
  return { red: channels[0]!, green: channels[1]!, blue: channels[2]! }
}

function luminance(color: string) {
  const { red, green, blue } = parseColor(color)
  return [red, green, blue]
    .map((channel) => channel / 255)
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

async function expectLocatorContrast(
  locator: Locator,
  label: string,
  minimum = 4.5
) {
  const colors = await locator.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      foreground: style.color,
      background: style.backgroundColor
    }
  })
  const ratio = contrast(colors.foreground, colors.background)
  expect(ratio, `${label}: ${colors.foreground} on ${colors.background} (${ratio.toFixed(2)}:1)`).toBeGreaterThanOrEqual(
    minimum
  )
}

async function pageBackground(page: Page) {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor)
}

test('深色按钮 hover、主题选中和焦点状态对比度', async ({ page }) => {
  await prepareThemePage(page, '', 'dark')

  const primary = page.locator('.home__cta .btn--primary')
  await expectLocatorContrast(primary, 'dark primary')
  await primary.hover()
  await expectLocatorContrast(primary, 'dark primary hover')

  const accent = page.locator('.home__cta .btn--accent')
  await expectLocatorContrast(accent, 'dark accent')
  await accent.hover()
  await expectLocatorContrast(accent, 'dark accent hover')

  const activeTheme = page.getByTitle('深色模式')
  await expectLocatorContrast(activeTheme, 'dark selected theme')
  await activeTheme.focus()
  const focusStyle = await activeTheme.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      width: style.outlineWidth,
      style: style.outlineStyle,
      color: style.outlineColor,
      matches: element.matches(':focus-visible')
    }
  })
  expect(focusStyle.matches).toBe(true)
  expect(focusStyle.style).not.toBe('none')
  expect(Number.parseFloat(focusStyle.width)).toBeGreaterThanOrEqual(2)
  expect(contrast(focusStyle.color, await pageBackground(page))).toBeGreaterThanOrEqual(3)
})

test('题项选中、禁用按钮与 Lab 审批状态对比度', async ({ page }) => {
  await prepareThemePage(page, 'practice/', 'dark')
  await page.getByLabel('知识域').selectOption({ label: 'AI 与生成式 AI 基础' })
  await page.getByRole('button', { name: '开始练习' }).click()
  await page.locator('.option').first().click()
  await expectLocatorContrast(page.locator('.option.is-selected'), 'selected answer')

  await prepareThemePage(page, 'exam/', 'dark')
  await page.getByRole('button', { name: '开始考试' }).click()
  await expect(page.getByText('第 1 题')).toBeVisible()
  await expectLocatorContrast(
    page.locator('.running__nav .btn--ghost:disabled'),
    'disabled previous question'
  )

  await prepareThemePage(page, 'lab/', 'dark')
  await page.getByRole('button', { name: /企业 IT 服务台智能助手/ }).click()
  const single = page.getByRole('button', { name: '单步' })
  for (let index = 0; index < 7; index += 1) await single.click()
  await expectLocatorContrast(page.getByRole('button', { name: '批准', exact: true }), 'lab approve')
  await expectLocatorContrast(page.getByRole('button', { name: '拒绝', exact: true }), 'lab reject')
})

test('Mermaid SVG 图表文字和连线在双主题中对比度', async ({ page }) => {
  for (const theme of ['light', 'dark'] as const) {
    await prepareThemePage(page, 'course/01-ai-agent-basics/1-3.html', theme)
    const colors = await page.evaluate(() => {
      const text = document.querySelector<SVGElement | HTMLElement>(
        '.mermaid svg .nodeLabel'
      )
      const edge = document.querySelector<SVGElement>(
        '.mermaid svg .edgePath path, .mermaid svg .flowchart-link'
      )
      const textStyle = text ? getComputedStyle(text) : null
      const edgeStyle = edge ? getComputedStyle(edge) : null
      const nodeFill = text?.closest('.node')?.querySelector<SVGElement>('rect')
      const nodeStyle = nodeFill ? getComputedStyle(nodeFill) : null
      return {
        textForeground: textStyle?.color ?? '',
        textBackground:
          nodeStyle?.getPropertyValue('fill') ||
          nodeFill?.getAttribute('fill') ||
          '',
        edge:
          edgeStyle?.getPropertyValue('stroke') ||
          edge?.getAttribute('stroke') ||
          '',
        background: getComputedStyle(document.body).backgroundColor
      }
    })
    expect(
      contrast(colors.textForeground, colors.textBackground),
      `${theme} Mermaid text: ${colors.textForeground} on ${colors.textBackground}`
    ).toBeGreaterThanOrEqual(4.5)
    expect(contrast(colors.edge, colors.background), `${theme} Mermaid edge`).toBeGreaterThanOrEqual(
      3
    )
  }
})
