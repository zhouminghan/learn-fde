import { expect, test } from '@playwright/test'
import { assertNoA11yViolations } from './helpers/a11y'
import { prepareThemePage, type Theme } from './helpers/theme'

const routes = [
  { route: '', name: '首页' },
  { route: 'course/', name: '课程列表' },
  { route: 'course/01-ai-agent-basics/1-3.html', name: '课程详情与可视化' },
  { route: 'practice/', name: '专项练习' },
  { route: 'questions/', name: '题库' },
  { route: 'exam/', name: '模拟考试' },
  { route: 'lab/', name: 'Lab' },
  { route: 'records/', name: '学习记录' },
  { route: 'resources/', name: '资源中心' }
]

for (const theme of ['light', 'dark'] as Theme[]) {
  for (const item of routes) {
    test(`axe WCAG AA：${theme} · ${item.name}`, async ({ page }) => {
      await prepareThemePage(page, item.route, theme)
      await assertNoA11yViolations(page, `${theme} ${item.name}`)
    })
  }
}

test('axe WCAG AA：考试进行中与结果报告', async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept())
  await prepareThemePage(page, 'exam/', 'dark')
  await page.getByRole('button', { name: '开始考试' }).click()
  await expect(page.getByText('第 1 题')).toBeVisible()
  await assertNoA11yViolations(page, 'dark exam running')

  await page.locator('.option').first().click()
  await page.getByRole('button', { name: /标记/ }).click()
  await page.getByRole('button', { name: '交卷' }).click()
  await expect(page.getByRole('heading', { name: '考试成绩' })).toBeVisible()
  await assertNoA11yViolations(page, 'dark exam report')
})

test('axe WCAG AA：Lab 执行状态', async ({ page }) => {
  await prepareThemePage(page, 'lab/', 'light')
  await page.getByRole('button', { name: /企业 IT 服务台智能助手/ }).click()
  const single = page.getByRole('button', { name: '单步' })
  for (let index = 0; index < 7; index += 1) await single.click()
  await expect(page.getByText('需要人工审批')).toBeVisible()
  await assertNoA11yViolations(page, 'light lab approval')
})
