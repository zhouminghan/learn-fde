import { mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { devices, expect, test } from '@playwright/test'
import { prepareThemePage, routeSlug, type Theme } from '../helpers/theme'

const routes = [
  '',
  'course/',
  'course/01-ai-agent-basics/1-3.html',
  'practice/',
  'questions/',
  'exam/',
  'lab/',
  'records/',
  'resources/',
  'course/04-evaluation-optimization/4-3.html'
]

function registerThemeScreenshots(
  label: string,
  width: number,
  height: number,
  device: (typeof devices)['Desktop Chrome']
) {
  const { defaultBrowserType: _defaultBrowserType, ...deviceOptions } = device
  test.describe(`${label} ${width}x${height} theme screenshots`, () => {
    test.use({ ...deviceOptions, viewport: { width, height } })

    for (const theme of ['light', 'dark'] as Theme[]) {
      for (const route of routes) {
        test(`${theme} ${route || '/'}`, async ({ page }, testInfo) => {
          await prepareThemePage(page, route, theme)
          const overflow = await page.evaluate(() => {
            const root = document.documentElement
            return root.scrollWidth - root.clientWidth
          })
          expect(overflow, `horizontal overflow on ${route || '/'}`).toBeLessThanOrEqual(1)

          const directory = join(
            'test-results',
            'p9-screenshots',
            testInfo.project.name,
            String(width),
            theme
          )
          mkdirSync(directory, { recursive: true })
          const path = join(directory, `${routeSlug(route)}.png`)
          await page.screenshot({ path, fullPage: true, animations: 'disabled' })
          expect(statSync(path).size).toBeGreaterThan(10_000)
        })
      }
    }
  })
}

registerThemeScreenshots('desktop', 1440, 900, devices['Desktop Chrome'])
registerThemeScreenshots('mobile', 390, 844, devices['Pixel 7'])

for (const theme of ['light', 'dark'] as Theme[]) {
  test(`${theme} 练习解析状态截图`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await prepareThemePage(page, 'practice/', theme)
    await page.getByLabel('知识域').selectOption({ label: 'AI 与生成式 AI 基础' })
    await page.getByRole('button', { name: '开始练习' }).click()
    await page.locator('.option').first().click()
    await page.getByRole('button', { name: '提交' }).click()
    await expect(page.getByText(/回答正确|回答错误/)).toBeVisible()

    const directory = join(
      'test-results',
      'p9-screenshots',
      testInfo.project.name,
      'state',
      theme
    )
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'practice-result.png')
    await page.screenshot({ path, fullPage: true, animations: 'disabled' })
    expect(statSync(path).size).toBeGreaterThan(10_000)
  })

  test(`${theme} Lab 审批状态截图`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await prepareThemePage(page, 'lab/', theme)
    await page.getByRole('button', { name: /企业 IT 服务台智能助手/ }).click()
    const single = page.getByRole('button', { name: '单步' })
    for (let index = 0; index < 7; index += 1) await single.click()
    await expect(page.getByText('需要人工审批')).toBeVisible()

    const directory = join(
      'test-results',
      'p9-screenshots',
      testInfo.project.name,
      'state',
      theme
    )
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'lab-approval.png')
    await page.screenshot({ path, fullPage: true, animations: 'disabled' })
    expect(statSync(path).size).toBeGreaterThan(10_000)
  })

  test(`${theme} 考试结果报告截图`, async ({ page }, testInfo) => {
    page.on('dialog', (dialog) => dialog.accept())
    await page.setViewportSize({ width: 1440, height: 900 })
    await prepareThemePage(page, 'exam/', theme)
    await page.getByRole('button', { name: '开始考试' }).click()
    await expect(page.getByText('第 1 题')).toBeVisible()
    await page.locator('.option').first().click()
    await page.getByRole('button', { name: '交卷' }).click()
    await expect(page.getByRole('heading', { name: '考试成绩' })).toBeVisible()

    const directory = join(
      'test-results',
      'p9-screenshots',
      testInfo.project.name,
      'state',
      theme
    )
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'exam-report.png')
    await page.screenshot({ path, fullPage: true, animations: 'disabled' })
    expect(statSync(path).size).toBeGreaterThan(10_000)
  })
}
