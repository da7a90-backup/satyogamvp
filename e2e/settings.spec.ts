import { test, expect } from '@playwright/test';

test.describe('Settings Pages', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Add authentication setup when auth is ready
    // For now, navigate directly to settings
    await page.goto('/dashboard/user/settings/profile');
  });

  test.describe('Settings Navigation', () => {
    test('should have settings layout with sidebar navigation', async ({ page }) => {
      await page.goto('/dashboard/user/settings/profile');

      // Check for settings header
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

      // Check for all navigation tabs
      await expect(page.getByRole('link', { name: /Profile/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Billing/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Notifications/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Payment Methods/i })).toBeVisible();
    });

    test('should navigate between settings tabs', async ({ page }) => {
      await page.goto('/dashboard/user/settings/profile');

      // Navigate to billing
      await page.click('text=Billing');
      await expect(page).toHaveURL('/dashboard/user/settings/billing');
      await expect(page.getByRole('heading', { name: 'Billing & Subscription' })).toBeVisible();

      // Navigate to notifications
      await page.click('text=Notifications');
      await expect(page).toHaveURL('/dashboard/user/settings/notifications');
      await expect(page.getByRole('heading', { name: 'Notification Settings' })).toBeVisible();

      // Navigate to payment methods
      await page.click('text=Payment Methods');
      await expect(page).toHaveURL('/dashboard/user/settings/payment-methods');
      await expect(page.getByRole('heading', { name: 'Payment Methods' })).toBeVisible();
    });

    test('should highlight active tab', async ({ page }) => {
      await page.goto('/dashboard/user/settings/profile');

      // Profile tab should be active (has blue color)
      const profileTab = page.getByRole('link', { name: /Profile/i });
      await expect(profileTab).toHaveClass(/text-blue-600/);
    });
  });

  test.describe('Profile Settings', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard/user/settings/profile');
    });

    test('should display profile settings form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Profile Settings' })).toBeVisible();

      // Check for all form fields
      await expect(page.getByLabel('Full Name')).toBeVisible();
      await expect(page.getByLabel('Email Address')).toBeVisible();
      await expect(page.getByLabel('Phone Number')).toBeVisible();
      await expect(page.getByLabel('Location')).toBeVisible();
      await expect(page.getByLabel('Timezone')).toBeVisible();
      await expect(page.getByLabel('Bio')).toBeVisible();
    });

    test('should display profile photo section', async ({ page }) => {
      await expect(page.getByText('Profile Photo')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Change Photo' })).toBeVisible();
    });

    test('should have save and cancel buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    test('should allow filling out profile form', async ({ page }) => {
      await page.fill('input[name="name"]', 'John Doe');
      await page.fill('input[name="email"]', 'john@example.com');
      await page.fill('input[name="phone"]', '+1 555 123 4567');
      await page.fill('input[name="location"]', 'San Francisco, USA');
      await page.selectOption('select[name="timezone"]', 'America/Los_Angeles');
      await page.fill('textarea[name="bio"]', 'Spiritual practitioner');

      // Check values are filled
      await expect(page.locator('input[name="name"]')).toHaveValue('John Doe');
      await expect(page.locator('input[name="email"]')).toHaveValue('john@example.com');
    });

    test('should show success message after saving', async ({ page }) => {
      await page.fill('input[name="name"]', 'John Doe');
      await page.click('button:has-text("Save Changes")');

      // Wait for success message
      await expect(page.getByText('Profile updated successfully!')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Billing Settings', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard/user/settings/billing');
    });

    test('should display current subscription plan', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Billing & Subscription' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Current Plan' })).toBeVisible();

      // Check for plan details
      await expect(page.getByText('Pragyani')).toBeVisible();
      await expect(page.getByText('Active')).toBeVisible();
      await expect(page.getByText(/\$47\/month/i)).toBeVisible();
    });

    test('should display plan features', async ({ page }) => {
      await expect(page.getByText('Plan Includes:')).toBeVisible();
      await expect(page.getByText('Unlimited access to all teachings')).toBeVisible();
      await expect(page.getByText('Priority retreat registration')).toBeVisible();
    });

    test('should show change plan and cancel subscription buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Change Plan' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cancel Subscription' })).toBeVisible();
    });

    test('should display payment method', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Payment Method' })).toBeVisible();
      await expect(page.getByText('VISA')).toBeVisible();
      await expect(page.getByText(/\*\*\*\* \*\*\*\* \*\*\*\* 4242/)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
    });

    test('should display billing history table', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Billing History' })).toBeVisible();

      // Check table headers
      await expect(page.getByText('Date')).toBeVisible();
      await expect(page.getByText('Description')).toBeVisible();
      await expect(page.getByText('Amount')).toBeVisible();
      await expect(page.getByText('Status')).toBeVisible();

      // Check for at least one billing record
      await expect(page.getByText('Pragyani Monthly Subscription')).toBeVisible();
      await expect(page.getByText('$47.00')).toBeVisible();
      await expect(page.getByText('Paid')).toBeVisible();
    });

    test('should have download invoice buttons', async ({ page }) => {
      const downloadButtons = page.getByRole('button', { name: 'Download' });
      await expect(downloadButtons.first()).toBeVisible();
    });
  });

  test.describe('Notifications Settings', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard/user/settings/notifications');
    });

    test('should display notification settings', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Notification Settings' })).toBeVisible();
    });

    test('should display email notification section', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Email Notifications' })).toBeVisible();

      // Check for email notification options
      await expect(page.getByText('New Teachings')).toBeVisible();
      await expect(page.getByText('Retreat Updates')).toBeVisible();
      await expect(page.getByText('Course Progress')).toBeVisible();
      await expect(page.getByText('Newsletter')).toBeVisible();
      await expect(page.getByText('Promotions')).toBeVisible();
    });

    test('should display push notification section', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Push Notifications' })).toBeVisible();

      // Check for push notification options
      await expect(page.getByText('Event Reminders')).toBeVisible();
      await expect(page.getByText('Course Reminders')).toBeVisible();
    });

    test('should display SMS notification section', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'SMS Notifications' })).toBeVisible();

      // Check for SMS notification options
      await expect(page.getByText('Retreat Confirmations')).toBeVisible();
      await expect(page.getByText('Important Reminders')).toBeVisible();
    });

    test('should have toggle switches', async ({ page }) => {
      // Count toggle switches - should have multiple
      const toggles = page.locator('button[role="button"]').filter({ hasText: '' });
      expect(await toggles.count()).toBeGreaterThan(5);
    });

    test('should have save preferences button', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Save Preferences' })).toBeVisible();
    });

    test('should show success message after saving', async ({ page }) => {
      await page.click('button:has-text("Save Preferences")');

      // Wait for success message
      await expect(page.getByText('Notification preferences saved successfully!')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Payment Methods', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard/user/settings/payment-methods');
    });

    test('should display payment methods list', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Payment Methods' })).toBeVisible();

      // Check for existing payment methods
      await expect(page.getByText('VISA')).toBeVisible();
      await expect(page.getByText(/ending in 4242/i)).toBeVisible();
      await expect(page.getByText('Default')).toBeVisible();
    });

    test('should display add new payment method button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Add New Payment Method/i })).toBeVisible();
    });

    test('should show payment method actions', async ({ page }) => {
      // Should have set as default and remove buttons
      await expect(page.getByRole('button', { name: /Set as Default/i }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /Remove/i }).first()).toBeVisible();
    });

    test('should display add card form when clicking add button', async ({ page }) => {
      await page.click('button:has-text("Add New Payment Method")');

      // Check form fields appear
      await expect(page.getByText('Add New Card')).toBeVisible();
      await expect(page.getByLabel('Card Number')).toBeVisible();
      await expect(page.getByLabel('Cardholder Name')).toBeVisible();
      await expect(page.getByLabel('Expiry Date')).toBeVisible();
      await expect(page.getByLabel('CVV')).toBeVisible();
      await expect(page.getByLabel('Billing Address')).toBeVisible();
    });

    test('should have cancel button in add card form', async ({ page }) => {
      await page.click('button:has-text("Add New Payment Method")');

      await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Add Card' })).toBeVisible();
    });

    test('should display security notice', async ({ page }) => {
      await expect(page.getByText('Secure Payment')).toBeVisible();
      await expect(page.getByText(/encrypted and securely processed/i)).toBeVisible();
      await expect(page.getByText(/Tilopay/i)).toBeVisible();
    });

    test('should allow filling add card form', async ({ page }) => {
      await page.click('button:has-text("Add New Payment Method")');

      await page.fill('input[placeholder="1234 5678 9012 3456"]', '4242424242424242');
      await page.fill('input[placeholder="JOHN DOE"]', 'JOHN DOE');
      await page.fill('input[placeholder="MM/YY"]', '12/27');
      await page.fill('input[placeholder="123"]', '123');

      // Check values are filled
      await expect(page.locator('input[placeholder="1234 5678 9012 3456"]')).toHaveValue('4242424242424242');
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard/user/settings/profile');

      // Settings should still be visible
      await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Profile Settings' })).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard/user/settings/billing');

      // Billing info should still be visible
      await expect(page.getByRole('heading', { name: 'Billing & Subscription' })).toBeVisible();
    });
  });
});
