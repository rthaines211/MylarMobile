import { defineConfig, devices } from '@playwright/test';

// Use environment variable or default to remote server
const baseURL = process.env.BASE_URL || 'http://100.81.70.9:8091';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run sequentially for more reliable tests
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile Safari disabled - requires webkit installation
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
  // No webServer needed when testing against remote
});
