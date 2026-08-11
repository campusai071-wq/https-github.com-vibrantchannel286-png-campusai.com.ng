import { test, expect } from '@playwright/test';

test.describe('CampusAI Navigation & Routes', () => {
  test('should navigate to Syllabus page', async ({ page }) => {
    await page.goto('/syllabus');
    await expect(page).toHaveURL(/\/syllabus/);
    await expect(page.getByText(/UTME Master Syllabus Explorer/i).first()).toBeVisible();
  });

  test('should navigate to News page', async ({ page }) => {
    await page.goto('/news');
    await expect(page).toHaveURL(/\/news/);
    await expect(page.getByText(/Admission News|Campus Updates/i).first()).toBeVisible();
  });

  test('should navigate to Post-UTME Release Hub page', async ({ page }) => {
    await page.goto('/postutme');
    await expect(page).toHaveURL(/\/postutme/);
    await expect(page.getByText(/Post-UTME/i).first()).toBeVisible();
  });

  test('should navigate to CGPA Calculator page', async ({ page }) => {
    await page.goto('/cgpa-calculator');
    await expect(page).toHaveURL(/\/cgpa-calculator/);
  });

  test('should navigate to Admission Document Checklist page', async ({ page }) => {
    await page.goto('/admission-checklist');
    await expect(page).toHaveURL(/\/admission-checklist/);
    await expect(page.getByText(/Checklist/i).first()).toBeVisible();
  });

  test('should navigate to System Status page', async ({ page }) => {
    await page.goto('/status');
    await expect(page).toHaveURL(/\/status/);
    await expect(page.getByText(/System Status/i).first()).toBeVisible();
  });
});
