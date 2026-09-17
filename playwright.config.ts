import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './playwright',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'uv run uvicorn main:app --host 0.0.0.0 --port 8000',
      cwd: '../LITN_Backend/LITN-Backend',
      url: 'http://localhost:8000/openapi.json',
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'npm run preview',
      url: `http://localhost:${PORT}`,
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});