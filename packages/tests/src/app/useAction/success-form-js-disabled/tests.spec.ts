import { expect, test } from '@playwright/test';
test.use({ javaScriptEnabled: false });

test('useAction success form', async ({ page }) => {
  await page.goto('/useAction/success-form-js-disabled');

  await page.fill('input[name="name"]', 'world');

  await page.waitForSelector('button');

  await page.click('button');

  // Wait for navigation/form submission to complete
  await page.waitForLoadState('networkidle');

  // Check that input field is cleared after submission
  const inputValue = await page.inputValue('input[name="name"]');
  expect(inputValue).toBe('');
});
