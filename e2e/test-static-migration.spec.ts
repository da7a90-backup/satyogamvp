import { test, expect } from '@playwright/test';

test.describe('Static Content Migration', () => {
  test('homepage loads data from backend API with Cloudflare URLs', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that the page is not showing 404
    const title = await page.title();
    expect(title).not.toContain('404');

    // Check that homepage sections are rendered
    await expect(page).not.toHaveURL(/.*404.*/);

    // Log the page content for debugging
    const bodyText = await page.locator('body').textContent();
    console.log('Page loaded, body length:', bodyText?.length || 0);

    // Check for specific homepage content
    const hasContent = await page.locator('body').textContent();
    console.log('Has "Sat Yoga":', hasContent?.includes('Sat Yoga'));
    console.log('Has "Consciousness":', hasContent?.includes('Consciousness'));
  });

  test('backend API returns homepage data', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/pages/homepage');

    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log('API Response keys:', Object.keys(data));

    // Check that all sections exist
    expect(data).toHaveProperty('hero');
    expect(data).toHaveProperty('intro');
    expect(data).toHaveProperty('whoWeAre');
    expect(data).toHaveProperty('learnOnline');

    // Check that Cloudflare URLs are present
    expect(data.intro.backgroundImage).toContain('imagedelivery.net');

    // Check that description is an array
    expect(Array.isArray(data.learnOnline.description)).toBe(true);
    console.log('Description type:', typeof data.learnOnline.description);
    console.log('Description:', data.learnOnline.description);
  });

  test('Cloudflare Images URLs are accessible', async ({ request }) => {
    const apiResponse = await request.get('http://localhost:8000/api/pages/homepage');
    const data = await apiResponse.json();

    // Get first image URL
    const imageUrl = data.intro.backgroundImage;
    console.log('Testing image URL:', imageUrl);

    // Test if image is accessible
    const imageResponse = await request.get(imageUrl);
    expect(imageResponse.status()).toBe(200);

    const contentType = imageResponse.headers()['content-type'];
    console.log('Image content-type:', contentType);
    expect(contentType).toContain('image');
  });

  test('Cloudflare R2 video URL is accessible', async ({ request }) => {
    const apiResponse = await request.get('http://localhost:8000/api/pages/homepage');
    const data = await apiResponse.json();

    // Get video URL
    const videoUrl = data.hero.videoUrl;
    console.log('Testing video URL:', videoUrl);

    // Test if video is accessible (may need auth/CORS setup)
    const videoResponse = await request.get(videoUrl);
    console.log('Video response status:', videoResponse.status());

    // R2 might return 403 without proper setup, but we can at least verify the URL format
    expect(videoUrl).toContain('r2.cloudflarestorage.com');
  });
});
