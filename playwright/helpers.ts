import { Page, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { Client } from 'pg';

export function uniqueEmail(): string {
  return `qa.e2e.${Date.now()}.${Math.floor(Math.random() * 10000)}@litntest.dev`;
}

export const TEST_PASSWORD = 'testpass123';

export async function signUp(page: Page, fullname: string, email: string, password: string) {
  await page.goto('/en/signup');
  await page.getByPlaceholder('Full name').fill(fullname);
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password (min 6 chars)').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL('**/en/login');
}

export async function signIn(page: Page, email: string, password: string) {
  await page.goto('/en/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL('**/en/home');
}

export async function signUpAndSignIn(page: Page): Promise<{ email: string; password: string }> {
  const email = uniqueEmail();
  await signUp(page, 'QA Tester', email, TEST_PASSWORD);
  await signIn(page, email, TEST_PASSWORD);
  return { email, password: TEST_PASSWORD };
}

export async function signOutFromHeader(page: Page) {
  await page.locator('button[aria-haspopup="menu"]').click();
  await page.getByRole('button', { name: 'Sign out' }).click();
}

export async function openFirstBookFromCatalogue(page: Page): Promise<string> {
  await page.goto('/en/catalogue');
  const firstLink = page.locator('a[href*="/en/book/"]').first();
  await expect(firstLink).toBeVisible({ timeout: 20_000 });
  const href = await firstLink.getAttribute('href');
  await firstLink.click();
  await page.waitForURL('**/book/**');
  return href as string;
}

export async function getBackendBooks(page: Page): Promise<any[]> {
  const res = await page.request.get('http://localhost:8000/all_books');
  if (!res.ok()) throw new Error(`all_books failed: ${res.status()}`);
  return res.json();
}

// Ask the backend to mint a reset token for the email (same endpoint the
// forgot-password page calls), then read the token back from the database —
// the only place it is exposed.
export async function requestPasswordReset(page: Page, email: string): Promise<string> {
  const res = await page.request.post('http://localhost:8000/auth/forgot_password', {
    data: { email, redirect_url: 'http://localhost:4173/en/reset-password' },
  });
  if (!res.ok()) throw new Error(`forgot_password failed: ${res.status()}`);
  const token = await fetchResetToken(email);
  if (!token) throw new Error('No reset token found in database');
  return token;
}

async function fetchResetToken(email: string): Promise<string | null> {
  const candidates = [
    path.resolve(process.cwd(), '../LITN_Backend/LITN-Backend/.env'),
  ];
  const envPath = candidates.find((p) => fs.existsSync(p));
  if (!envPath) throw new Error('backend .env not found');
  const raw = fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .find((l) => l.startsWith('DATABASE_URL='));
  if (!raw) throw new Error('DATABASE_URL missing from backend .env');
  const dsn = (raw.split('=').slice(1).join('=') as string)
    .replace(/channel_binding=[^&]*/, '')
    .replace(/[?&]&/, '?')
    .trim();
  const client = new Client({ connectionString: dsn });
  try {
    await client.connect();
    const { rows } = await client.query(
      `SELECT pr.token FROM password_resets pr
       JOIN users u ON u.user_id = pr.user_id
       WHERE u.email = $1
       ORDER BY pr.created_at DESC
       LIMIT 1`,
      [email],
    );
    return (rows[0]?.token as string) ?? null;
  } finally {
    await client.end();
  }
}