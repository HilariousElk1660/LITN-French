import { test, expect } from '@playwright/test';

test.describe('PWA / Offline', () => {
  test('service worker registers and precaches the app shell', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();

    await page.waitForFunction(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const reg = await navigator.serviceWorker.getRegistration('/');
      return !!reg && !!reg.active;
    }, undefined, { timeout: 30_000 });

    // wait for precaching to finish writing to the cache
    await page.waitForFunction(async () => {
      const keys = await caches.keys();
      return keys.length > 0;
    }, undefined, { timeout: 30_000 });
  });

  test('app shell still renders offline after the SW has taken control', async ({ page, context }) => {
    await page.goto('/en/home');
    await expect(page.locator('header')).toBeVisible();

    await page.waitForFunction(() => !!navigator.serviceWorker.controller, undefined, { timeout: 30_000 });
    await page.waitForFunction(async () => (await caches.keys()).length > 0, undefined, { timeout: 30_000 });

    // Keep the origin alive across the offline navigation by opening the
    // window in offline mode via the context.
    await context.setOffline(true);

    await page.goto('/en/home');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav a').first()).toBeVisible();

    // Client-side SPA navigation still works offline (app shell booted from precache)
    await page.goto('/en/catalogue');
    await expect(page.locator('header')).toBeVisible();
  });

  test('offline banner appears when the browser goes offline', async ({ page, context }) => {
    await page.goto('/en');
    await expect(page.locator('header')).toBeVisible();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, undefined, { timeout: 30_000 });

    await context.setOffline(true);
    await expect(page.getByText(/Offline Mode — Your cached books and data remain accessible\./)).toBeVisible();
  });
});