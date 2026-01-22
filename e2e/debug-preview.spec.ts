import { test, expect } from '@playwright/test';

test('Debug preview refresh issue', async ({ page }) => {
  // Capture console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    console.log(`[CONSOLE ${msg.type()}]:`, text);
  });

  // Capture network requests
  const requests: string[] = [];
  page.on('request', request => {
    const url = request.url();
    if (url.includes('localhost:3000') || url.includes('localhost:8000')) {
      requests.push(`${request.method()} ${url}`);
      console.log(`[REQUEST]: ${request.method()} ${url}`);
    }
  });

  // Navigate to login page
  await page.goto('http://localhost:3000/login');

  // Login as admin
  await page.fill('input[name="email"]', 'admin@test.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');

  // Wait for redirect to admin dashboard
  await page.waitForURL(/dashboard\/admin/, { timeout: 10000 });
  console.log('[TEST]: Logged in successfully');

  // Navigate to content homepage editor
  await page.goto('http://localhost:3000/dashboard/admin/content/homepage');
  await page.waitForLoadState('networkidle');
  console.log('[TEST]: Navigated to content editor');

  // Click "Show Preview" button
  const showPreviewButton = page.locator('button:has-text("Show Preview")');
  await showPreviewButton.click();
  console.log('[TEST]: Clicked Show Preview button');

  // Wait and observe for 10 seconds
  console.log('[TEST]: Waiting 10 seconds to observe behavior...');
  await page.waitForTimeout(10000);

  // Count how many times homepage was fetched
  const homepageRequests = requests.filter(r => r.includes('/api/pages/homepage'));
  console.log(`[TEST]: Homepage API called ${homepageRequests.length} times`);

  // Check if iframe exists
  const iframe = page.frameLocator('iframe[title="Page Preview"]');
  const iframeExists = await page.locator('iframe[title="Page Preview"]').count() > 0;
  console.log(`[TEST]: Iframe exists: ${iframeExists}`);

  // Log summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total requests: ${requests.length}`);
  console.log(`Homepage API calls: ${homepageRequests.length}`);
  console.log(`Console logs: ${consoleLogs.length}`);

  // Print recent requests
  console.log('\n=== LAST 20 REQUESTS ===');
  requests.slice(-20).forEach(req => console.log(req));

  // Print console logs mentioning refresh or reload
  console.log('\n=== REFRESH/RELOAD RELATED LOGS ===');
  consoleLogs
    .filter(log => log.toLowerCase().includes('refresh') || log.toLowerCase().includes('reload'))
    .forEach(log => console.log(log));

  // Save logs to file
  const fs = require('fs');
  fs.writeFileSync('/tmp/preview-debug.log', JSON.stringify({
    requests,
    consoleLogs,
    summary: {
      totalRequests: requests.length,
      homepageApiCalls: homepageRequests.length,
      consoleLogCount: consoleLogs.length
    }
  }, null, 2));
  console.log('\n[TEST]: Logs saved to /tmp/preview-debug.log');
});
