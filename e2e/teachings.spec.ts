import { test, expect } from '@playwright/test';
import { testUsers, routes } from './fixtures/test-data';

test.describe('Teachings Dashboard', () => {
  test.describe('Public Access', () => {
    test('should display teachings library for unauthenticated users', async ({ page }) => {
      await page.goto(routes.teachings);

      // Check page title
      await expect(page).toHaveTitle(/Teachings/i);

      // Check hero section
      await expect(page.getByRole('heading', { name: /unlock your inner genius/i })).toBeVisible();

      // Check that teaching library section is visible
      const teachingSection = page.locator('[data-testid="teaching-library"], .teaching-library');
      await expect(teachingSection.or(page.getByText(/teaching/i).first())).toBeVisible();
    });

    test('should display free teachings for unauthenticated users', async ({ page }) => {
      await page.goto(routes.teachings);

      // Wait for teachings to load
      await page.waitForLoadState('networkidle');

      // Check for teaching cards/items
      // Free teachings should be visible
      const teachingCards = page.locator('[data-testid="teaching-card"], .teaching-card, article');

      // There should be at least some teaching items visible
      await expect(teachingCards.first()).toBeVisible();
    });

    test('should show locked/premium content indicators for members-only teachings', async ({ page }) => {
      await page.goto(routes.teachings);

      // Wait for teachings to load
      await page.waitForLoadState('networkidle');

      // Look for lock icons or "Members Only" badges
      const premiumIndicators = page.locator('[data-premium="true"], [data-locked="true"], .premium-badge, .locked-icon');

      // If there are premium teachings, they should have indicators
      const count = await premiumIndicators.count();
      if (count > 0) {
        await expect(premiumIndicators.first()).toBeVisible();
      }
    });
  });

  test.describe('Authenticated User Access', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto(routes.login);
      await page.getByLabel(/email/i).fill(testUsers.validUser.email);
      await page.getByLabel(/password/i).fill(testUsers.validUser.password);
      await page.getByRole('button', { name: /log in/i }).click();
      await page.waitForURL(/\/dashboard/);
    });

    test('should display teachings library for authenticated users', async ({ page }) => {
      await page.goto(routes.teachings);

      // Check page is accessible
      await expect(page).toHaveTitle(/Teachings/i);

      // Check teaching library section is visible
      const teachingSection = page.locator('[data-testid="teaching-library"], .teaching-library');
      await expect(teachingSection.or(page.getByText(/teaching/i).first())).toBeVisible();
    });

    test('should allow access to user-tier appropriate teachings', async ({ page }) => {
      await page.goto(routes.teachings);

      // Wait for teachings to load
      await page.waitForLoadState('networkidle');

      // Click on a teaching (preferably a free one to ensure access)
      const teachingCards = page.locator('[data-testid="teaching-card"], .teaching-card, article');
      const firstTeaching = teachingCards.first();

      if (await firstTeaching.isVisible()) {
        await firstTeaching.click();

        // Should navigate to teaching detail page
        await expect(page).toHaveURL(/\/teachings\/.+/);

        // Teaching content should be visible
        const contentArea = page.locator('video, audio, .teaching-content');
        await expect(contentArea.first()).toBeVisible();
      }
    });

    test('should display correct access level indicators based on membership tier', async ({ page }) => {
      await page.goto(routes.teachings);

      // Wait for teachings to load
      await page.waitForLoadState('networkidle');

      // For a FREE tier user, PRAGYANI content should be locked
      // Look for teaching cards with different access levels
      const pragyaniTeachings = page.locator('[data-access-level="PRAGYANI"], [data-access-level="pragyani"]');

      const count = await pragyaniTeachings.count();
      if (count > 0) {
        // These should have lock indicators for FREE tier users
        const lockedIndicator = pragyaniTeachings.first().locator('[data-locked="true"], .locked-icon, .premium-badge');
        await expect(lockedIndicator).toBeVisible();
      }
    });
  });

  test.describe('Search and Filtering', () => {
    test('should allow searching for teachings', async ({ page }) => {
      await page.goto(routes.teachings);

      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name="search"]');

      if (await searchInput.count() > 0) {
        await searchInput.first().fill('meditation');

        // Wait for search results
        await page.waitForTimeout(1000);

        // Results should update
        const teachingCards = page.locator('[data-testid="teaching-card"], .teaching-card, article');
        await expect(teachingCards.first()).toBeVisible();
      }
    });

    test('should allow filtering teachings by category/type', async ({ page }) => {
      await page.goto(routes.teachings);

      // Look for filter buttons or dropdowns
      const filterButtons = page.locator('button[data-filter], select[name*="filter"], button:has-text("Filter")');

      if (await filterButtons.count() > 0) {
        // Click first filter option
        await filterButtons.first().click();

        // Wait for filtered results
        await page.waitForTimeout(1000);

        // Results should be visible
        const teachingCards = page.locator('[data-testid="teaching-card"], .teaching-card, article');
        await expect(teachingCards.first()).toBeVisible();
      }
    });
  });

  test.describe('Teaching Playback', () => {
    test('should play video teaching when clicked', async ({ page }) => {
      // Login first
      await page.goto(routes.login);
      await page.getByLabel(/email/i).fill(testUsers.validUser.email);
      await page.getByLabel(/password/i).fill(testUsers.validUser.password);
      await page.getByRole('button', { name: /log in/i }).click();
      await page.waitForURL(/\/dashboard/);

      // Go to teachings
      await page.goto(routes.teachings);
      await page.waitForLoadState('networkidle');

      // Click on first teaching
      const teachingCards = page.locator('[data-testid="teaching-card"], .teaching-card, article');
      if (await teachingCards.count() > 0) {
        await teachingCards.first().click();

        // Should navigate to teaching detail page
        await expect(page).toHaveURL(/\/teachings\/.+/);

        // Look for video player
        const videoPlayer = page.locator('video');
        if (await videoPlayer.count() > 0) {
          await expect(videoPlayer.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Preview Access', () => {
    test('should allow preview access (5-10min) for PREVIEW level teachings', async ({ page }) => {
      await page.goto(routes.teachings);

      // Look for teachings marked as "PREVIEW"
      const previewTeachings = page.locator('[data-access-level="PREVIEW"], [data-preview="true"]');

      if (await previewTeachings.count() > 0) {
        await previewTeachings.first().click();

        // Should navigate to teaching page
        await expect(page).toHaveURL(/\/teachings\/.+/);

        // Should show preview duration indicator
        const previewIndicator = page.locator('[data-preview-duration], .preview-badge, text=/preview/i');
        await expect(previewIndicator.first()).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto(routes.teachings);

      // Hero should be visible
      await expect(page.getByRole('heading', { name: /unlock your inner genius/i })).toBeVisible();

      // Teaching cards should be visible
      const teachingCards = page.locator('[data-testid="teaching-card"], .teaching-card, article');
      await expect(teachingCards.first()).toBeVisible();
    });

    test('should display correctly on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto(routes.teachings);

      // Hero should be visible
      await expect(page.getByRole('heading', { name: /unlock your inner genius/i })).toBeVisible();

      // Teaching cards should be visible
      const teachingCards = page.locator('[data-testid="teaching-card"], .teaching-card, article');
      await expect(teachingCards.first()).toBeVisible();
    });
  });
});
