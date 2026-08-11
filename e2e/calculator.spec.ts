import { test, expect } from '@playwright/test';

test.describe('Aggregate Calculator Flow', () => {
  test('should load aggregate calculator view directly', async ({ page }) => {
    await page.goto('/calculator');
    await expect(page).toHaveURL(/\/calculator/);
  });

  test('should allow navigating from homepage to calculator via card click', async ({ page }) => {
    await page.goto('/');
    const calcCard = page.getByText('Aggregate Calculator').first();
    await calcCard.click();
    await expect(page).toHaveURL(/\/calculator/);
  });
});
