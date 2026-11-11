import { expect, test } from '@playwright/test'

test('FDE 实验室可完整执行 IT 服务台案例', async ({ page }) => {
  await page.goto('lab/')
  await page.waitForSelector('html[data-app-hydrated="true"]')

  await expect(page.getByRole('heading', { name: '选择案例' })).toBeVisible()
  await page.getByRole('button', { name: /企业 IT 服务台智能助手/ }).click()
  await expect(page.getByRole('heading', { name: '企业 IT 服务台智能助手' })).toBeVisible()
  await expect(page.getByText('案例背景')).toBeVisible()

  const single = page.getByRole('button', { name: '单步' })
  for (let i = 0; i < 7; i += 1) {
    await single.click()
  }

  await expect(page.getByText('需要人工审批')).toBeVisible()
  await page.getByRole('button', { name: '批准', exact: true }).click()

  await expect(page.getByText('最终报告')).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('.lab__final')).toContainText('IT-2026-1182')
  await expect(page.getByText('评测结果')).toBeVisible()
})
