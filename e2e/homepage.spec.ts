import { test, expect } from '@playwright/test';

test.describe('CampusAI Homepage', () => {
  test('should load homepage and display header and primary sections', async ({ page }) => {
    await page.goto('/');
    
    // Check page title or brand
    await expect(page).toHaveTitle(/CampusAI/i);

    // Check main heading or hero text
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    // Verify Tools Grid is present
    const toolsGrid = page.getByText(/Explore CampusAI Tools/i);
    await expect(toolsGrid).toBeVisible();
  });

  test('should render key navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check key tool cards in the tools grid
    await expect(page.getByText('Aggregate Calculator').first()).toBeVisible();
    await expect(page.getByText('Syllabus Finder').first()).toBeVisible();
    await expect(page.getByText('UNILAG Calculator').first()).toBeVisible();
    await expect(page.getByText('Admission Checklist').first()).toBeVisible();
  });
});
