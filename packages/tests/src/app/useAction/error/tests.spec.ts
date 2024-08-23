import { expect, test } from '@playwright/test';

test('useAction error', async ({ page }) => {
  await page.goto('/useAction/error');

  // Wait for the loading indicator to disappear
  await page.waitForSelector('p#data:has-text("Loading...")', {
    state: 'detached'
  });

  // Check if the greeting text is present
  const errorText = await page.textContent('p#error');
  expect(errorText).toBe('[{"message":"Internal Server Error"}]');
});
