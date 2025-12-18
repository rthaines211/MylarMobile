import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MylarMobile/);
  });

  test('shows settings prompt when not configured', async ({ page }) => {
    // Clear localStorage to simulate unconfigured state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Should show configuration message
    await expect(page.getByText(/not configured/i)).toBeVisible();
  });

  test('navigates to settings', async ({ page }) => {
    await page.goto('/');

    // Click settings icon in header or hamburger menu
    const settingsLink = page.locator('a[href="/settings"]').first();
    await settingsLink.click();

    await expect(page).toHaveURL('/settings');
    await expect(page.getByText(/Server Configuration/i)).toBeVisible();
  });

  test('settings page has required fields', async ({ page }) => {
    await page.goto('/settings');

    // Check for required form fields
    await expect(page.getByPlaceholder(/localhost/i)).toBeVisible();
    await expect(page.getByPlaceholder(/API key/i)).toBeVisible();
    await expect(page.getByText(/Test Connection/i)).toBeVisible();
    await expect(page.getByText(/Save Settings/i)).toBeVisible();
  });

  test('bottom navigation is visible', async ({ page }) => {
    await page.goto('/');

    // Check bottom nav items are present
    await expect(page.locator('nav').filter({ hasText: /Home/i })).toBeVisible();
    await expect(page.locator('nav').filter({ hasText: /Upcoming/i })).toBeVisible();
    await expect(page.locator('nav').filter({ hasText: /Search/i })).toBeVisible();
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/settings');

    // Find and click theme toggle
    const themeToggle = page.getByRole('button').filter({ has: page.locator('.lucide-moon, .lucide-sun') });

    // Get initial state
    const initialTheme = await page.evaluate(() =>
      document.documentElement.classList.contains('light') ? 'light' : 'dark'
    );

    await themeToggle.click();

    // Verify theme changed
    const newTheme = await page.evaluate(() =>
      document.documentElement.classList.contains('light') ? 'light' : 'dark'
    );

    expect(newTheme).not.toBe(initialTheme);
  });
});

test.describe('Navigation', () => {
  test('bottom nav links work', async ({ page }) => {
    await page.goto('/');

    // Test Upcoming link
    await page.click('nav >> text=Upcoming');
    await expect(page).toHaveURL('/upcoming');

    // Test Search link
    await page.click('nav >> text=Search');
    await expect(page).toHaveURL('/search');

    // Test Home link
    await page.click('nav >> text=Home');
    await expect(page).toHaveURL('/');
  });
});
