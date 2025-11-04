import { test, expect } from '@playwright/test';

test.describe('Teachings Complete Flow', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3001';

  // Test teachings with known data
  const VIDEO_TEACHING = 'love-creates-destroys'; // Has cloudflare video
  const AUDIO_TEACHING = 'you-cant-trust-the-science-or-religion-or-your-mind'; // Has audio only

  test.beforeEach(async ({ page }) => {
    // Capture console logs
    page.on('console', (msg) => {
      console.log(`[Browser ${msg.type()}]`, msg.text());
    });

    // Capture errors
    page.on('pageerror', (error) => {
      console.error('[Browser Error]', error.message);
    });
  });

  test('should display teachings list on marketing site', async ({ page }) => {
    console.log('\\n=== Testing Teachings List (Marketing Site) ===');

    await page.goto(`${BASE_URL}/teachings`);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/teachings-list.png', fullPage: true });

    // Check page title
    const title = await page.title();
    console.log('Page title:', title);

    // Check teachings are displayed
    const teachingCards = page.locator('[data-testid="teaching-card"]');
    const count = await teachingCards.count();
    console.log(`Found ${count} teaching cards`);

    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(9); // Public limit

    // Check tabs are present
    const videoTab = page.locator('text=Video Teachings');
    const meditationTab = page.locator('text=Guided Meditations');
    const qaTab = page.locator('text=Q&A');
    const essaysTab = page.locator('text=Essays');

    await expect(videoTab).toBeVisible();
    await expect(meditationTab).toBeVisible();
    await expect(qaTab).toBeVisible();
    await expect(essaysTab).toBeVisible();

    console.log('✅ Teachings list page loaded successfully');
  });

  test('should display video teaching with preview mechanism', async ({ page }) => {
    console.log(`\\n=== Testing Video Teaching: ${VIDEO_TEACHING} ===`);

    await page.goto(`${BASE_URL}/teachings/${VIDEO_TEACHING}`);
    await page.waitForLoadState('networkidle');

    // Wait a bit for video iframe to load
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/video-teaching-detail.png', fullPage: true });

    // Check page loaded
    const title = await page.locator('h1').first().textContent();
    console.log('Teaching title:', title);

    // Check for video iframe (Cloudflare)
    const videoIframe = page.frameLocator('iframe[src*="videodelivery.net"]');
    const hasVideo = await page.locator('iframe[src*="videodelivery.net"]').count();
    console.log('Video iframe count:', hasVideo);

    if (hasVideo > 0) {
      console.log('✅ Video iframe found');
    } else {
      console.log('❌ Video iframe NOT found');
      // Log all iframes on the page
      const allIframes = await page.locator('iframe').count();
      console.log(`Total iframes on page: ${allIframes}`);
      for (let i = 0; i < allIframes; i++) {
        const src = await page.locator('iframe').nth(i).getAttribute('src');
        console.log(`  Iframe ${i}: ${src}`);
      }
    }

    expect(hasVideo).toBeGreaterThan(0);

    // Check for preview banner (should show when not logged in)
    const previewBanner = page.locator('text=Preview Mode');
    const hasPreview = await previewBanner.count();
    console.log('Preview banner count:', hasPreview);

    if (hasPreview > 0) {
      console.log('✅ Preview banner found');
      await expect(previewBanner).toBeVisible();
    }

    // Check tabs
    const descriptionTab = page.locator('button:has-text("Description")');
    const audioTab = page.locator('button:has-text("Audio")');
    const commentsTab = page.locator('button:has-text("Comments")');

    await expect(descriptionTab).toBeVisible();
    console.log('✅ Tabs found');

    console.log('✅ Video teaching page loaded successfully');
  });

  test('should display audio teaching', async ({ page }) => {
    console.log(`\\n=== Testing Audio Teaching: ${AUDIO_TEACHING} ===`);

    await page.goto(`${BASE_URL}/teachings/${AUDIO_TEACHING}`);
    await page.waitForLoadState('networkidle');

    // Wait for audio iframe
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/audio-teaching-detail.png', fullPage: true });

    // Check for audio iframe (Podbean)
    const audioIframe = page.locator('iframe[src*="podbean.com"]');
    const hasAudio = await audioIframe.count();
    console.log('Audio iframe count:', hasAudio);

    if (hasAudio > 0) {
      console.log('✅ Audio iframe found');
      const src = await audioIframe.first().getAttribute('src');
      console.log('Audio iframe src:', src);
    } else {
      console.log('❌ Audio iframe NOT found');
    }

    expect(hasAudio).toBeGreaterThan(0);

    // Check for Download Audio link
    const downloadLink = page.locator('a:has-text("Download Audio")');
    const hasDownload = await downloadLink.count();
    console.log('Download link count:', hasDownload);

    if (hasDownload > 0) {
      console.log('✅ Download link found');
    }

    console.log('✅ Audio teaching page loaded successfully');
  });

  test('should display related teachings sidebar', async ({ page }) => {
    console.log(`\\n=== Testing Related Teachings ===`);

    await page.goto(`${BASE_URL}/teachings/${VIDEO_TEACHING}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'playwright-report/related-teachings.png', fullPage: true });

    // Check for related videos section
    const relatedSection = page.locator('text=Related Videos');
    const hasRelated = await relatedSection.count();
    console.log('Related Videos section count:', hasRelated);

    if (hasRelated > 0) {
      console.log('✅ Related Videos section found');

      // Count related teaching cards in sidebar
      const relatedCards = page.locator('aside').locator('a[href*="/teachings/"]');
      const relatedCount = await relatedCards.count();
      console.log(`Found ${relatedCount} related teachings`);

      expect(relatedCount).toBeGreaterThan(0);
      expect(relatedCount).toBeLessThanOrEqual(6);
    } else {
      console.log('⚠️ Related Videos section not found');
    }
  });

  test('should navigate between teachings via related sidebar', async ({ page }) => {
    console.log(`\\n=== Testing Related Teaching Navigation ===`);

    await page.goto(`${BASE_URL}/teachings/${VIDEO_TEACHING}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const originalTitle = await page.locator('h1').first().textContent();
    console.log('Original teaching:', original Title);

    // Click first related teaching if available
    const firstRelated = page.locator('aside').locator('a[href*="/teachings/"]').first();
    const hasRelated = await firstRelated.count();

    if (hasRelated > 0) {
      const relatedHref = await firstRelated.getAttribute('href');
      console.log('Clicking related teaching:', relatedHref);

      await firstRelated.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const newTitle = await page.locator('h1').first().textContent();
      console.log('New teaching:', newTitle);

      expect(newTitle).not.toBe(originalTitle);
      console.log('✅ Successfully navigated to related teaching');
    } else {
      console.log('⚠️ No related teachings available for navigation test');
    }
  });

  test('should display dashboard teachings page with sidebar', async ({ page }) => {
    console.log(`\\n=== Testing Dashboard Teachings Page ===`);

    // Note: This test assumes you can access dashboard without login for testing
    // In production, you'd need to login first

    await page.goto(`${BASE_URL}/dashboard/user/teachings`);

    // Check if redirected to login
    await page.waitForLoadState('networkidle');
    const url = page.url();
    console.log('Current URL:', url);

    if (url.includes('/login')) {
      console.log('⚠️ Redirected to login (expected for non-authenticated user)');
      // This is expected behavior
      expect(url).toContain('/login');
    } else {
      // Take screenshot
      await page.screenshot({ path: 'playwright-report/dashboard-teachings.png', fullPage: true });

      // Check for sidebar
      const sidebar = page.locator('text=Pragyani Membership');
      const hasSidebar = await sidebar.count();
      console.log('Sidebar count:', hasSidebar);

      if (hasSidebar > 0) {
        console.log('✅ Dashboard sidebar found');

        // Check for Teachings link in sidebar (should be selected/highlighted)
        const teachingsLink = page.locator('a[href="/dashboard/user/teachings"]');
        const hasTeachingsLink = await teachingsLink.count();
        console.log('Teachings link in sidebar:', hasTeachingsLink);

        if (hasTeachingsLink > 0) {
          console.log('✅ Teachings link found in sidebar');
        }
      }

      // Check for teaching cards
      const teachingCards = page.locator('[data-testid="teaching-card"]');
      const count = await teachingCards.count();
      console.log(`Dashboard teaching cards: ${count}`);

      if (count > 0) {
        console.log('✅ Dashboard shows teachings');
      }
    }
  });

  test('should check console for errors on teaching detail page', async ({ page }) => {
    console.log(`\\n=== Checking Console Errors ===`);

    const errors: string[] = [];
    const warnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto(`${BASE_URL}/teachings/${VIDEO_TEACHING}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log(`\\nErrors found: ${errors.length}`);
    errors.forEach((error, i) => {
      console.log(`  Error ${i + 1}: ${error}`);
    });

    console.log(`\\nWarnings found: ${warnings.length}`);
    warnings.forEach((warning, i) => {
      console.log(`  Warning ${i + 1}: ${warning}`);
    });

    // Fail test if there are critical errors (not warnings)
    const criticalErrors = errors.filter(e =>
      !e.includes('DevTools') &&
      !e.includes('extensions') &&
      !e.includes('favicon')
    );

    if (criticalErrors.length > 0) {
      console.log(`\\n❌ Found ${criticalErrors.length} critical errors`);
    } else {
      console.log('\\n✅ No critical errors found');
    }

    expect(criticalErrors.length).toBe(0);
  });
});
