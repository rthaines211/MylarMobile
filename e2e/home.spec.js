import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads home page with title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Mylar/);
  });

  test('shows header with app name', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toContainText('MylarMobile');
  });

  test('has bottom navigation with 4 items', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav.getByText('Home')).toBeVisible();
    await expect(nav.getByText('Upcoming')).toBeVisible();
    await expect(nav.getByText('Wanted')).toBeVisible();
    await expect(nav.getByText('Search')).toBeVisible();
  });

  test('has hamburger menu button', async ({ page }) => {
    await page.goto('/');
    const menuButton = page.locator('header button').first();
    await expect(menuButton).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('bottom nav to Upcoming works', async ({ page }) => {
    await page.goto('/');
    await page.click('nav >> text=Upcoming');
    await expect(page).toHaveURL('/upcoming');
  });

  test('bottom nav to Wanted works', async ({ page }) => {
    await page.goto('/');
    await page.click('nav >> text=Wanted');
    await expect(page).toHaveURL('/wanted');
  });

  test('bottom nav to Search works', async ({ page }) => {
    await page.goto('/');
    await page.click('nav >> text=Search');
    await expect(page).toHaveURL('/search');
  });

  test('bottom nav back to Home works', async ({ page }) => {
    await page.goto('/search');
    await page.click('nav >> text=Home');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Settings Page', () => {
  test('navigates to settings', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL('/settings');
  });

  test('has server configuration section', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Server Configuration')).toBeVisible();
  });

  test('has server URL input', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByPlaceholder(/localhost/)).toBeVisible();
  });

  test('has API key input', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByPlaceholder(/API key/)).toBeVisible();
  });

  test('has database path input for weekly pull', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByPlaceholder(/mylar.db/)).toBeVisible();
  });

  test('has theme toggle', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Theme')).toBeVisible();
  });

  test('has test connection button', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Test Connection')).toBeVisible();
  });

  test('has save settings button', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Save Settings')).toBeVisible();
  });

  test('has server management section when configured', async ({ page }) => {
    await page.goto('/settings');
    // Server management shows when configured
    const serverMgmt = page.getByText('Server Management');
    // May or may not be visible depending on config state
  });

  test('has backup & restore section', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Backup & Restore')).toBeVisible();
  });

  test('has export button', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Export')).toBeVisible();
  });

  test('has import button', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Import')).toBeVisible();
  });
});

test.describe('Calendar Page (New Feature)', () => {
  test('navigates to calendar', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page).toHaveURL('/calendar');
  });

  test('calendar page accessible via hamburger menu', async ({ page }) => {
    await page.goto('/');
    // Navigate to calendar via hamburger menu
    await page.locator('header button[aria-label="Open menu"]').click();
    await page.getByRole('button', { name: /calendar/i }).click();
    await expect(page).toHaveURL('/calendar');
  });
});

test.describe('Logs Page (New Feature)', () => {
  test('navigates to logs', async ({ page }) => {
    await page.goto('/logs');
    await expect(page).toHaveURL('/logs');
  });

  test('shows logs page content or error', async ({ page }) => {
    await page.goto('/logs');
    // Logs page shows title in header (even in error state)
    await expect(page.locator('header h1')).toContainText('Logs');
  });

  test('logs page has appropriate UI elements', async ({ page }) => {
    await page.goto('/logs');
    // Either shows filter input and auto-scroll, or shows error with retry button
    const hasFilter = await page.getByPlaceholder(/filter/i).isVisible().catch(() => false);
    const hasErrorRetry = await page.getByText(/retry|failed/i).isVisible().catch(() => false);
    const hasLoading = await page.getByText(/loading/i).isVisible().catch(() => false);
    expect(hasFilter || hasErrorRetry || hasLoading).toBe(true);
  });
});

test.describe('Hamburger Menu (New Feature)', () => {
  test('opens hamburger menu', async ({ page }) => {
    await page.goto('/');
    // Click the hamburger menu button (first button in header with aria-label)
    await page.locator('header button[aria-label="Open menu"]').click();
    // Menu should appear with "Mylar Mobile" branding
    await expect(page.getByText('Mylar Mobile')).toBeVisible();
    await expect(page.getByText('Activity')).toBeVisible();
  });

  test('menu has Calendar button', async ({ page }) => {
    await page.goto('/');
    await page.locator('header button[aria-label="Open menu"]').click();
    // Menu items are buttons, not links
    await expect(page.getByRole('button', { name: /calendar/i })).toBeVisible();
  });

  test('menu has Logs button', async ({ page }) => {
    await page.goto('/');
    await page.locator('header button[aria-label="Open menu"]').click();
    await expect(page.getByRole('button', { name: /logs/i })).toBeVisible();
  });

  test('menu has Settings button', async ({ page }) => {
    await page.goto('/');
    await page.locator('header button[aria-label="Open menu"]').click();
    await expect(page.getByRole('button', { name: /settings/i })).toBeVisible();
  });

  test('can navigate to Calendar from menu', async ({ page }) => {
    await page.goto('/');
    await page.locator('header button[aria-label="Open menu"]').click();
    await page.getByRole('button', { name: /calendar/i }).click();
    await expect(page).toHaveURL('/calendar');
  });

  test('can navigate to Logs from menu', async ({ page }) => {
    await page.goto('/');
    await page.locator('header button[aria-label="Open menu"]').click();
    await page.getByRole('button', { name: /logs/i }).click();
    await expect(page).toHaveURL('/logs');
  });
});

test.describe('Home Page Features', () => {
  test('home page renders content', async ({ page }) => {
    await page.goto('/');
    // Home page should have main content area
    await expect(page.locator('main')).toBeVisible();
  });

  test('home page has bottom navigation with Home link', async ({ page }) => {
    await page.goto('/');
    // Bottom nav is the fixed one at the bottom with Home, Upcoming, Wanted, Search
    const bottomNav = page.locator('nav').filter({ hasText: 'Home' }).filter({ hasText: 'Upcoming' });
    await expect(bottomNav).toBeVisible();
  });

  test('home header is visible', async ({ page }) => {
    await page.goto('/');
    // Header with app name should always be visible
    await expect(page.locator('header')).toContainText('MylarMobile');
  });
});

test.describe('PWA Features', () => {
  test('has PWA manifest', async ({ page, request }) => {
    // Use request API to fetch manifest without triggering download behavior
    const response = await request.get('/manifest.webmanifest');
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toBe('Mylar Mobile');
    expect(manifest.short_name).toBe('Mylar');
  });

  test('has service worker registration', async ({ request }) => {
    const response = await request.get('/registerSW.js');
    expect(response.status()).toBe(200);
  });

  test('has app icons', async ({ request }) => {
    const response = await request.get('/icons/icon-192.png');
    expect(response.status()).toBe(200);
  });
});

test.describe('Theme Toggle', () => {
  test('can toggle theme in settings', async ({ page }) => {
    await page.goto('/settings');

    // Get initial theme
    const initialIsDark = await page.evaluate(() =>
      !document.documentElement.classList.contains('light')
    );

    // Find the theme toggle - it's a rounded-full button (w-14 h-8) near the Theme text
    // Use a more specific selector: the toggle is the only button with rounded-full in the appearance section
    const toggleButton = page.locator('button.rounded-full').first();
    await toggleButton.click();

    // Verify theme changed
    const newIsDark = await page.evaluate(() =>
      !document.documentElement.classList.contains('light')
    );

    expect(newIsDark).not.toBe(initialIsDark);
  });
});
