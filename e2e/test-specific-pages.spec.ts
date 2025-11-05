import { test, expect } from '@playwright/test';

const BASE_URL = 'https://satyogamvp.vercel.app';

test.describe('Specific Pages Test', () => {
  const pages = [
    { url: '/teachings', name: 'Teachings' },
    { url: '/courses', name: 'Courses' },
    { url: '/membership', name: 'Membership' },
    { url: '/donate', name: 'Donate' },
    { url: '/faq', name: 'FAQ' }
  ];

  for (const page of pages) {
    test(`Test ${page.name} page`, async ({ page: browserPage }) => {
      const errors: string[] = [];
      const failedRequests: Array<{ url: string; status: number; type: string }> = [];
      const loadedImages: string[] = [];
      const failedImages: string[] = [];

      // Capture console errors
      browserPage.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Capture failed network requests
      browserPage.on('response', response => {
        const url = response.url();
        const status = response.status();

        if (!response.ok() && status !== 304) {
          const type = response.headers()['content-type'] || 'unknown';
          failedRequests.push({ url, status, type });
        }
      });

      console.log(`\n${'='.repeat(80)}`);
      console.log(`Testing: ${page.name} (${BASE_URL}${page.url})`);
      console.log('='.repeat(80));

      try {
        // Navigate to page
        const response = await browserPage.goto(`${BASE_URL}${page.url}`, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        console.log(`✓ Page loaded - HTTP ${response?.status()}`);

        // Get page title
        const title = await browserPage.title();
        console.log(`✓ Page title: "${title}"`);

        // Check for main content
        const body = await browserPage.textContent('body');
        const hasContent = body && body.trim().length > 100;
        console.log(`✓ Page has content: ${hasContent ? 'YES' : 'NO'} (${body?.trim().length || 0} chars)`);

        // Check images
        const images = browserPage.locator('img');
        const imageCount = await images.count();
        console.log(`\n📷 Images:`);
        console.log(`  Total images found: ${imageCount}`);

        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i);
          const src = await img.getAttribute('src');
          const alt = await img.getAttribute('alt') || '(no alt)';
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);

          if (naturalWidth === 0 || naturalHeight === 0) {
            console.log(`  ✗ FAILED: ${src?.substring(0, 80)} - ${alt}`);
            if (src) failedImages.push(src);
          } else {
            console.log(`  ✓ Loaded: ${src?.substring(0, 60)}... (${naturalWidth}x${naturalHeight})`);
            if (src) loadedImages.push(src);
          }
        }

        // Check for video
        const videos = browserPage.locator('video');
        const videoCount = await videos.count();
        if (videoCount > 0) {
          console.log(`\n🎥 Videos found: ${videoCount}`);
          for (let i = 0; i < videoCount; i++) {
            const video = videos.nth(i);
            const src = await video.getAttribute('src');
            const poster = await video.getAttribute('poster');
            console.log(`  Video ${i + 1}: ${src || 'no src'}`);
            console.log(`  Poster: ${poster || 'no poster'}`);
          }
        }

        // Check for buttons/CTAs
        const buttons = browserPage.locator('button, a[role="button"], .btn, [class*="button"]');
        const buttonCount = await buttons.count();
        console.log(`\n🔘 Interactive elements: ${buttonCount}`);

        // Wait for any lazy loading
        await browserPage.waitForTimeout(2000);

        // Take screenshot
        const screenshotPath = `test-results/${page.name.toLowerCase()}-page.png`;
        await browserPage.screenshot({
          path: screenshotPath,
          fullPage: true
        });
        console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

        // Summary
        console.log(`\n📊 Summary:`);
        console.log(`  Console errors: ${errors.length}`);
        console.log(`  Failed requests: ${failedRequests.length}`);
        console.log(`  Images loaded: ${loadedImages.length}`);
        console.log(`  Images failed: ${failedImages.length}`);

        if (errors.length > 0) {
          console.log(`\n❌ Console Errors:`);
          errors.forEach(err => console.log(`  - ${err.substring(0, 200)}`));
        }

        if (failedRequests.length > 0) {
          console.log(`\n❌ Failed Requests:`);
          failedRequests.forEach(req => {
            console.log(`  [${req.status}] ${req.url.substring(0, 100)}`);
          });
        }

        if (failedImages.length > 0) {
          console.log(`\n❌ Failed Images:`);
          failedImages.forEach(img => console.log(`  - ${img}`));
        }

      } catch (error) {
        console.log(`\n❌ Error loading page: ${error}`);
        throw error;
      }
    });
  }

  test('Check API endpoints directly', async ({ page }) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log('Testing API Endpoints');
    console.log('='.repeat(80));

    const apiTests = [
      { url: '/api/teachings', name: 'Teachings API' },
      { url: '/api/courses', name: 'Courses API' },
      { url: '/api/faq/categories', name: 'FAQ Categories API' },
    ];

    for (const api of apiTests) {
      try {
        const response = await page.request.get(`https://graduation-dec-housewares-municipality.trycloudflare.com${api.url}`);
        console.log(`\n${api.name}:`);
        console.log(`  Status: ${response.status()}`);
        console.log(`  OK: ${response.ok()}`);

        if (response.ok()) {
          const data = await response.json();
          console.log(`  Data received: ${JSON.stringify(data).substring(0, 200)}...`);
        } else {
          console.log(`  Error: ${await response.text()}`);
        }
      } catch (error) {
        console.log(`\n${api.name}: ❌ FAILED`);
        console.log(`  Error: ${error}`);
      }
    }
  });
});
