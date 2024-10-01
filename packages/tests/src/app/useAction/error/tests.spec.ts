import { expect, test } from '@playwright/test';

test('useAction error', async ({ page }) => {
  await page.goto('/useAction/error');

  // Wait for the action to be triggered
  await page.waitForSelector('p#triggered:has-text("true")');

  // Wait for pending state to finish
  await page.waitForSelector('p#data:empty', { state: 'attached' });

  const errorText = await page.textContent('p#error');
  expect(errorText).toBe('[{"message":"Internal Server Error"}]');
});
