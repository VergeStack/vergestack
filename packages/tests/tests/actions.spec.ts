import { expect, test } from '@playwright/test';

test('has text', async ({ page }) => {
  await page.goto('/');

  // Wait for the greeting to appear
  await page.waitForSelector('p:has-text("Hello, world!")');

  // Check if the greeting text is present
  const greetingText = await page.textContent('p');
  expect(greetingText).toBe('Hello, world!');
});
