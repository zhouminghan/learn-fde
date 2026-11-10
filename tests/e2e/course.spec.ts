import { expect, test } from '@playwright/test'

test('课程页展示模块与章节并可进入阅读', async ({ page }) => {
  await page.goto('course/')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await expect(page.getByRole('heading', { name: '课程学习' })).toBeVisible()
  await expect(page.getByText('第一部分：AI 和 Agent 基础')).toBeVisible()

  await page.getByRole('link', { name: /AI 基础/ }).first().click()
  await expect(page).toHaveURL(/01-ai-agent-basics\/1-1/)
  await expect(page.getByRole('heading', { name: 'AI 基础' }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: '本章目标' }).first()).toBeVisible()
})

test('章节可标记完成并持久化', async ({ page }) => {
  await page.goto('course/01-ai-agent-basics/1-1.html')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await page.getByRole('button', { name: '标记完成' }).click()
  await expect(page.getByText('已完成')).toBeVisible()

  await page.reload()
  await expect(page.getByText('已完成').first()).toBeVisible()
})
