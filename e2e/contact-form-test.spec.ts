import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('should submit contact form successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
    await page.waitForLoadState('networkidle');

    // Fill out the form
    await page.fill('input[placeholder="First name"]', 'Test');
    await page.fill('input[placeholder="Last name"]', 'User');
    await page.fill('input[placeholder="you@company.com"]', 'test@example.com');
    await page.selectOption('select', 'General Inquiry');
    await page.fill('textarea[placeholder*="Leave us a message"]', 'This is a test message from playwright');
    await page.check('input[type="checkbox"]');

    // Submit the form
    await page.click('button:has-text("Submit")');

    // Wait for success message
    await expect(page.locator('text=Thank you! Your message has been sent successfully.')).toBeVisible({ timeout: 10000 });

    console.log('✅ Contact form submitted successfully!');
  });

  test('should pre-select topic based on queryType parameter', async ({ page }) => {
    // Test with retreat queryType
    await page.goto('http://localhost:3000/contact?queryType=retreat');
    await page.waitForLoadState('networkidle');

    // Check if "Retreat Information" is selected
    const selectValue = await page.locator('select').inputValue();
    expect(selectValue).toBe('Retreat Information');

    console.log('✅ Topic pre-selected correctly for retreat queryType');
  });

  test('should pre-select topic for online_retreat queryType', async ({ page }) => {
    await page.goto('http://localhost:3000/contact?queryType=online_retreat');
    await page.waitForLoadState('networkidle');

    // Check if "Retreat Information" is selected
    const selectValue = await page.locator('select').inputValue();
    expect(selectValue).toBe('Retreat Information');

    console.log('✅ Topic pre-selected correctly for online_retreat queryType');
  });

  test('should pre-select topic for general queryType', async ({ page }) => {
    await page.goto('http://localhost:3000/contact?queryType=general');
    await page.waitForLoadState('networkidle');

    // Check if "General Inquiry" is selected
    const selectValue = await page.locator('select').inputValue();
    expect(selectValue).toBe('General Inquiry');

    console.log('✅ Topic pre-selected correctly for general queryType');
  });
});
