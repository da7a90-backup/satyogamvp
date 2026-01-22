import { test, expect } from '@playwright/test';

test('Check portal videos after login', async ({ page }) => {
  // Listen to console logs from the browser
  const logs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (text.includes('[PortalViewer]') || text.includes('Portal') || text.includes('portal')) {
      console.log('🔍 BROWSER LOG:', text);
    }
  });

  // Listen to API responses
  page.on('response', response => {
    const url = response.url();
    if (url.includes('portal-access') || url.includes('a-gathering-of-visionaries')) {
      console.log(`📡 API ${response.status()}: ${url}`);
      if (!response.ok()) {
        console.log(`❌ API ERROR: ${response.status()} ${response.statusText()}`);
      }
    }
  });

  console.log('\n⏳ Waiting 5 seconds for you to login...');
  console.log('👉 Please login at http://localhost:3000/login');
  console.log('👉 Then navigate to the retreat portal');
  console.log('👉 Email: sidbarrack@gmail.com');
  console.log('👉 Password: Sid@1234\n');

  await page.waitForTimeout(5000);

  console.log('\n🔍 Navigating to portal page...');
  await page.goto('http://localhost:3000/dashboard/user/purchases/a-gathering-of-visionaries', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  console.log('⏳ Waiting for page to load...');
  await page.waitForTimeout(5000);

  console.log('\n📸 Taking screenshot...');
  await page.screenshot({ path: 'test-results/portal-check.png', fullPage: true });

  console.log('\n🔍 Checking page elements...');

  // Check for Videos button
  const videosButton = page.locator('button:has-text("Videos")');
  const videosBtnCount = await videosButton.count();
  console.log(`Videos button found: ${videosBtnCount > 0 ? '✅' : '❌'} (count: ${videosBtnCount})`);

  if (videosBtnCount > 0) {
    const btnText = await videosButton.textContent();
    console.log(`  Text: "${btnText}"`);

    console.log('  Clicking Videos button...');
    await videosButton.click();
    await page.waitForTimeout(2000);
  }

  // Check for Audio button
  const audioButton = page.locator('button:has-text("Audio")');
  const audioBtnCount = await audioButton.count();
  console.log(`Audio button found: ${audioBtnCount > 0 ? '✅' : '❌'} (count: ${audioBtnCount})`);

  if (audioBtnCount > 0) {
    const btnText = await audioButton.textContent();
    console.log(`  Text: "${btnText}"`);
  }

  // Check for iframes (videos)
  const iframes = page.locator('iframe');
  const iframeCount = await iframes.count();
  console.log(`\n📹 iframes found: ${iframeCount > 0 ? '✅' : '❌'} (count: ${iframeCount})`);

  if (iframeCount > 0) {
    for (let i = 0; i < Math.min(iframeCount, 3); i++) {
      const src = await iframes.nth(i).getAttribute('src');
      console.log(`  iframe ${i + 1} src: ${src}`);
    }
  }

  // Check for session buttons
  const sessionBtns = page.locator('button:has-text("Session")');
  const sessionCount = await sessionBtns.count();
  console.log(`\n📝 Session buttons: ${sessionCount > 0 ? '✅' : '❌'} (count: ${sessionCount})`);

  // Check for error messages
  const noMedia = await page.locator('text=/no media available/i').count();
  const accessDenied = await page.locator('text=/access denied/i').count();
  const loading = await page.locator('text=/loading/i').count();

  console.log(`\n⚠️  Error indicators:`);
  console.log(`  "No media available": ${noMedia > 0 ? '❌ FOUND' : '✅ Not found'}`);
  console.log(`  "Access denied": ${accessDenied > 0 ? '❌ FOUND' : '✅ Not found'}`);
  console.log(`  "Loading...": ${loading > 0 ? '⏳ Still loading' : '✅ Loaded'}`);

  // Print all console logs that mention portal
  console.log('\n📋 Relevant browser console logs:');
  const portalLogs = logs.filter(log =>
    log.toLowerCase().includes('portal') ||
    log.toLowerCase().includes('video') ||
    log.toLowerCase().includes('media')
  );
  portalLogs.forEach(log => console.log(`  ${log}`));

  console.log('\n✅ Test complete. Check screenshot at: test-results/portal-check.png');

  // Keep browser open for 10 seconds
  await page.waitForTimeout(10000);
});
