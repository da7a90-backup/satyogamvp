import { test, expect } from '@playwright/test';

test.describe('Online Retreat Payment Flow', () => {
  test('should complete retreat payment and show in My Retreats', async ({ page }) => {
    // Login
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login');

    await page.fill('input[name="email"]', 'free@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard/user');
    console.log('Logged in successfully');

    // Navigate to online retreats
    console.log('Navigating to online retreats...');
    await page.goto('http://localhost:3000/dashboard/user/online-retreats');
    await page.waitForLoadState('networkidle');

    // Find and click on the first retreat
    console.log('Finding first available retreat...');
    const retreatCard = page.locator('[data-testid="retreat-card"]').first();
    await retreatCard.waitFor({ state: 'visible', timeout: 10000 });

    const retreatSlug = await retreatCard.getAttribute('data-slug');
    console.log('Found retreat with slug:', retreatSlug);

    await retreatCard.click();
    await page.waitForURL(`**/dashboard/user/online-retreats/${retreatSlug}`);

    // Select lifetime access and click purchase
    console.log('Selecting lifetime access...');
    await page.click('button:has-text("Lifetime Access")');
    await page.click('button:has-text("Purchase Now")');

    // Wait for payment page
    await page.waitForURL(`**/dashboard/user/online-retreats/${retreatSlug}/payment?accessType=lifetime`);
    console.log('On payment page');

    // Fill billing information
    console.log('Filling billing information...');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'free@test.com');
    await page.fill('input[name="address"]', '123 Test St');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="state"]', 'CA');
    await page.fill('input[name="postalCode"]', '12345');
    await page.fill('input[name="country"]', 'US');
    await page.fill('input[name="telephone"]', '+1234567890');

    // Click proceed to payment
    await page.click('button:has-text("Proceed to Payment")');

    // Wait for Tilopay SDK to load
    console.log('Waiting for Tilopay SDK...');
    await page.waitForSelector('#tlpy_cc_number', { timeout: 15000 });

    // Fill in Tilopay test card
    console.log('Filling payment card information...');
    await page.fill('#tlpy_cc_number', '4111111111119999');
    await page.fill('#tlpy_cc_expiration_date', '12/26');
    await page.fill('#tlpy_cvv', '123');

    // Submit payment
    console.log('Submitting payment...');
    await page.click('button:has-text("Pay")');

    // Wait for payment processing and redirect
    console.log('Waiting for payment processing...');
    await page.waitForURL('**/dashboard/user/retreats', { timeout: 30000 });
    console.log('Redirected to My Retreats');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if retreat appears in "My Online Retreats"
    console.log('Checking if retreat appears in My Retreats...');
    const myRetreatsSection = page.locator('text=My Online Retreats').first();
    await myRetreatsSection.waitFor({ state: 'visible', timeout: 5000 });

    // Look for the retreat card in registered retreats
    const registeredRetreat = page.locator(`[data-testid="retreat-card"][data-slug="${retreatSlug}"]`).first();
    await expect(registeredRetreat).toBeVisible({ timeout: 10000 });

    console.log('✓ Retreat successfully appears in My Online Retreats!');

    // Verify access type is shown
    const accessBadge = registeredRetreat.locator('text=Lifetime Access');
    await expect(accessBadge).toBeVisible();

    console.log('✓ Access type badge is visible!');

    // Click on the retreat to access portal
    await registeredRetreat.click();
    await page.waitForURL(`**/dashboard/user/retreats/${retreatSlug}`);

    console.log('✓ Successfully navigated to retreat portal!');
  });

  test('should complete retreat payment with limited access', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'free@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard/user');

    // Navigate to online retreats
    await page.goto('http://localhost:3000/dashboard/user/online-retreats');
    await page.waitForLoadState('networkidle');

    // Find retreat
    const retreatCard = page.locator('[data-testid="retreat-card"]').first();
    await retreatCard.waitFor({ state: 'visible' });
    const retreatSlug = await retreatCard.getAttribute('data-slug');
    await retreatCard.click();

    // Select 12-day limited access
    console.log('Selecting 12-day limited access...');
    await page.click('button:has-text("12-Day Access")');
    await page.click('button:has-text("Purchase Now")');

    await page.waitForURL(`**/dashboard/user/online-retreats/${retreatSlug}/payment?accessType=limited`);

    // Fill billing
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'free@test.com');

    // Proceed to payment
    await page.click('button:has-text("Proceed to Payment")');

    // Wait for Tilopay and fill card
    await page.waitForSelector('#tlpy_cc_number', { timeout: 15000 });
    await page.fill('#tlpy_cc_number', '4111111111119999');
    await page.fill('#tlpy_cc_expiration_date', '12/26');
    await page.fill('#tlpy_cvv', '123');

    // Submit
    await page.click('button:has-text("Pay")');
    await page.waitForURL('**/dashboard/user/retreats', { timeout: 30000 });

    // Verify retreat with limited access badge
    await page.waitForLoadState('networkidle');
    const registeredRetreat = page.locator(`[data-testid="retreat-card"][data-slug="${retreatSlug}"]`).first();
    await expect(registeredRetreat).toBeVisible({ timeout: 10000 });

    const limitedAccessBadge = registeredRetreat.locator('text=12-Day Access');
    await expect(limitedAccessBadge).toBeVisible();

    console.log('✓ Limited access retreat payment completed successfully!');
  });
});
