import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'

const rootDir = fileURLToPath(new URL('../..', import.meta.url))
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4173/learn-fde/'
const browserChannel = process.env.CI ? 'chrome' : undefined

export default defineConfig({
  testDir: fileURLToPath(new URL('../', import.meta.url)),
  outputDir: fileURLToPath(new URL('../../test-results/playwright', import.meta.url)),
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      testMatch: ['e2e/**/*.spec.ts'],
      testIgnore: ['e2e/mobile.spec.ts'],
      use: { ...devices['Desktop Chrome'], channel: browserChannel }
    },
    {
      name: 'mobile',
      testMatch: ['e2e/**/*.spec.ts'],
      testIgnore: ['e2e/layout.spec.ts', 'e2e/mobile.spec.ts'],
      use: { ...devices['Pixel 7'], channel: browserChannel }
    },
    {
      name: 'visual',
      testMatch: ['visual/**/*.spec.ts'],
      use: { ...devices['Desktop Chrome'], channel: browserChannel }
    }
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run docs:preview -- --port 4173',
        cwd: rootDir,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
      }
})
