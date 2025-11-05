import { test, expect } from '@playwright/test';

test.describe('Production Site Test - https://satyogamvp.vercel.app/', () => {
  test('Homepage - Check for errors and loading issues', async ({ page }) => {
    const errors: string[] = [];
    const failedRequests: Array<{ url: string; status: number }> = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Capture failed network requests
    page.on('response', response => {
      if (!response.ok() && response.status() !== 304) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    // Navigate to production site
    await page.goto('https://satyogamvp.vercel.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Take screenshot of homepage
    await page.screenshot({
      path: 'test-results/production-homepage.png',
      fullPage: true
    });

    // Check page title
    const title = await page.title();
    console.log('Page title:', title);

    // Check for video element
    const videoExists = await page.locator('video').count();
    console.log('Video elements found:', videoExists);

    // Check for images
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log('Total images found:', imageCount);

    // Check which images failed to load
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);

      if (naturalWidth === 0 && src) {
        console.log('Failed to load image:', src);
        failedRequests.push({ url: src, status: 0 });
      }
    }

    // Log all errors
    console.log('\n=== CONSOLE ERRORS ===');
    errors.forEach(error => console.log('ERROR:', error));

    console.log('\n=== FAILED REQUESTS ===');
    failedRequests.forEach(req => {
      console.log(`${req.status}: ${req.url}`);
    });

    // Check if blog posts loaded
    const blogPosts = page.locator('article, [data-testid="blog-post"]');
    const blogPostCount = await blogPosts.count();
    console.log('\nBlog posts found:', blogPostCount);

    // Check if navigation exists
    const nav = page.locator('nav');
    const navExists = await nav.count();
    console.log('Navigation found:', navExists > 0);

    // Wait a bit for any lazy-loaded content
    await page.waitForTimeout(2000);

    // Final screenshot after everything loaded
    await page.screenshot({
      path: 'test-results/production-homepage-final.png',
      fullPage: true
    });

    // Report summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total console errors: ${errors.length}`);
    console.log(`Total failed requests: ${failedRequests.length}`);
    console.log(`Images loaded: ${imageCount}`);
    console.log(`Video elements: ${videoExists}`);
  });

  test('Test About page', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('https://satyogamvp.vercel.app/about/satyoga', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.screenshot({
      path: 'test-results/production-about.png',
      fullPage: true
    });

    console.log('About page console errors:', errors.length);
    errors.forEach(error => console.log('ERROR:', error));
  });

  test('Test API connectivity', async ({ page }) => {
    // Test direct API call
    const response = await page.request.get('https://graduation-dec-housewares-municipality.trycloudflare.com/api/blog/posts?page=1&page_size=3');

    console.log('\n=== API TEST ===');
    console.log('API Status:', response.status());
    console.log('API OK:', response.ok());

    if (response.ok()) {
      const data = await response.json();
      console.log('Blog posts returned:', data.posts?.length || 0);
    } else {
      console.log('API Error:', await response.text());
    }
  });
});
