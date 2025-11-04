import { test, expect } from '@playwright/test';

test.describe('Donate Checkout', () => {
  test('should initialize Tilopay SDK and show payment form', async ({ page }) => {
    // Listen to console logs
    page.on('console', (msg) => {
      console.log(`[BROWSER ${msg.type()}]:`, msg.text());
    });

    // Listen to network requests to see what's being sent to Tilopay
    page.on('request', (request) => {
      if (request.url().includes('tilopay.com')) {
        console.log('REQUEST TO TILOPAY:', request.url());
        console.log('METHOD:', request.method());
        console.log('HEADERS:', request.headers());
        if (request.postDataJSON()) {
          console.log('POST DATA:', JSON.stringify(request.postDataJSON(), null, 2));
        }
      }
    });

    page.on('response', async (response) => {
      if (response.url().includes('tilopay.com')) {
        console.log('RESPONSE FROM TILOPAY:', response.url());
        console.log('STATUS:', response.status());
        try {
          const body = await response.json();
          console.log('RESPONSE BODY:', JSON.stringify(body, null, 2));
        } catch (e) {
          console.log('Response body not JSON');
        }
      }
    });

    // Navigate to checkout page
    await page.goto('http://localhost:3000/donate/checkout?amount=45&category=animal-husbandry&projectName=Animal+Husbandry');

    // Wait for SDK to load
    await page.waitForFunction(() => window.Tilopay !== undefined, { timeout: 10000 });
    console.log('Tilopay SDK loaded');

    // Wait for initialization attempt
    await page.waitForTimeout(3000);

    // Check if payment form is visible
    const paymentMethod = await page.locator('#tlpy_payment_method');
    await expect(paymentMethod).toBeVisible();

    // Take screenshot for debugging
    await page.screenshot({ path: 'checkout-debug.png', fullPage: true });

    console.log('Test completed');
  });
});
