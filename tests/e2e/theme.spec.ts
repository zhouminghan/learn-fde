import { expect, test } from '@playwright/test'
import { prepareThemePage } from './helpers/theme'

test('保存的深色主题在 hydration 前生效并持久化', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('learn-fde-theme', 'dark'))
  await page.goto('')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'dark')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#191816')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await expect(page.getByTitle('深色模式')).toHaveAttribute('aria-pressed', 'true')

  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('应用脚本未加载时仍由内联启动脚本应用主题', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('learn-fde-theme', 'dark'))
  await page.route('**/assets/app*.js', (route) => route.abort())
  await page.goto('', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'dark')
  await expect(page.locator('html')).not.toHaveAttribute('data-app-hydrated', 'true')
})

test('手动切换主题后导航与刷新仍保持偏好', async ({ page }) => {
  await page.goto('')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await page.getByTitle('深色模式').click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByRole('link', { name: '课程学习' }).first().click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByTitle('浅色模式').click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})

test('System 模式跟随系统主题变化', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.addInitScript(() => localStorage.setItem('learn-fde-theme', 'system'))
  await page.goto('')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'system')
  await page.waitForSelector('html[data-app-hydrated="true"]')

  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})

test('localStorage 缺失时从 IndexedDB 镜像恢复主题', async ({ page }) => {
  await page.goto('')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await page.getByTitle('深色模式').click()
  await expect
    .poll(async () =>
      page.evaluate(async () => {
        try {
          const database = await new Promise<IDBDatabase>((resolve, reject) => {
            const request = indexedDB.open('learn-fde')
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
          })
          if (!database.objectStoreNames.contains('appSettings')) {
            database.close()
            return null
          }
          const value = await new Promise<unknown>((resolve, reject) => {
            const transaction = database.transaction('appSettings', 'readonly')
            const request = transaction.objectStore('appSettings').get('theme')
            request.onsuccess = () => resolve(request.result?.value)
            request.onerror = () => reject(request.error)
          })
          database.close()
          return value
        } catch {
          return null
        }
      })
    )
    .toBe('dark')

  await page.evaluate(async () => {
    localStorage.removeItem('learn-fde-theme')
  })

  await page.reload()
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('learn-fde-theme')))
    .toBe('dark')
})

test('localStorage 不可用时仍可完成初始化', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.addInitScript(() => {
    const fail = () => {
      throw new DOMException('Storage blocked', 'SecurityError')
    }
    Storage.prototype.getItem = fail
    Storage.prototype.setItem = fail
  })
  await page.goto('')
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await expect(page.getByRole('group', { name: '主题选择' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'system')
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('localStorage 不可用时预水合仍应用系统主题', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.addInitScript(() => {
    const fail = () => {
      throw new DOMException('Storage blocked', 'SecurityError')
    }
    Storage.prototype.getItem = fail
    Storage.prototype.setItem = fail
  })
  await page.route('**/assets/app*.js', (route) => route.abort())
  await page.goto('', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'system')
  await expect(page.locator('html')).not.toHaveAttribute('data-app-hydrated', 'true')
})

test('跨标签页同步主题偏好', async ({ context, page }) => {
  await prepareThemePage(page, '', 'light')
  const other = await context.newPage()
  await prepareThemePage(other, '', 'light')

  await page.getByTitle('深色模式').click()
  await expect(other.locator('html')).toHaveClass(/dark/)
  await expect(other.getByTitle('深色模式')).toHaveAttribute('aria-pressed', 'true')
  await other.close()
})

test('主题化页面与 Mermaid 加载无 hydration 或运行时错误', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await prepareThemePage(page, 'course/01-ai-agent-basics/1-3.html', 'dark')
  await page.getByTitle('浅色模式').click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  expect(errors).toEqual([])
})
