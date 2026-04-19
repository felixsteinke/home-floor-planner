import { expect, test } from '@playwright/test';

test('offers onboarding on first load and remains non-blocking', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/home[\s-]*floor[\s-]*planner/i);
  await expect(page.getByRole('heading', { name: /welcome to home floor planner/i })).toBeVisible();

  await page.getByRole('button', { name: /skip/i }).click();
  await expect(page.getByTestId('editor-map-svg')).toBeVisible();
});

test('opens data and privacy dialog from toolbar', async ({ page }) => {
  await page.goto('/');

  const onboardingHeading = page.getByRole('heading', { name: /welcome to home floor planner/i });
  if (await onboardingHeading.isVisible()) {
    await page.getByRole('button', { name: /skip/i }).click();
  }

  await page.getByRole('button', { name: /data and privacy/i }).click();
  await expect(page.getByRole('heading', { name: /data and privacy/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /reset onboarding/i })).toBeVisible();
});

test('creates and switches workbook from data dialog', async ({ page }) => {
  await page.goto('/');

  const onboardingHeading = page.getByRole('heading', { name: /welcome to home floor planner/i });
  if (await onboardingHeading.isVisible()) {
    await page.getByRole('button', { name: /skip/i }).click();
  }

  await page.getByRole('button', { name: /data and privacy/i }).click();
  const dataDialog = page.getByRole('dialog', { name: /data and privacy/i });
  await dataDialog.getByRole('button', { name: /create workbook/i }).click();
  const nameDialog = page.getByRole('dialog', { name: /create workbook/i });
  await nameDialog.getByLabel(/workbook name/i).fill('Workbook E2E');
  await nameDialog.getByRole('button', { name: /create workbook/i }).click();

  const browserLocalDialog = page.getByRole('dialog', { name: /workbook created/i });
  await browserLocalDialog.getByRole('button', { name: /got it/i }).click();

  await expect(dataDialog.getByText(/active workbook:\s*Workbook E2E/i)).toBeVisible();

  await dataDialog.getByLabel(/switch workbook/i).click();
  await page.getByRole('option', { name: /compact home example/i }).click();
  await expect(dataDialog.getByText(/active workbook:\s*Compact Home Example/i)).toBeVisible();
});

test('supports route-driven workbook startup and fallback', async ({ page }) => {
  await page.goto('/new');

  const nameDialog = page.getByRole('dialog', { name: /create workbook/i });
  await expect(nameDialog).toBeVisible();
  await nameDialog.getByLabel(/workbook name/i).fill('Route Workbook');
  await nameDialog.getByRole('button', { name: /create workbook/i }).click();
  await page
    .getByRole('dialog', { name: /workbook created/i })
    .getByRole('button')
    .click();

  await expect(page).toHaveURL(/\/w\/route-workbook/i);

  await page.goto('/w/path-that-does-not-exist');
  await expect(page.getByRole('dialog', { name: /create workbook/i })).toBeVisible();
});

test('highlights onboarding targets for active guidance step', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.locator('[data-onboarding-target="drawer-region"].onboarding-highlight'),
  ).toBeVisible();
});
