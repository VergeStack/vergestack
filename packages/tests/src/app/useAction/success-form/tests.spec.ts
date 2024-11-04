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

test('useAction form redirect', async ({ page }) => {
  await page.goto('/useAction/success-form');

  // Fill in the special "redirect" value that triggers the redirect in the action
  await page.fill('input[name="name"]', 'redirect');

  await page.click('button');

  // Wait for and verify the redirect
  await page.waitForURL('/useAction/success-form-persist-input');
  expect(page.url()).toContain('/useAction/success-form-persist-input');
});
