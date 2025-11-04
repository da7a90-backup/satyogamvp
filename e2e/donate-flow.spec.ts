import { test, expect } from '@playwright/test';

test.describe('Donation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the donate page
    await page.goto('http://localhost:3000/donate');
  });

  test('should complete donation flow with successful Visa card', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find and click a donation button to go to checkout
    // Look for the "General Fund" section and click a preset amount or enter custom amount
    const customAmountInput = page.locator('input[type="number"]').first();
    await customAmountInput.fill('25');

    // Click Accept button to proceed to checkout
    const acceptButton = page.locator('button:has-text("Accept")').first();
    await acceptButton.click();

    // Wait for checkout page to load
    await page.waitForURL(/\/donate\/checkout/);
    await page.waitForLoadState('networkidle');

    // Verify we're on the checkout page
    await expect(page.locator('h1:has-text("Create account or login")')).toBeVisible();

    // Fill in payment information
    // Card number - Using test Visa card 4012000000020071
    const cardNumberInput = page.locator('input[placeholder*="1234"]');
    await cardNumberInput.fill('4012000000020071');

    // Expiry date
    const expiryInput = page.locator('input[placeholder*="02/26"]');
    await expiryInput.fill('12/26');

    // CVV
    const cvvInput = page.locator('input[placeholder*="112"]');
    await cvvInput.fill('123');

    // Fill in invoice information
    await page.locator('input[name="firstName"]').fill('Test');
    await page.locator('input[name="lastName"]').fill('User');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('select[name="country"]').selectOption('CR');
    await page.locator('input[name="address"]').fill('123 Test Street');
    await page.locator('input[name="city"]').fill('San Jose');
    await page.locator('input[name="state"]').fill('San Jose');
    await page.locator('input[name="postalCode"]').fill('10101');

    // Accept terms
    await page.locator('input[type="checkbox"]').first().check();

    // Click confirm payment button
    const confirmButton = page.locator('button:has-text("Confirm payment")');
    await confirmButton.click();

    // Wait for processing
    await expect(confirmButton).toContainText('Processing...');

    // Note: In a real scenario, we would be redirected to Tilopay
    // For testing purposes, we verify the form submission was initiated
  });

  test('should handle MasterCard test card', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Navigate directly to checkout with amount
    await page.goto('http://localhost:3000/donate/checkout?amount=50&category=general-fund&projectName=General+Fund');
    await page.waitForLoadState('networkidle');

    // Fill in payment information with MasterCard test card 5100270000000023
    await page.locator('input[placeholder*="1234"]').fill('5100270000000023');
    await page.locator('input[placeholder*="02/26"]').fill('12/26');
    await page.locator('input[placeholder*="112"]').fill('123');

    // Fill in billing info
    await page.locator('input[name="firstName"]').fill('Test');
    await page.locator('input[name="lastName"]').fill('User');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('select[name="country"]').selectOption('CR');

    // Accept terms
    await page.locator('input[type="checkbox"]').first().check();

    // Verify the donation amount is displayed correctly in the order summary
    await expect(page.locator('text=$50.00').first()).toBeVisible();
  });

  test('should handle American Express test card', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Navigate directly to checkout
    await page.goto('http://localhost:3000/donate/checkout?amount=100&category=general-fund&projectName=General+Fund');
    await page.waitForLoadState('networkidle');

    // Fill in payment information with Amex test card 341111000000009
    await page.locator('input[placeholder*="1234"]').fill('341111000000009');
    await page.locator('input[placeholder*="02/26"]').fill('12/26');
    await page.locator('input[placeholder*="112"]').fill('1234'); // Amex has 4-digit CVV

    // Fill in billing info
    await page.locator('input[name="firstName"]').fill('Test');
    await page.locator('input[name="lastName"]').fill('User');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('select[name="country"]').selectOption('USA');

    // Accept terms
    await page.locator('input[type="checkbox"]').first().check();

    // Verify the donation amount
    await expect(page.locator('text=$100.00').first()).toBeVisible();
  });

  test('should display correct page elements after cleanup', async ({ page }) => {
    await page.goto('http://localhost:3000/donate/checkout?amount=25&category=general-fund&projectName=General+Fund');
    await page.waitForLoadState('networkidle');

    // Verify "Choose your plan" section is removed
    await expect(page.locator('h2:has-text("Choose your plan")')).not.toBeVisible();

    // Verify "Donate to the general fund" section is removed
    await expect(page.locator('h2:has-text("Donate to the general fund")')).not.toBeVisible();

    // Verify discount code section is removed
    await expect(page.locator('label:has-text("Discount code")')).not.toBeVisible();

    // Verify remaining sections are properly numbered
    await expect(page.locator('h1:has-text("1. Create account or login")')).toBeVisible();
    await expect(page.locator('h2:has-text("2. Payment information")')).toBeVisible();
    await expect(page.locator('h2:has-text("3. Invoice information")')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('http://localhost:3000/donate/checkout?amount=25&category=general-fund&projectName=General+Fund');
    await page.waitForLoadState('networkidle');

    // Try to submit without filling required fields
    const confirmButton = page.locator('button:has-text("Confirm payment")');
    await confirmButton.click();

    // Should show validation - checking for browser's built-in validation
    // The form should not be submitted (page should still be on checkout)
    await expect(page).toHaveURL(/\/donate\/checkout/);
  });
});
