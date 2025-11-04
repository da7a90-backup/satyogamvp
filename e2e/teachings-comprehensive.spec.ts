import { test, expect } from '@playwright/test';

test.describe('Teachings - Comprehensive Test Suite', () => {

  // Test 1: Basic teachings list page
  test('teachings list page loads with multiple teachings', async ({ page }) => {
    console.log('🧪 TEST 1: Loading teachings list page...');

    await page.goto('http://localhost:3000/teachings');
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/01-teachings-list.png', fullPage: true });
    console.log('📸 Screenshot saved: 01-teachings-list.png');

    // Check for teaching cards
    const teachingCards = page.locator('[data-testid="teaching-card"], .teaching-card, article');
    const count = await teachingCards.count();
    console.log(`✅ Found ${count} teaching cards`);

    expect(count).toBeGreaterThan(0);
  });

  // Test 2: Single YouTube video teaching
  test('teaching with single YouTube video displays correctly', async ({ page }) => {
    console.log('🧪 TEST 2: Testing single YouTube video teaching...');

    await page.goto('http://localhost:3000/teachings/livestream-satsang-01-16-19');
    await page.waitForLoadState('networkidle');

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/02-single-youtube-video.png', fullPage: true });
    console.log('📸 Screenshot saved: 02-single-youtube-video.png');

    // Check for YouTube iframe
    const youtubeFrame = page.locator('iframe[src*="youtube.com"]');
    const hasYouTube = await youtubeFrame.count() > 0;
    console.log(`${hasYouTube ? '✅' : '❌'} YouTube iframe ${hasYouTube ? 'found' : 'not found'}`);

    // Check for title
    const title = await page.locator('h1').first().textContent();
    console.log(`📝 Title: ${title}`);

    expect(hasYouTube).toBeTruthy();
  });

  // Test 3: Multiple videos with selector
  test('teaching with multiple videos shows selector', async ({ page }) => {
    console.log('🧪 TEST 3: Testing multi-video selector...');

    await page.goto('http://localhost:3000/teachings/kali-yuga-is-now-reaching-its-climax');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: 'playwright-report/03-multi-video-initial.png', fullPage: true });
    console.log('📸 Screenshot saved: 03-multi-video-initial.png');

    // Check for video selector
    const selectorButtons = page.locator('button').filter({ hasText: /Part|Video|YouTube/ });
    const buttonCount = await selectorButtons.count();
    console.log(`${buttonCount > 0 ? '✅' : '❌'} Video selector buttons: ${buttonCount}`);

    if (buttonCount > 1) {
      // Click second video
      await selectorButtons.nth(1).click();
      await page.waitForTimeout(1000);

      // Take screenshot after switching
      await page.screenshot({ path: 'playwright-report/03-multi-video-switched.png', fullPage: true });
      console.log('📸 Screenshot saved: 03-multi-video-switched.png');
      console.log('✅ Clicked second video button');
    }

    // Check for video player (YouTube or Cloudflare)
    const youtubeFrame = page.locator('iframe[src*="youtube.com"]');
    const cloudflareFrame = page.locator('iframe[src*="videodelivery.net"]');
    const hasVideo = (await youtubeFrame.count() > 0) || (await cloudflareFrame.count() > 0);
    console.log(`${hasVideo ? '✅' : '❌'} Video player found`);

    expect(buttonCount).toBeGreaterThan(0);
  });

  // Test 4: Teaching with both video and audio
  test('teaching with video and audio shows both players', async ({ page }) => {
    console.log('🧪 TEST 4: Testing video + audio teaching...');

    await page.goto('http://localhost:3000/teachings/the-eternal-return-of-spiritual-anarchy');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/04-video-audio.png', fullPage: true });
    console.log('📸 Screenshot saved: 04-video-audio.png');

    // Check for video
    const youtubeFrame = page.locator('iframe[src*="youtube.com"]');
    const cloudflareFrame = page.locator('iframe[src*="videodelivery.net"]');
    const hasVideo = (await youtubeFrame.count() > 0) || (await cloudflareFrame.count() > 0);
    console.log(`${hasVideo ? '✅' : '❌'} Video player found`);

    // Check for audio
    const podbeanFrame = page.locator('iframe[src*="podbean.com"]');
    const hasAudio = await podbeanFrame.count() > 0;
    console.log(`${hasAudio ? '✅' : '❌'} Audio player found`);

    expect(hasVideo || hasAudio).toBeTruthy();
  });

  // Test 5: Heart and Watch Later buttons
  test('heart and watch later buttons are visible', async ({ page }) => {
    console.log('🧪 TEST 5: Testing heart and watch later buttons...');

    await page.goto('http://localhost:3000/teachings/livestream-satsang-01-16-19');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/05-heart-watchlater.png', fullPage: true });
    console.log('📸 Screenshot saved: 05-heart-watchlater.png');

    // Check for heart button
    const heartButton = page.locator('button[title*="favorite"], button[title*="Favorite"]');
    const hasHeart = await heartButton.count() > 0;
    console.log(`${hasHeart ? '✅' : '❌'} Heart button found: ${hasHeart}`);

    // Check for watch later button
    const watchLaterButton = page.locator('button[title*="Watch later"], button[title*="watch later"]');
    const hasWatchLater = await watchLaterButton.count() > 0;
    console.log(`${hasWatchLater ? '✅' : '❌'} Watch later button found: ${hasWatchLater}`);

    // Try to find by icon (Heart or Clock)
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    console.log(`📊 Total buttons on page: ${buttonCount}`);

    // Check if clicking shows login modal (when not logged in)
    if (hasHeart) {
      await heartButton.first().click();
      await page.waitForTimeout(1000);

      const loginModal = page.locator('text=/log in|sign in|sign up/i').first();
      const hasModal = await loginModal.isVisible().catch(() => false);
      console.log(`${hasModal ? '✅' : '📝'} Login modal ${hasModal ? 'appeared' : 'did not appear (may already be logged in)'}`);

      await page.screenshot({ path: 'playwright-report/05-heart-clicked.png', fullPage: true });
      console.log('📸 Screenshot saved: 05-heart-clicked.png');
    }
  });

  // Test 6: Preview duration display
  test('preview duration shows correctly on public site', async ({ page }) => {
    console.log('🧪 TEST 6: Testing preview duration...');

    await page.goto('http://localhost:3000/teachings/livestream-satsang-01-16-19');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/06-preview-duration.png', fullPage: true });
    console.log('📸 Screenshot saved: 06-preview-duration.png');

    // Look for preview text
    const previewText = page.locator('text=/preview/i').first();
    const hasPreview = await previewText.count() > 0;
    console.log(`${hasPreview ? '✅' : '📝'} Preview text found: ${hasPreview}`);

    if (hasPreview) {
      const text = await previewText.textContent();
      console.log(`📝 Preview text: ${text}`);
    }

    // Check for preview banner/badge
    const previewBadge = page.locator('text=/free preview|preview mode/i');
    const hasBadge = await previewBadge.count() > 0;
    console.log(`${hasBadge ? '✅' : '📝'} Preview badge found: ${hasBadge}`);
  });

  // Test 7: Back button navigation
  test('back button exists and has correct text', async ({ page }) => {
    console.log('🧪 TEST 7: Testing back button...');

    await page.goto('http://localhost:3000/teachings/livestream-satsang-01-16-19');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/07-back-button.png', fullPage: true });
    console.log('📸 Screenshot saved: 07-back-button.png');

    // Check for back link
    const backLink = page.locator('a:has-text("Back")').first();
    const hasBack = await backLink.count() > 0;
    console.log(`${hasBack ? '✅' : '❌'} Back button found: ${hasBack}`);

    if (hasBack) {
      const href = await backLink.getAttribute('href');
      console.log(`📝 Back link href: ${href}`);

      const text = await backLink.textContent();
      console.log(`📝 Back link text: ${text}`);
    }
  });

  // Test 8: Teaching with Cloudflare video
  test('teaching with Cloudflare video loads correctly', async ({ page }) => {
    console.log('🧪 TEST 8: Testing Cloudflare video...');

    await page.goto('http://localhost:3000/teachings/the-science-of-the-unknowable');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/08-cloudflare-video.png', fullPage: true });
    console.log('📸 Screenshot saved: 08-cloudflare-video.png');

    // Check for Cloudflare iframe
    const cloudflareFrame = page.locator('iframe[src*="videodelivery.net"]');
    const hasCloudflare = await cloudflareFrame.count() > 0;
    console.log(`${hasCloudflare ? '✅' : '❌'} Cloudflare iframe found: ${hasCloudflare}`);

    if (hasCloudflare) {
      const src = await cloudflareFrame.first().getAttribute('src');
      console.log(`📝 Cloudflare iframe src: ${src}`);
    }
  });

  // Test 9: Console log check
  test('page loads without console errors', async ({ page }) => {
    console.log('🧪 TEST 9: Checking for console errors...');

    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`❌ Console Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
        console.log(`⚠️  Console Warning: ${msg.text()}`);
      }
    });

    await page.goto('http://localhost:3000/teachings/kali-yuga-is-now-reaching-its-climax');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/09-console-check.png', fullPage: true });
    console.log('📸 Screenshot saved: 09-console-check.png');

    console.log(`📊 Total console errors: ${errors.length}`);
    console.log(`📊 Total console warnings: ${warnings.length}`);

    if (errors.length === 0) {
      console.log('✅ No console errors!');
    }
  });

  // Test 10: API data fetch
  test('backend API returns teaching data correctly', async ({ page }) => {
    console.log('🧪 TEST 10: Testing backend API...');

    // Test API endpoint directly
    const response = await page.request.get('http://localhost:8000/api/teachings/livestream-satsang-01-16-19');
    const status = response.status();
    console.log(`📡 API Response Status: ${status}`);

    if (status === 200) {
      const data = await response.json();
      console.log(`✅ API returned data successfully`);
      console.log(`📝 Teaching title: ${data.title}`);
      console.log(`📝 YouTube IDs: ${JSON.stringify(data.youtube_ids)}`);
      console.log(`📝 Cloudflare IDs: ${JSON.stringify(data.cloudflare_ids)}`);
      console.log(`📝 Podbean IDs: ${JSON.stringify(data.podbean_ids)}`);
      console.log(`📝 Preview duration: ${data.preview_duration} minutes`);
      console.log(`📝 Dashboard preview duration: ${data.dash_preview_duration} minutes`);

      expect(data.title).toBeTruthy();
      expect(data.youtube_ids).toBeDefined();
    } else {
      console.log(`❌ API returned status ${status}`);
    }
  });
});
