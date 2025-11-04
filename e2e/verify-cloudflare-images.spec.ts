import { test, expect } from '@playwright/test';

test.describe('Verify Cloudflare Images', () => {
  test('/about/shunyamurti - all images from Cloudflare except logos', async ({ page }) => {
    const imageRequests: { url: string; fromCloudflare: boolean }[] = [];

    page.on('request', request => {
      const url = request.url();
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        const fromCloudflare = url.includes('imagedelivery.net');
        imageRequests.push({ url, fromCloudflare });
      }
    });

    await page.goto('http://localhost:3000/about/shunyamurti', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    // Filter out logos - these are fine to load from /public
    const publicImages = imageRequests.filter(img =>
      !img.fromCloudflare &&
      (img.url.includes('localhost:3000/') || img.url.startsWith('http://localhost:3000/')) &&
      !img.url.includes('logo_black.svg') &&
      !img.url.includes('logo_white.svg') &&
      !img.url.includes('favicon')
    );

    const cloudflareImages = imageRequests.filter(img => img.fromCloudflare);

    console.log(`\n📊 /about/shunyamurti IMAGE SUMMARY:`);
    console.log(`   Total images: ${imageRequests.length}`);
    console.log(`   Cloudflare CDN: ${cloudflareImages.length}`);
    console.log(`   Local /public (excluding logos): ${publicImages.length}\n`);

    console.log(`✅ Cloudflare Images (${cloudflareImages.length}):`);
    cloudflareImages.forEach(img => {
      const urlParts = img.url.split('/');
      const uuid = urlParts[urlParts.length - 2] || '';
      console.log(`   ✓ UUID: ${uuid.substring(0, 20)}...`);
    });

    console.log(`\n❌ Local /public Images (${publicImages.length}):`);
    publicImages.forEach(img => {
      const filename = img.url.split('/').pop() || img.url;
      console.log(`   ✗ ${filename}`);
    });

    // Assert NO images from /public (except logos)
    expect(publicImages.length).toBe(0);
  });

  test('/about/satyoga - all images from Cloudflare except logos', async ({ page }) => {
    const imageRequests: { url: string; fromCloudflare: boolean }[] = [];

    page.on('request', request => {
      const url = request.url();
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        const fromCloudflare = url.includes('imagedelivery.net');
        imageRequests.push({ url, fromCloudflare });
      }
    });

    await page.goto('http://localhost:3000/about/satyoga', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    const publicImages = imageRequests.filter(img =>
      !img.fromCloudflare &&
      (img.url.includes('localhost:3000/') || img.url.startsWith('http://localhost:3000/')) &&
      !img.url.includes('logo_black.svg') &&
      !img.url.includes('logo_white.svg') &&
      !img.url.includes('favicon')
    );

    const cloudflareImages = imageRequests.filter(img => img.fromCloudflare);

    console.log(`\n📊 /about/satyoga IMAGE SUMMARY:`);
    console.log(`   Total images: ${imageRequests.length}`);
    console.log(`   Cloudflare CDN: ${cloudflareImages.length}`);
    console.log(`   Local /public (excluding logos): ${publicImages.length}\n`);

    console.log(`✅ Cloudflare Images (${cloudflareImages.length}):`);
    cloudflareImages.forEach(img => {
      const urlParts = img.url.split('/');
      const uuid = urlParts[urlParts.length - 2] || '';
      console.log(`   ✓ UUID: ${uuid.substring(0, 20)}...`);
    });

    console.log(`\n❌ Local /public Images (${publicImages.length}):`);
    publicImages.forEach(img => {
      const filename = img.url.split('/').pop() || img.url;
      console.log(`   ✗ ${filename}`);
    });

    expect(publicImages.length).toBe(0);
  });

  test('/about/ashram - all images from Cloudflare except logos', async ({ page }) => {
    const imageRequests: { url: string; fromCloudflare: boolean }[] = [];

    page.on('request', request => {
      const url = request.url();
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        const fromCloudflare = url.includes('imagedelivery.net');
        imageRequests.push({ url, fromCloudflare });
      }
    });

    await page.goto('http://localhost:3000/about/ashram', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    const publicImages = imageRequests.filter(img =>
      !img.fromCloudflare &&
      (img.url.includes('localhost:3000/') || img.url.startsWith('http://localhost:3000/')) &&
      !img.url.includes('logo_black.svg') &&
      !img.url.includes('logo_white.svg') &&
      !img.url.includes('favicon')
    );

    const cloudflareImages = imageRequests.filter(img => img.fromCloudflare);

    console.log(`\n📊 /about/ashram IMAGE SUMMARY:`);
    console.log(`   Total images: ${imageRequests.length}`);
    console.log(`   Cloudflare CDN: ${cloudflareImages.length}`);
    console.log(`   Local /public (excluding logos): ${publicImages.length}\n`);

    console.log(`✅ Cloudflare Images (${cloudflareImages.length}):`);
    cloudflareImages.forEach(img => {
      const urlParts = img.url.split('/');
      const uuid = urlParts[urlParts.length - 2] || '';
      console.log(`   ✓ UUID: ${uuid.substring(0, 20)}...`);
    });

    console.log(`\n❌ Local /public Images (${publicImages.length}):`);
    publicImages.forEach(img => {
      const filename = img.url.split('/').pop() || img.url;
      console.log(`   ✗ ${filename}`);
    });

    expect(publicImages.length).toBe(0);
  });

  test('/retreats/ashram - all images from Cloudflare except logos', async ({ page }) => {
    const imageRequests: { url: string; fromCloudflare: boolean }[] = [];

    page.on('request', request => {
      const url = request.url();
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        const fromCloudflare = url.includes('imagedelivery.net');
        imageRequests.push({ url, fromCloudflare });
      }
    });

    await page.goto('http://localhost:3000/retreats/ashram', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    const publicImages = imageRequests.filter(img =>
      !img.fromCloudflare &&
      (img.url.includes('localhost:3000/') || img.url.startsWith('http://localhost:3000/')) &&
      !img.url.includes('logo_black.svg') &&
      !img.url.includes('logo_white.svg') &&
      !img.url.includes('favicon')
    );

    const cloudflareImages = imageRequests.filter(img => img.fromCloudflare);

    console.log(`\n📊 /retreats/ashram IMAGE SUMMARY:`);
    console.log(`   Total images: ${imageRequests.length}`);
    console.log(`   Cloudflare CDN: ${cloudflareImages.length}`);
    console.log(`   Local /public (excluding logos): ${publicImages.length}\n`);

    console.log(`✅ Cloudflare Images (${cloudflareImages.length}):`);
    cloudflareImages.forEach(img => {
      const urlParts = img.url.split('/');
      const uuid = urlParts[urlParts.length - 2] || '';
      console.log(`   ✓ UUID: ${uuid.substring(0, 20)}...`);
    });

    console.log(`\n❌ Local /public Images (${publicImages.length}):`);
    publicImages.forEach(img => {
      const filename = img.url.split('/').pop() || img.url;
      console.log(`   ✗ ${filename}`);
    });

    expect(publicImages.length).toBe(0);
  });
});
