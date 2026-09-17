import { test, expect } from '@playwright/test';
import { signUpAndSignIn, getBackendBooks } from './helpers';

test.describe('Catalogue', () => {
  test.beforeEach(async ({ page }) => {
    await signUpAndSignIn(page);
  });

  test('catalogue loads and lists books', async ({ page }) => {
    await page.goto('/en/catalogue');
    const cards = page.locator('a[href*="/en/book/"]');
    await expect(cards.first()).toBeVisible({ timeout: 30_000 });
    expect(await cards.count()).toBeGreaterThan(0);

    await expect(page.getByRole('heading', { level: 1, name: 'The Library' })).toBeVisible();
    const countLine = page.getByText(/medical-training titles available\./);
    await expect(countLine).toBeVisible();
    const shown = Number((((await countLine.textContent()) ?? '0').match(/\d+/) ?? ['0'])[0]);
    expect(shown).toBe(await cards.count());
    expect(shown).toBeGreaterThan(0);
  });

  test('books are clickable and open a book detail page', async ({ page }) => {
    await page.goto('/en/catalogue');
    const firstLink = page.locator('a[href*="/en/book/"]').first();
    await expect(firstLink).toBeVisible({ timeout: 30_000 });
    const bookName = (await firstLink.locator('h3').textContent())?.trim() ?? '';
    await firstLink.click();
    await page.waitForURL('**/book/**');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    expect(((await h1.textContent()) ?? '').toLowerCase()).toContain(bookName.toLowerCase());
  });

  test('search query filters the results', async ({ page }) => {
    const books = await getBackendBooks(page);
    expect(books.length).toBeGreaterThan(0);
    const target = books[0];
    const frag = target.book_name.slice(0, 4);

    await page.goto('/en/catalogue');
    await page.getByPlaceholder('Search titles or subjects…').fill(frag);

    const countLine = page.getByText(/medical-training titles available\./);
    await expect(countLine).toBeVisible();
    const countText = (await countLine.textContent()) ?? '';
    const shown = Number((countText.match(/\d+/) ?? ['0'])[0]);

    const expected = books.filter((b) =>
      (b.book_name + ' ' + (b.category ?? '')).toLowerCase().includes(frag.toLowerCase()),
    ).length;

    expect(shown).toBe(expected);
    if (expected > 0) {
      await expect(page.getByRole('heading', { name: target.book_name, exact: true })).toBeVisible();
    }
  });

  test('status filter reflects the mapped status (Complete books are shown)', async ({ page }) => {
    const books = await getBackendBooks(page);
    await page.goto('/en/catalogue');
    await expect(page.locator('a[href*="/en/book/"]').first()).toBeVisible({ timeout: 30_000 });

    const filterSelects = page.locator('div.grid:has(select) select');
    const statusSelect = filterSelects.nth(1);
    await statusSelect.selectOption({ label: 'Complete' });
    const countLine = page.getByText(/medical-training titles available\./);
    await expect(countLine).toBeVisible();
    const shown = Number((((await countLine.textContent()) ?? '0').match(/\d+/) ?? ['0'])[0]);
    expect(shown).toBe(books.length);

    await statusSelect.selectOption({ label: 'Serialised' });
    await expect(page.getByText('No books match those filters yet.')).toBeVisible();
  });

  test('unmatched genre filter shows the empty state', async ({ page }) => {
    await page.goto('/en/catalogue');
    await expect(page.locator('a[href*="/en/book/"]').first()).toBeVisible({ timeout: 30_000 });

    await page.locator('div.grid:has(select) select').first().selectOption({ label: 'Anatomy' });
    await expect(page.getByText('No books match those filters yet.')).toBeVisible();
  });
});