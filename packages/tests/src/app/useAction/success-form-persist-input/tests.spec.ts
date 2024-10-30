import { expect, test } from '@playwright/test';

test('useAction success form persist input', async ({ page }) => {
  await page.goto('/useAction/success-form-persist-input');

  await page.fill('input[name="name"]', 'world');

  await page.waitForSelector('button');

  await page.click('button');

  await page.waitForSelector('p#data:has-text("Hello, world!")');

  const inputValue = await page.inputValue('input[name="name"]');
  expect(inputValue).toBe('world');
});
