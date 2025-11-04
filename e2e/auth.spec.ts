import { test, expect } from '@playwright/test';
import { testUsers, routes } from './fixtures/test-data';

test.describe('Authentication Flow', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto(routes.login);

      // Check page title
      await expect(page).toHaveTitle(/Login/i);

      // Check form elements
      await expect(page.getByRole('heading', { name: /log in/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto(routes.login);

      // Fill in invalid credentials
      await page.getByLabel(/email/i).fill(testUsers.invalidUser.email);
      await page.getByLabel(/password/i).fill(testUsers.invalidUser.password);

      // Submit form
      await page.getByRole('button', { name: /log in/i }).click();

      // Wait for error message
      await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    });

    test('should successfully login with valid credentials', async ({ page }) => {
      await page.goto(routes.login);

      // Fill in valid credentials
      await page.getByLabel(/email/i).fill(testUsers.validUser.email);
      await page.getByLabel(/password/i).fill(testUsers.validUser.password);

      // Submit form
      await page.getByRole('button', { name: /log in/i }).click();

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should redirect authenticated users to dashboard', async ({ page }) => {
      // First, login
      await page.goto(routes.login);
      await page.getByLabel(/email/i).fill(testUsers.validUser.email);
      await page.getByLabel(/password/i).fill(testUsers.validUser.password);
      await page.getByRole('button', { name: /log in/i }).click();
      await page.waitForURL(/\/dashboard/);

      // Now try to visit login page again
      await page.goto(routes.login);

      // Should be redirected to dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });

  test.describe('Signup Page', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto(routes.signup);

      // Check page title
      await expect(page).toHaveTitle(/Sign Up|Signup/i);

      // Check form elements
      await expect(page.getByRole('heading', { name: /sign up|create account/i })).toBeVisible();
      await expect(page.getByLabel(/name/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible();
    });

    test('should show error for duplicate email', async ({ page }) => {
      await page.goto(routes.signup);

      // Fill in form with existing user email
      await page.getByLabel(/name/i).fill(testUsers.validUser.name);
      await page.getByLabel(/email/i).fill(testUsers.validUser.email);
      await page.getByLabel(/password/i).fill(testUsers.validUser.password);

      // Submit form
      await page.getByRole('button', { name: /sign up|create account/i }).click();

      // Wait for error message
      await expect(page.getByText(/already registered|email already exists/i)).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should successfully logout', async ({ page }) => {
      // First, login
      await page.goto(routes.login);
      await page.getByLabel(/email/i).fill(testUsers.validUser.email);
      await page.getByLabel(/password/i).fill(testUsers.validUser.password);
      await page.getByRole('button', { name: /log in/i }).click();
      await page.waitForURL(/\/dashboard/);

      // Find and click logout button (might be in a menu/dropdown)
      const logoutButton = page.getByRole('button', { name: /logout|log out|sign out/i });
      await logoutButton.click();

      // Should redirect to home or login page
      await expect(page).toHaveURL(/\/(login)?$/);
    });
  });
});
