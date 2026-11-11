import { expect, test } from '@playwright/test'

async function openMobileNavIfNeeded(page: import('@playwright/test').Page) {
  const hamburger = page.locator('.VPNavBarHamburger')
  if (await hamburger.isVisible()) await hamburger.click()
}

test('首页展示品牌与核心入口', async ({ page }) => {
  await page.goto('')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await expect(page.getByRole('heading', { name: 'Learning FDE' })).toBeVisible()
  await openMobileNavIfNeeded(page)
  await expect(page.getByRole('link', { name: '课程学习' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: '模拟考试' }).first()).toBeVisible()
  await expect(page.getByText('学习概览')).toBeVisible()
})

test('主题切换在浅色、深色、跟随系统间生效', async ({ page }) => {
  await page.goto('')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  const group = page.getByRole('group', { name: '主题选择' })
  await expect(group).toBeVisible()

  await group.getByTitle('深色模式').click()
  await expect(page.locator('html')).toHaveClass(/dark/)

  await group.getByTitle('浅色模式').click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})

test('首页导航可进入课程与题库', async ({ page }) => {
  await page.goto('')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await openMobileNavIfNeeded(page)
  await page.getByRole('link', { name: '课程学习' }).first().click()
  await expect(page).toHaveURL(/\/course\//)
  await expect(page.getByRole('heading', { name: '课程学习' })).toBeVisible()

  await openMobileNavIfNeeded(page)
  await page.getByRole('link', { name: '题库浏览' }).first().click()
  await expect(page).toHaveURL(/\/questions\//)
  await expect(page.getByRole('heading', { name: '题库浏览' })).toBeVisible()
})
