import { expect, test } from '@playwright/test';

test('useAction with initial data', async ({ page }) => {
  await page.goto('/useAction/initialData');

  // Check if the initial data is present
  const initialData = await page.textContent('p#data');
  expect(initialData).toBe('Initial Data');

  // Click the button to update the data
  await page.click('button:has-text("Update Data")');

  // Wait for the updated data to appear
  await page.waitForSelector('p:has-text("Hello, Updated Data!")');

  // Check if the updated data is present
  const updatedData = await page.textContent('p#data');
  expect(updatedData).toBe('Hello, Updated Data!');
});
