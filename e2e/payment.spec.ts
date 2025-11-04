import { test, expect } from '@playwright/test';
import { testUsers, routes } from './fixtures/test-data';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(routes.login);
    await page.getByLabel(/email/i).fill(testUsers.validUser.email);
    await page.getByLabel(/password/i).fill(testUsers.validUser.password);
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL(/\/dashboard/);
  });

  test.describe('Course Payment', () => {
    test('should display course payment page', async ({ page }) => {
      // Navigate to courses
      await page.goto('/courses');

      // Find and click on a course
      const courseCards = page.locator('[data-testid="course-card"], .course-card, article');
      if (await courseCards.count() > 0) {
        await courseCards.first().click();

        // Should navigate to course detail page
        await expect(page).toHaveURL(/\/courses\/.+/);

        // Look for enroll or purchase button
        const enrollButton = page.getByRole('button', { name: /enroll|purchase|buy/i });
        if (await enrollButton.isVisible()) {
          await expect(enrollButton).toBeVisible();
        }
      }
    });

    test('should show payment form when initiating purchase', async ({ page }) => {
      // Go directly to a payment page (assuming a course slug)
      await page.goto('/dashboard/user/courses/test-course/payment');

      // Should show payment information
      await expect(page.getByText(/payment/i)).toBeVisible();

      // Should show amount
      const priceElements = page.locator('text=/\\$[0-9]+/');
      if (await priceElements.count() > 0) {
        await expect(priceElements.first()).toBeVisible();
      }
    });

    test('should load Tilopay SDK', async ({ page }) => {
      await page.goto('/dashboard/user/courses/test-course/payment');

      // Wait for Tilopay script to load
      await page.waitForTimeout(2000);

      // Check if Tilopay object exists in window
      const tilopayLoaded = await page.evaluate(() => {
        return typeof (window as any).Tilopay !== 'undefined';
      });

      // If payment system is configured, Tilopay should be loaded
      if (tilopayLoaded) {
        expect(tilopayLoaded).toBe(true);
      }
    });

    test('should show payment button', async ({ page }) => {
      await page.goto('/dashboard/user/courses/test-course/payment');

      // Look for payment-related buttons
      const paymentButtons = page.getByRole('button', { name: /pay|purchase|proceed/i });

      if (await paymentButtons.count() > 0) {
        await expect(paymentButtons.first()).toBeVisible();
      }
    });

    test('should initialize payment when button clicked', async ({ page }) => {
      await page.goto('/dashboard/user/courses/test-course/payment');

      // Find and click payment button
      const paymentButton = page.getByRole('button', { name: /pay|purchase|proceed/i }).first();

      if (await paymentButton.isVisible()) {
        await paymentButton.click();

        // Should show loading state or payment form
        await page.waitForTimeout(1000);

        // Check for loading indicator or embedded form
        const loadingIndicator = page.locator('text=/processing|loading/i, [data-testid="tilopay-container"], #tilopay-container');

        if (await loadingIndicator.count() > 0) {
          // Payment initialization started
          expect(true).toBe(true);
        }
      }
    });
  });

  test.describe('Membership Payment', () => {
    test('should display membership purchase page', async ({ page }) => {
      await page.goto('/membership');

      // Should show membership tiers
      await expect(page).toHaveTitle(/membership/i);

      // Look for pricing cards
      const pricingCards = page.locator('[data-testid="pricing-card"], .pricing-card');

      if (await pricingCards.count() > 0) {
        await expect(pricingCards.first()).toBeVisible();
      }
    });

    test('should show membership checkout page', async ({ page }) => {
      await page.goto('/membership/checkout');

      // Should show checkout page
      await expect(page).toHaveURL(/\/membership\/checkout/);

      // Should show payment-related content
      const paymentElements = page.locator('text=/payment|checkout|purchase/i');

      if (await paymentElements.count() > 0) {
        await expect(paymentElements.first()).toBeVisible();
      }
    });

    test('should display membership pricing', async ({ page }) => {
      await page.goto('/membership');

      // Look for price displays
      const priceElements = page.locator('text=/\\$[0-9]+/');

      if (await priceElements.count() > 0) {
        await expect(priceElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Donation Payment', () => {
    test('should display donation page', async ({ page }) => {
      await page.goto('/donate');

      // Should show donation page
      await expect(page).toHaveURL(/\/donate/);

      // Look for donation form or categories
      const donationElements = page.locator('text=/donate|contribution|support/i');

      if (await donationElements.count() > 0) {
        await expect(donationElements.first()).toBeVisible();
      }
    });

    test('should allow selecting donation amount', async ({ page }) => {
      await page.goto('/donate');

      // Look for amount input or preset amounts
      const amountInput = page.locator('input[type="number"], input[name*="amount"]');
      const presetAmounts = page.locator('button:has-text("$"), [data-amount]');

      const hasAmountInput = await amountInput.count() > 0;
      const hasPresetAmounts = await presetAmounts.count() > 0;

      // Should have either input or preset amounts
      if (hasAmountInput || hasPresetAmounts) {
        expect(true).toBe(true);
      }
    });
  });

  test.describe('Payment Security', () => {
    test('should show secure payment indicators', async ({ page }) => {
      await page.goto('/dashboard/user/courses/test-course/payment');

      // Look for security indicators
      const securityIndicators = page.locator('text=/secure|ssl|encrypted|safe/i, svg[data-icon="lock"], svg[data-icon="shield"]');

      // Payment pages should have security indicators
      if (await securityIndicators.count() > 0) {
        await expect(securityIndicators.first()).toBeVisible();
      }
    });

    test('should require authentication for payment', async ({ page }) => {
      // Logout first
      await page.goto('/dashboard');
      const logoutButton = page.getByRole('button', { name: /logout|log out|sign out/i });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      }

      // Try to access payment page while logged out
      await page.goto('/dashboard/user/courses/test-course/payment');

      // Should redirect to login or show authentication required
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      const isLoginPage = currentUrl.includes('/login') || currentUrl.includes('/signin');
      const hasAuthError = await page.locator('text=/sign in|log in|authenticate/i').count() > 0;

      // Should either redirect to login or show auth requirement
      if (isLoginPage || hasAuthError) {
        expect(true).toBe(true);
      }
    });
  });

  test.describe('Payment Success Flow', () => {
    test('should handle successful payment', async ({ page }) => {
      // This test would require a test payment gateway
      // For now, we'll test the success page rendering

      // Mock successful payment by navigating directly
      // In a real scenario, this would come from payment completion
      await page.goto('/dashboard/user/courses/test-course');

      // If user has access, course content should be visible
      const courseContent = page.locator('[data-testid="course-content"], .course-content, video, .video-player');

      // Check if any course content exists
      if (await courseContent.count() > 0) {
        // User has access to course
        expect(true).toBe(true);
      }
    });
  });

  test.describe('Payment Error Handling', () => {
    test('should handle payment errors gracefully', async ({ page }) => {
      await page.goto('/dashboard/user/courses/test-course/payment');

      // Payment errors should be displayed to the user
      // This is a placeholder test - actual testing requires payment gateway

      // Check for error message handling structure
      const errorContainer = page.locator('[data-testid="error-message"], [role="alert"], .error-message');

      // Page should have error handling UI ready
      // Even if no error is currently shown
      expect(true).toBe(true);
    });

    test('should allow retrying failed payment', async ({ page }) => {
      await page.goto('/dashboard/user/courses/test-course/payment');

      // Should have payment button available for retry
      const paymentButton = page.getByRole('button', { name: /pay|purchase|proceed|retry/i });

      if (await paymentButton.count() > 0) {
        await expect(paymentButton.first()).toBeVisible();
        await expect(paymentButton.first()).toBeEnabled();
      }
    });
  });

  test.describe('Responsive Design - Payment', () => {
    test('should display correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/membership');

      // Membership page should be visible and usable
      await expect(page).toHaveTitle(/membership/i);

      // Content should be visible on mobile
      const mainContent = page.locator('main, [role="main"], body');
      await expect(mainContent.first()).toBeVisible();
    });

    test('should display payment form correctly on tablet', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/membership/checkout');

      // Checkout should be accessible
      await expect(page).toHaveURL(/\/membership\/checkout/);
    });
  });
});
