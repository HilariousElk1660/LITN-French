import { test, expect } from '@playwright/test';
import { signUp, signUpAndSignIn, signOutFromHeader, uniqueEmail, TEST_PASSWORD } from './helpers';

test.describe('Authentication', () => {
  test('sign up creates an account and redirects to sign in', async ({ page }) => {
    await signUp(page, 'QA Signup', uniqueEmail(), TEST_PASSWORD);
    await expect(page).toHaveURL(/\/en\/login/);
    await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  });

  test('sign in reaches the dashboard', async ({ page }) => {
    await signUpAndSignIn(page);
    await expect(page).toHaveURL(/\/en\/home/);
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Browse Library/ }).or(page.getByRole('link', { name: /Browse Library/ }))).toBeVisible();
  });

  test('wrong password is rejected', async ({ page }) => {
    await page.goto('/en/login');
    await page.locator('#email').fill(uniqueEmail());
    await page.locator('#password').fill('definitely-wrong');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByText('Invalid email or password.')).toBeVisible();
    await expect(page).toHaveURL(/\/en\/login/);
  });

  test('sign out returns to the signed-out state', async ({ page }) => {
    await signUpAndSignIn(page);
    await signOutFromHeader(page);
    await expect(page.getByRole('heading', { name: 'Access your dashboard' })).toBeVisible();
  });

  test('forgot password shows a confirmation', async ({ page }) => {
    await page.goto('/en/forgot-password');
    await page.getByPlaceholder('Enter email address').fill('anyone@litntest.dev');
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText(/If that email is registered, we've sent a link/i)).toBeVisible();
  });
});