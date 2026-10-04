import { expect, test } from '@playwright/test';

test('Bible home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Bible/i);
  await expect(page.getByText(/Bible/i).first()).toBeVisible();
});
