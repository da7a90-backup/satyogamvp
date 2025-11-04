import { test, expect } from '@playwright/test';

test.describe('Donate Payment Flow', () => {
  test('should complete payment with test card', async ({ page }) => {
    // Listen to console logs
    page.on('console', (msg) => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    });

    // Navigate to checkout page
    await page.goto('http://localhost:3000/donate/checkout?amount=45&category=animal-husbandry&projectName=Animal+Husbandry');

    // Wait for SDK to load
    await page.waitForFunction(() => window.Tilopay !== undefined, { timeout: 10000 });
    console.log('✓ Tilopay SDK loaded');

    // Wait for initialization
    await page.waitForTimeout(3000);

    // Fill in billing information
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'San Jose');
    await page.fill('input[name="state"]', 'SJ');
    await page.fill('input[name="postalCode"]', '10101');
    await page.selectOption('select[name="country"]', 'CR');
    console.log('✓ Filled billing info');

    // Wait for payment methods to load
    const paymentMethodSelect = page.locator('#tlpy_payment_method');
    await expect(paymentMethodSelect).toBeVisible();

    // Select first payment method (should be credit card)
    await page.waitForTimeout(1000);
    const options = await paymentMethodSelect.locator('option').count();
    console.log(`Found ${options} payment method options`);

    if (options > 1) {
      await paymentMethodSelect.selectOption({ index: 1 });
      console.log('✓ Selected payment method');
    }

    // Fill in card details - Using test card: 4012000000020071
    await page.fill('#tlpy_cc_number', '4012000000020071');
    await page.fill('#tlpy_cc_expiration_date', '12/25');
    await page.fill('#tlpy_cvv', '123');
    console.log('✓ Filled card details');

    // Take screenshot before submitting
    await page.screenshot({ path: 'before-payment.png', fullPage: true });

    // Click submit button
    const submitButton = page.locator('button:has-text("Complete Donation")');
    await submitButton.click();
    console.log('✓ Clicked submit button');

    // Wait for payment processing
    await page.waitForTimeout(5000);

    // Take screenshot after submitting
    await page.screenshot({ path: 'after-payment.png', fullPage: true });

    // Check if we were redirected to thank you page or if there's an error
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Check for any error messages
    const errorMessage = await page.locator('text=/failed|error/i').first().textContent().catch(() => null);
    if (errorMessage) {
      console.log('Error message:', errorMessage);
    }
  });
});
