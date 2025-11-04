import { test, expect } from '@playwright/test';

test.describe('Retreat Pages - Backend Data Verification', () => {
  const CLOUDFLARE_CDN = 'https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/';
  const retreatPages = [
    '/retreats/ashram',
    '/retreats/shakti',
    '/retreats/darshan',
    '/retreats/sevadhari'
  ];

  test.beforeEach(async ({ page }) => {
    // Track network requests
    await page.route('**/*', route => route.continue());
  });

  for (const retreatPath of retreatPages) {
    test(`${retreatPath} should load all images from Cloudflare CDN`, async ({ page }) => {
      const imageRequests: { url: string; local: boolean }[] = [];

      // Intercept image requests
      page.on('request', request => {
        const url = request.url();
        if (
          request.resourceType() === 'image' ||
          url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
        ) {
          const isLocal = url.includes('localhost:3000/') &&
                         !url.includes(CLOUDFLARE_CDN) &&
                         !url.includes('/_next/') && // Allow Next.js internal images
                         !url.includes('/favicon.ico'); // Allow favicon

          imageRequests.push({
            url,
            local: isLocal
          });
        }
      });

      // Navigate to retreat page
      await page.goto(`http://localhost:3000${retreatPath}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for images to load
      await page.waitForTimeout(2000);

      // Filter out local images (excluding Next.js internal ones)
      const localImages = imageRequests.filter(req => req.local);
      const cloudflareImages = imageRequests.filter(req =>
        req.url.includes(CLOUDFLARE_CDN)
      );

      console.log(`\n=== ${retreatPath} IMAGE AUDIT ===`);
      console.log(`Total images loaded: ${imageRequests.length}`);
      console.log(`Cloudflare CDN images: ${cloudflareImages.length}`);
      console.log(`Local images (should be 0): ${localImages.length}`);

      if (localImages.length > 0) {
        console.log('\n❌ LOCAL IMAGES FOUND:');
        localImages.forEach(img => console.log(`  - ${img.url}`));
      }

      if (cloudflareImages.length > 0) {
        console.log('\n✅ CLOUDFLARE IMAGES:');
        cloudflareImages.slice(0, 5).forEach(img => console.log(`  - ${img.url.substring(0, 80)}...`));
        if (cloudflareImages.length > 5) {
          console.log(`  ... and ${cloudflareImages.length - 5} more`);
        }
      }

      // Assertions
      expect(localImages.length,
        `Found ${localImages.length} local images that should be from backend:\n${localImages.map(i => i.url).join('\n')}`
      ).toBe(0);

      expect(cloudflareImages.length,
        'Should have Cloudflare images from backend'
      ).toBeGreaterThan(0);
    });

    test(`${retreatPath} should have no hardcoded /public images in DOM`, async ({ page }) => {
      await page.goto(`http://localhost:3000${retreatPath}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Check for hardcoded image paths in img tags
      const hardcodedImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
          .map(img => img.src)
          .filter(src => {
            // Filter for local paths that should be from backend
            return (
              src.includes('localhost:3000/') &&
              !src.includes('/_next/') &&
              !src.includes('/favicon.ico') &&
              (
                src.includes('.jpg') ||
                src.includes('.png') ||
                src.includes('.jpeg') ||
                src.includes('/ssi.jpg') ||
                src.includes('/darshan.jpg') ||
                src.includes('/sevadhari.jpg') ||
                src.includes('/progicon.png') ||
                src.includes('/testimonial.png') ||
                src.includes('/illustrations.png')
              )
            );
          });
      });

      console.log(`\n=== ${retreatPath} DOM IMAGE CHECK ===`);
      if (hardcodedImages.length > 0) {
        console.log('❌ HARDCODED IMAGES IN DOM:');
        hardcodedImages.forEach(src => console.log(`  - ${src}`));
      } else {
        console.log('✅ No hardcoded images found in DOM');
      }

      expect(hardcodedImages.length,
        `Found hardcoded images in DOM:\n${hardcodedImages.join('\n')}`
      ).toBe(0);
    });
  }

  test('/retreats/ashram should display retreat cards from backend', async ({ page }) => {
    await page.goto('http://localhost:3000/retreats/ashram', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Check for retreat cards
    const retreatCards = page.locator('text=Shakti Saturation Intensive');
    await expect(retreatCards).toBeVisible({ timeout: 10000 });

    const darshanCard = page.locator('text=Private Darshan');
    await expect(darshanCard).toBeVisible();

    const sevadhariCard = page.locator('text=Become a Sevadhari');
    await expect(sevadhariCard).toBeVisible();

    // Verify all card images are from Cloudflare
    const cardImages = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('img'));
      return cards
        .map(img => img.src)
        .filter(src => src.includes('imagedelivery.net'));
    });

    console.log(`\n=== RETREAT CARDS IMAGE CHECK ===`);
    console.log(`Cloudflare images in cards: ${cardImages.length}`);

    expect(cardImages.length, 'Retreat cards should use Cloudflare images').toBeGreaterThan(0);
  });

  test('All retreat pages should load carousel images from backend', async ({ page }) => {
    for (const retreatPath of ['/retreats/shakti', '/retreats/darshan', '/retreats/sevadhari']) {
      console.log(`\nChecking carousel on ${retreatPath}...`);

      await page.goto(`http://localhost:3000${retreatPath}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for carousel to load
      await page.waitForTimeout(2000);

      // Check for carousel images
      const carouselImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
          .map(img => ({
            src: img.src,
            isCloudflare: img.src.includes('imagedelivery.net')
          }))
          .filter(img => img.isCloudflare);
      });

      console.log(`  Carousel images from Cloudflare: ${carouselImages.length}`);
      expect(carouselImages.length,
        `${retreatPath} should have carousel images from Cloudflare`
      ).toBeGreaterThan(0);
    }
  });
});
