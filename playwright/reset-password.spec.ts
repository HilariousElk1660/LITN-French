import { test, expect } from '@playwright/test';
import {
  signUp,
  signIn,
  signOutFromHeader,
  requestPasswordReset,
  uniqueEmail,
  TEST_PASSWORD,
} from './helpers';

test.describe('Password reset', () => {
  test('reset link token changes the password and restores sign-in', async ({ page }) => {
    const email = uniqueEmail();

    await signUp(page, 'QA Tester', email, TEST_PASSWORD);
    await signIn(page, email, TEST_PASSWORD);
    await signOutFromHeader(page);

    const token = await requestPasswordReset(page, email);

    await page.goto(`/en/reset-password?token=${token}`);
    await expect(page.getByRole('heading', { level: 1, name: 'Set a new password' })).toBeVisible();

    const newPassword = 'newpass456';
    await page.locator('#password').fill(newPassword);
    await page.locator('#confirm-password').fill(newPassword);
    await page.getByRole('button', { name: 'Reset password' }).click();

    await expect(
      page.getByText('Your password has been reset. You can now sign in with your new password.'),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to Sign in/ })).toBeVisible();

    await signIn(page, email, newPassword);
    await expect(page.locator('button[aria-haspopup="menu"]')).toBeVisible();
  });

  test('reset link without a token explains it cannot be used', async ({ page }) => {
    await page.goto('/en/reset-password');
    await expect(page.getByText(/missing its token/)).toBeVisible();
    await expect(page.getByRole('link', { name: /Request a new reset link/ })).toBeVisible();
  });

  test('unknown token is rejected', async ({ page }) => {
    await page.goto('/en/reset-password?token=deadbeef000011112222333344445555');
    await expect(page.getByRole('heading', { level: 1, name: 'Set a new password' })).toBeVisible();

    await page.locator('#password').fill('newpass456');
    await page.locator('#confirm-password').fill('newpass456');
    await page.getByRole('button', { name: 'Reset password' }).click();

    await expect(page.getByText(/Invalid or expired token/)).toBeVisible();
  });
});