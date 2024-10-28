import { expect, test } from '@playwright/test';

test('useAction success form', async ({ page }) => {
  await page.goto('/useAction/success-form');

  await page.fill('input[name="name"]', 'world');

  await page.waitForSelector('button');

  await page.click('button');

  await page.waitForSelector('p#data:has-text("Hello, world!")');

  // Check if the greeting text is present
  const greetingText = await page.textContent('p#data');
  expect(greetingText).toBe('Hello, world!');
});
