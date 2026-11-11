import { expect, test } from '@playwright/test'

test('A 静态架构图：SVG、图例与节点详情', async ({ page }) => {
  await page.goto('course/01-ai-agent-basics/1-3.html')
  await page.waitForSelector('html[data-app-hydrated="true"]')

  const diagram = page.locator('.diagram').first()
  await expect(diagram.locator('svg.arch__svg')).toBeVisible()
  await expect(diagram.getByText('核心流程', { exact: true }).first()).toBeVisible()

  await diagram.locator('.arch__node').first().click()
  await expect(diagram.locator('.arch__detail')).toBeVisible()
})

test('A 架构图节点支持键盘激活与详情关联', async ({ page }) => {
  await page.goto('course/01-ai-agent-basics/1-3.html')
  await page.waitForSelector('html[data-app-hydrated="true"]')

  const diagram = page.locator('.diagram').first()
  const node = diagram.locator('.arch__node').first()
  await node.focus()
  await page.keyboard.press('Enter')
  await expect(node).toHaveAttribute('aria-pressed', 'true')
  await expect(diagram.locator('.arch__detail')).toBeVisible()
})

test('图表全屏模式具备焦点管理与 Escape 退出', async ({ page }) => {
  await page.goto('course/01-ai-agent-basics/1-3.html')
  await page.waitForSelector('html[data-app-hydrated="true"]')

  const diagram = page.locator('.diagram').first()
  const toggle = diagram.getByRole('button', { name: '全屏查看' })
  await toggle.click()
  await expect(diagram).toHaveAttribute('role', 'dialog')
  await expect(diagram.getByRole('button', { name: '退出全屏' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(diagram).not.toHaveAttribute('role', 'dialog')
  await expect(toggle).toBeFocused()
})

test('B 流程逐步演示：播放自动推进并高亮路径', async ({ page }) => {
  await page.goto('course/01-ai-agent-basics/1-3.html')
  await page.waitForSelector('html[data-app-hydrated="true"]')

  const demo = page.locator('.iw').first()
  await demo.getByRole('button', { name: '播放' }).click()
  await expect(demo.locator('.iw__step--done').first()).toBeVisible({ timeout: 10_000 })
  await demo.getByRole('button', { name: '暂停' }).click()
  await expect(demo.locator('.iw__step--done').first()).toBeVisible()
})

test('B 流程演示支持上一步与重置', async ({ page }) => {
  await page.goto('course/01-ai-agent-basics/1-3.html')
  await page.waitForSelector('html[data-app-hydrated="true"]')

  const demo = page.locator('.iw').first()
  await demo.getByRole('button', { name: '下一步' }).click()
  await expect(demo.locator('.iw__step--active')).toHaveCount(1)
  await expect(demo.locator('.iw__summary')).toHaveCount(1)
  await demo.getByRole('button', { name: '下一步' }).click()
  await expect(demo.locator('.iw__step--done')).toHaveCount(1)
  await demo.getByRole('button', { name: '上一步' }).click()
  await expect(demo.locator('.iw__step--done')).toHaveCount(0)
  await demo.getByRole('button', { name: '重置' }).click()
  await expect(demo.locator('.iw__step--done')).toHaveCount(0)
})

test('B 流程时间线支持键盘跳转与状态播报', async ({ page }) => {
  await page.goto('course/01-ai-agent-basics/1-3.html')
  await page.waitForSelector('html[data-app-hydrated="true"]')

  const demo = page.locator('.iw').first()
  const secondStep = demo.locator('.iw__step-button').nth(1)
  await secondStep.focus()
  await page.keyboard.press('Enter')
  await expect(secondStep).toHaveAttribute('aria-current', 'step')
  await expect(demo.locator('.iw__state').nth(1)).toHaveText('当前步骤')
})

test('RAG 流程图以 Mermaid 渲染', async ({ page }) => {
  await page.goto('course/04-evaluation-optimization/4-3.html')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await expect(page.locator('.mermaid-host svg')).toBeVisible()
})
