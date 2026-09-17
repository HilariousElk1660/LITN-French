import { test, expect } from '@playwright/test';
import { signUpAndSignIn, getBackendBooks } from './helpers';

async function findHtmlBook(page: import('@playwright/test').Page): Promise<any | null> {
  const books = await getBackendBooks(page);
  for (const b of books) {
    const res = await page.request.get(`http://localhost:8000/read_book/${b.book_id}`);
    if (!res.ok()) continue;
    try {
      const urls = JSON.parse((await res.json()).pdf_file_url);
      if ((urls.english ?? '').endsWith('.html')) return b;
    } catch {
      /* malformed pdf_file_url */
    }
  }
  return null;
}

test.describe('Reading', () => {
  test('reader loads an HTML book and shows the reader toolbar', async ({ page }) => {
    await signUpAndSignIn(page);
    const book = await findHtmlBook(page);
    test.skip(!book, 'no HTML book available in the backend');

    const progressRequest = page.waitForResponse(
      (r) => r.url().includes('/reading_progress') && r.status() < 400,
      { timeout: 30_000 },
    );

    await page.goto(`/en/read/${book.book_id}`);

    await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: 'Reader Settings', exact: true })).toBeVisible();
    await expect(page.getByText('Loading reader…')).toBeHidden({ timeout: 30_000 });

    const progressRes = await progressRequest;
    expect(progressRes.ok()).toBeTruthy();
  });

  test('appearance menu opens and font size is adjustable', async ({ page }) => {
    await signUpAndSignIn(page);
    const book = await findHtmlBook(page);
    test.skip(!book, 'no HTML book available in the backend');

    await page.goto(`/en/read/${book.book_id}`);
    const appearance = page.getByRole('button', { name: 'Reader Settings', exact: true });
    await expect(appearance).toBeVisible({ timeout: 30_000 });

    await appearance.click();
    await expect(page.getByText('Font Family')).toBeVisible();

    // Font size is React state in the dropdown — moving the slider updates the label deterministically
    const range = page.locator('input[type="range"]');
    await range.fill('20');
    await expect(page.locator('span').filter({ hasText: '20px' }).first()).toBeVisible();
  });
});