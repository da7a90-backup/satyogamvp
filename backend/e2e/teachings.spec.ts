import { test, expect } from '@playwright/test';

test.describe('Teachings Pages', () => {
  test('teachings list page loads and displays teachings', async ({ page }) => {
    // Go to teachings page
    await page.goto('http://localhost:3000/teachings');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/teachings-list.png', fullPage: true });

    // Check page title
    await expect(page).toHaveTitle(/Teachings/i);

    // Check that teaching cards are visible
    const teachingCards = page.locator('[data-testid="teaching-card"], .teaching-card, article');
    await expect(teachingCards.first()).toBeVisible({ timeout: 10000 });

    // Log number of teachings found
    const count = await teachingCards.count();
    console.log(`Found ${count} teaching cards`);
  });

  test('teaching detail page loads with video', async ({ page }) => {
    // Go to a specific teaching
    await page.goto('http://localhost:3000/teachings/love-creates-destroys');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/teaching-detail.png', fullPage: true });

    // Check that video or audio player is visible
    const videoPlayer = page.locator('iframe, video, .video-player, .audio-player').first();
    await expect(videoPlayer).toBeVisible({ timeout: 10000 });

    console.log('Video/audio player found');
  });

  test('teaching detail shows title and description', async ({ page }) => {
    await page.goto('http://localhost:3000/teachings/love-creates-destroys');
    await page.waitForLoadState('networkidle');

    // Check for title
    const title = page.locator('h1, [data-testid="teaching-title"]').first();
    await expect(title).toBeVisible();

    const titleText = await title.textContent();
    console.log(`Teaching title: ${titleText}`);

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/teaching-detail-content.png', fullPage: true });
  });
});

test.describe('Teachings with Audio and Video', () => {
  test('teaching with both audio and video shows both players', async ({ page }) => {
    // This teaching has both video and audio
    await page.goto('http://localhost:3000/teachings/love-creates-destroys');
    await page.waitForLoadState('networkidle');

    // Check for video player
    const videoPlayer = page.locator('iframe[src*="videodelivery"], .video-player').first();
    await expect(videoPlayer).toBeVisible({ timeout: 10000 });
    console.log('✓ Video player found');

    // Check for audio player
    const audioPlayer = page.locator('iframe[src*="podbean"], .audio-player').first();
    await expect(audioPlayer).toBeVisible({ timeout: 10000 });
    console.log('✓ Audio player found');

    // Take screenshot showing both players
    await page.screenshot({ path: 'playwright-report/teaching-video-audio.png', fullPage: true });
    console.log('✓ Both video and audio players are visible');
  });
});

test.describe('Preview Mechanism', () => {
  test('restricted teaching shows preview banner when not logged in', async ({ page }) => {
    // This teaching requires GYANI access
    await page.goto('http://localhost:3000/teachings/how-text-enlightenment');
    await page.waitForLoadState('networkidle');

    // Check for preview mode banner
    const previewBanner = page.locator('text=/Preview Mode/i').first();
    await expect(previewBanner).toBeVisible({ timeout: 10000 });
    console.log('✓ Preview mode banner is visible');

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/preview-mode.png', fullPage: true });
  });
});
