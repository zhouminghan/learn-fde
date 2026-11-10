import { expect, test } from '@playwright/test'

const routes = ['', 'course/', 'course/01-ai-agent-basics/1-1.html', 'practice/', 'exam/', 'questions/', 'records/']
const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 960, height: 800 },
  { width: 1280, height: 800 }
]

for (const viewport of viewports) {
  test.describe(`${viewport.width}px 视口`, () => {
    test.use({ viewport })

    for (const route of routes) {
      test(`页面无横向溢出：${route || '/'}`, async ({ page }) => {
        await page.goto(route)
        await page.waitForSelector('html[data-app-hydrated="true"]')

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement
          return doc.scrollWidth - doc.clientWidth
        })

        expect(overflow, `页面 ${route || '/'} 出现 ${overflow}px 横向溢出`).toBeLessThanOrEqual(1)
      })
    }
  })
}
