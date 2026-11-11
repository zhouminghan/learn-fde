import type { Page } from '@playwright/test'

export type Theme = 'light' | 'dark'

export async function prepareThemePage(page: Page, route: string, theme: Theme) {
  await page.addInitScript((preference) => {
    localStorage.setItem('learn-fde-theme', preference)
  }, theme)
  await page.goto(route)
  await page.waitForSelector('html[data-app-hydrated="true"]')
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await page.waitForFunction(() => {
    const diagrams = [...document.querySelectorAll<HTMLElement>('.mermaid, .mermaid-host')]
    return diagrams.every(
      (element) =>
        Boolean(element.querySelector('svg')) &&
        !element.textContent?.includes('Syntax error in text')
    )
  })
}

export function routeSlug(route: string) {
  if (!route) return 'home'
  return route
    .replace(/\.html$/, '')
    .replace(/[^\w-]+/g, '-')
    .replace(/^-|-$/g, '')
}
