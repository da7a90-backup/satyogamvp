import { test, expect } from '@playwright/test';

test.describe('Homepage Migration Test', () => {
  test('should load homepage data from backend API', async ({ page }) => {
    const consoleMessages: string[] = [];
    const errors: string[] = [];

    // Capture console logs
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      console.log(`[CONSOLE ${msg.type()}] ${text}`);
    });

    // Capture page errors
    page.on('pageerror', error => {
      const errorMsg = `${error.name}: ${error.message}\n${error.stack}`;
      errors.push(errorMsg);
      console.error('[PAGE ERROR]', errorMsg);
    });

    // Go to homepage
    console.log('Navigating to homepage...');
    const response = await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`Response status: ${response?.status()}`);

    // Wait a bit for any async operations
    await page.waitForTimeout(2000);

    // Check for errors
    if (errors.length > 0) {
      console.error('\n=== PAGE ERRORS ===');
      errors.forEach(err => console.error(err));
    }

    // Log all console messages
    console.log('\n=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));

    // Check if page loaded
    const title = await page.title();
    console.log(`\nPage title: ${title}`);

    // Try to find homepage content
    const hasContent = await page.locator('body').textContent();
    console.log(`\nPage has content: ${hasContent ? 'Yes' : 'No'}`);

    // Check for specific error messages
    const errorElements = await page.locator('text=/error/i').count();
    console.log(`Error elements found: ${errorElements}`);

    // Screenshot for debugging
    await page.screenshot({ path: 'homepage-debug.png', fullPage: true });
    console.log('\nScreenshot saved to homepage-debug.png');

    // Assertions
    expect(errors.length).toBe(0);
    expect(response?.status()).toBe(200);
  });

  test('should verify API call to backend', async ({ page }) => {
    const apiCalls: any[] = [];

    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`);
        apiCalls.push({
          method: request.method(),
          url: request.url()
        });
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        const status = response.status();
        console.log(`[RESPONSE] ${status} ${response.url()}`);

        if (response.url().includes('/api/pages/homepage')) {
          try {
            const data = await response.json();
            console.log('\n=== HOMEPAGE API RESPONSE ===');
            console.log(JSON.stringify(data, null, 2).substring(0, 500));
          } catch (e) {
            console.error('Failed to parse JSON response');
          }
        }
      }
    });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log(`\nTotal API calls made: ${apiCalls.length}`);
    apiCalls.forEach(call => {
      console.log(`  - ${call.method} ${call.url}`);
    });
  });
});
