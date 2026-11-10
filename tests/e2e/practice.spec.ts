import { expect, test } from '@playwright/test'

test('专项练习完成一次答题并显示结果', async ({ page }) => {
  await page.goto('practice/')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await expect(page.getByRole('heading', { name: '专项练习' })).toBeVisible()

  await page.getByLabel('知识域').selectOption({ label: 'AI 与生成式 AI 基础' })
  await page.getByRole('button', { name: '开始练习' }).click()

  await expect(page.getByRole('button', { name: '提交' })).toBeVisible()
  await page.locator('.option').first().click()
  await page.getByRole('button', { name: '提交' }).click()
  await expect(page.getByText(/回答正确|回答错误/)).toBeVisible()
})
