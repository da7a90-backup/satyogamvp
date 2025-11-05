import { test, expect } from '@playwright/test';

const PAGES_TO_CHECK = [
  { name: 'Homepage', url: '/' },
  { name: 'About', url: '/about' },
  { name: 'Teachings', url: '/teachings' },
  { name: 'Courses', url: '/courses' },
  { name: 'Membership', url: '/membership' },
  { name: 'Membership Checkout', url: '/membership/checkout' },
  { name: 'Retreats', url: '/retreats' },
  { name: 'Online Retreats', url: '/retreats/online' },
  { name: 'Onsite Retreats', url: '/retreats/onsite' },
  { name: 'Calendar', url: '/calendar' },
  { name: 'FAQ', url: '/faq' },
  { name: 'Donate', url: '/donate' },
  { name: 'Contact', url: '/contact' },
];

test.describe('Check for 404s and missing resources', () => {
  for (const page of PAGES_TO_CHECK) {
    test(`${page.name} - should not have 404 errors`, async ({ page: pw }) => {
      const failed404s: string[] = [];
      const failedImages: string[] = [];

      // Listen for all responses
      pw.on('response', (response) => {
        const url = response.url();
        const status = response.status();

        if (status === 404) {
          failed404s.push(`404: ${url}`);
        }
      });

      // Listen for failed image loads
      pw.on('console', (msg) => {
        if (msg.type() === 'error' && msg.text().includes('404')) {
          failedImages.push(msg.text());
        }
      });

      // Navigate to the page
      await pw.goto(page.url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait a bit for lazy-loaded images
      await pw.waitForTimeout(2000);

      // Check for broken images
      const images = await pw.locator('img').all();
      for (const img of images) {
        const src = await img.getAttribute('src');
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);

        if (naturalWidth === 0 && src) {
          failedImages.push(`Broken image: ${src}`);
        }
      }

      // Check for video elements that failed to load
      const videos = await pw.locator('video').all();
      for (const video of videos) {
        const src = await video.locator('source').first().getAttribute('src');
        const networkState = await video.evaluate((el: HTMLVideoElement) => el.networkState);

        // networkState 3 = NETWORK_NO_SOURCE (failed to load)
        if (networkState === 3 && src) {
          failedImages.push(`Failed video: ${src}`);
        }
      }

      // Report all failures
      if (failed404s.length > 0) {
        console.log(`\n❌ ${page.name} - 404 Errors:`);
        failed404s.forEach(err => console.log(`  ${err}`));
      }

      if (failedImages.length > 0) {
        console.log(`\n❌ ${page.name} - Failed Images/Videos:`);
        failedImages.forEach(err => console.log(`  ${err}`));
      }

      if (failed404s.length === 0 && failedImages.length === 0) {
        console.log(`\n✅ ${page.name} - No 404s or failed resources`);
      }

      // Fail the test if there are any 404s or broken images
      expect(failed404s, `${page.name} should not have 404 errors`).toHaveLength(0);
      expect(failedImages, `${page.name} should not have broken images/videos`).toHaveLength(0);
    });
  }
});
