import { test, expect } from '@playwright/test';

test('contact page shows map image', async ({ page }) => {
  await page.goto('http://localhost:3000/contact');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Check if map image container is present
  const mapContainer = page.locator('img[alt*="Location map"]');

  // Take screenshot
  await page.screenshot({ path: '/tmp/contact-page-with-map.png', fullPage: true });

  // Check if map is visible
  await expect(mapContainer).toBeVisible({ timeout: 10000 });

  console.log('✅ Map image is visible on contact page!');
});
