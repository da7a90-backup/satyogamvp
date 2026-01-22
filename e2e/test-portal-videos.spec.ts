import { test, expect } from '@playwright/test';

test('Portal videos loading test', async ({ page }) => {
  // Listen to console logs
  page.on('console', msg => {
    if (msg.text().includes('[PortalViewer]')) {
      console.log('🔍 BROWSER LOG:', msg.text());
    }
  });

  // Listen to network errors
  page.on('response', response => {
    if (!response.ok() && response.url().includes('portal-access')) {
      console.log('❌ API ERROR:', response.status(), response.url());
    }
  });

  console.log('1️⃣ Navigating to login page...');
  await page.goto('http://localhost:3000/login');

  console.log('2️⃣ Logging in...');
  await page.fill('input[name="email"]', 'sidbarrack@gmail.com');
  await page.fill('input[name="password"]', 'Sid@1234');
  await page.click('button[type="submit"]');

  // Wait for redirect
  await page.waitForURL('**/dashboard/**', { timeout: 10000 });
  console.log('✅ Login successful');

  console.log('3️⃣ Navigating to portal page...');
  await page.goto('http://localhost:3000/dashboard/user/purchases/a-gathering-of-visionaries');

  // Wait for content to load
  await page.waitForTimeout(3000);

  console.log('4️⃣ Checking page content...');

  // Take screenshot of full page
  await page.screenshot({ path: 'test-results/portal-full-page.png', fullPage: true });
  console.log('📸 Screenshot saved: portal-full-page.png');

  // Check if Videos button exists
  const videosButton = page.locator('button:has-text("Videos")');
  const videosButtonExists = await videosButton.count() > 0;
  console.log(`Videos button exists: ${videosButtonExists}`);

  if (videosButtonExists) {
    const videosText = await videosButton.textContent();
    console.log(`Videos button text: "${videosText}"`);

    // Click videos button
    await videosButton.click();
    await page.waitForTimeout(1000);
  }

  // Check if Audio button exists
  const audioButton = page.locator('button:has-text("Audio")');
  const audioButtonExists = await audioButton.count() > 0;
  console.log(`Audio button exists: ${audioButtonExists}`);

  if (audioButtonExists) {
    const audioText = await audioButton.textContent();
    console.log(`Audio button text: "${audioText}"`);
  }

  // Check for video iframes
  const iframes = await page.locator('iframe').count();
  console.log(`📹 Number of iframes found: ${iframes}`);

  if (iframes > 0) {
    const iframeSrc = await page.locator('iframe').first().getAttribute('src');
    console.log(`First iframe src: ${iframeSrc}`);
  }

  // Check for "no media" message
  const noMediaMessage = page.locator('text=/no media available/i');
  const noMediaExists = await noMediaMessage.count() > 0;
  console.log(`"No media" message exists: ${noMediaExists}`);

  // Check for session buttons
  const sessionButtons = await page.locator('button:has-text("Session")').count();
  console.log(`📝 Number of session buttons: ${sessionButtons}`);

  // Take screenshot of video area
  await page.screenshot({ path: 'test-results/portal-video-area.png' });
  console.log('📸 Screenshot saved: portal-video-area.png');

  // Get page HTML for inspection
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('\n📄 Page HTML length:', bodyHTML.length);

  // Check for specific error messages
  if (bodyHTML.includes('No media available')) {
    console.log('❌ ERROR: "No media available" message found on page');
  }

  if (bodyHTML.includes('Access denied')) {
    console.log('❌ ERROR: "Access denied" message found on page');
  }

  // Print summary
  console.log('\n=== SUMMARY ===');
  console.log(`Videos button: ${videosButtonExists ? '✅' : '❌'}`);
  console.log(`Audio button: ${audioButtonExists ? '✅' : '❌'}`);
  console.log(`Video iframes: ${iframes > 0 ? '✅' : '❌'} (${iframes} found)`);
  console.log(`Session buttons: ${sessionButtons > 0 ? '✅' : '❌'} (${sessionButtons} found)`);
  console.log(`No media message: ${noMediaExists ? '❌ PROBLEM' : '✅'}`);
});
