import { expect, test } from '@playwright/test'

test('模拟考试可开始、作答、交卷并显示报告', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept())

  await page.goto('exam/')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await expect(page.getByRole('heading', { name: '模拟考试' })).toBeVisible()
  await expect(page.getByText('60 题', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: '开始考试' }).click()
  await expect(page.getByText('第 1 题')).toBeVisible()

  await page.locator('.option').first().click()
  await page.getByRole('button', { name: /标记/ }).click()
  await page.getByRole('button', { name: '交卷' }).click()

  await expect(page.getByRole('heading', { name: '考试成绩' })).toBeVisible()
  await expect(page.getByText('知识域表现')).toBeVisible()
})

test('刷新后可以恢复进行中的考试', async ({ page }) => {
  await page.goto('exam/')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await page.getByRole('button', { name: '开始考试' }).click()
  await expect(page.getByText('第 1 题')).toBeVisible()

  await page.reload()
  await expect(page.getByText('发现未完成的考试')).toBeVisible()
  await page.getByRole('button', { name: '恢复考试' }).click()
  await expect(page.getByText('第 1 题')).toBeVisible()
})
