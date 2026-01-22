import { test, expect } from '@playwright/test';

test('Monitor preview logs', async ({ page }) => {
  // Capture console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push(`[${type}] ${text}`);
    console.log(`[BROWSER ${type.toUpperCase()}]: ${text}`);
  });

  // Capture network requests
  const requests: string[] = [];
  const requestCount: { [key: string]: number } = {};

  page.on('request', request => {
    const url = request.url();
    const method = request.method();
    const key = `${method} ${url}`;

    requestCount[key] = (requestCount[key] || 0) + 1;

    if (url.includes('localhost') || url.includes('api')) {
      requests.push(`[${requestCount[key]}] ${method} ${url}`);
      console.log(`[REQUEST ${requestCount[key]}]: ${method} ${url}`);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR]: ${error.message}`);
  });

  // Open browser and wait for manual navigation
  await page.goto('http://localhost:3000');
  console.log('\n=== BROWSER OPENED ===');
  console.log('Please login and navigate to the content editor');
  console.log('Click "Show Preview" when ready');
  console.log('Monitoring for 60 seconds...\n');

  // Wait for 60 seconds to observe
  await page.waitForTimeout(60000);

  // Print summary
  console.log('\n=== MONITORING COMPLETE ===');
  console.log(`Total requests captured: ${requests.length}`);

  // Count homepage API calls
  const homepageApiCalls = requests.filter(r => r.includes('/api/pages/homepage'));
  console.log(`Homepage API calls: ${homepageApiCalls.length}`);

  // Print request frequency
  console.log('\n=== REQUEST FREQUENCY ===');
  const sorted = Object.entries(requestCount)
    .filter(([url]) => url.includes('api') || url.includes('localhost:3000/'))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sorted.forEach(([url, count]) => {
    if (count > 1) {
      console.log(`${count}x - ${url}`);
    }
  });

  // Save detailed logs
  const fs = require('fs');
  const logData = {
    requests,
    consoleLogs,
    requestCount,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync('/tmp/preview-monitor.json', JSON.stringify(logData, null, 2));
  console.log('\n[SAVED]: Detailed logs saved to /tmp/preview-monitor.json');
});
