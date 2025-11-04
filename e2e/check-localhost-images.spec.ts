import { test, expect } from '@playwright/test';

test('/retreats/online - check for localhost images', async ({ page }) => {
  const requests: string[] = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('localhost:3000') && (url.match(/\.(jpg|png|jpeg|webp|svg)/i))) {
      requests.push(url);
    }
  });

  await page.goto('http://localhost:3000/retreats/online');
  await page.waitForLoadState('networkidle');

  console.log('\n=== LOCALHOST IMAGES ON /retreats/online ===');
  if (requests.length > 0) {
    console.log('Found localhost images:');
    requests.forEach(url => console.log(`  - ${url}`));
  } else {
    console.log('✅ No localhost images found!');
  }

  expect(requests.length).toBe(0);
});

test('/retreats/online/hopeless-yet-hilarious - check for localhost images', async ({ page }) => {
  const requests: string[] = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('localhost:3000') && (url.match(/\.(jpg|png|jpeg|webp|svg)/i))) {
      requests.push(url);
    }
  });

  await page.goto('http://localhost:3000/retreats/online/hopeless-yet-hilarious');
  await page.waitForLoadState('networkidle');

  console.log('\n=== LOCALHOST IMAGES ON /retreats/online/hopeless-yet-hilarious ===');
  if (requests.length > 0) {
    console.log('Found localhost images:');
    requests.forEach(url => console.log(`  - ${url}`));
  } else {
    console.log('✅ No localhost images found!');
  }

  expect(requests.length).toBe(0);
});
