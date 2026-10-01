import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests run against the Firebase Emulator Suite so they never touch
 * production data. Start the emulators + the dev server first:
 *
 *   firebase emulators:start --only auth,firestore --project demo-ationic
 *   npm run dev -- --mode emulator --port 5180
 *
 * Then: npx playwright test
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5180',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
})