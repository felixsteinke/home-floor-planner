import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Keep the smoke check resilient to minor title formatting changes.
  await expect(page).toHaveTitle(/home[\s-]*floor[\s-]*planner/i);
  await expect(page.locator('app-root')).toBeVisible();
});
