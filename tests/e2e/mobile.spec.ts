import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

test('移动端首页与考试入口可用', async ({ page }) => {
  await page.goto('')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await expect(page.getByRole('heading', { name: 'learn-FDE' })).toBeVisible()
  await expect(page.getByRole('link', { name: '开始学习' })).toBeVisible()
})

test('移动端可进入课程章节', async ({ page }) => {
  await page.goto('course/')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await page.getByRole('link', { name: /AI 基础/ }).first().click()
  await expect(page.getByRole('heading', { name: 'AI 基础' }).first()).toBeVisible()
})
