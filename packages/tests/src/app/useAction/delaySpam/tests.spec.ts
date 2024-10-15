import { expect, test } from '@playwright/test';

test('useAction delay spam', async ({ page }) => {
  const callCount = 5;

  await page.goto('/useAction/delaySpam');

  // Initial state
  await expect(page.locator('p#data')).toHaveText('');
  await expect(page.locator('p#callCount')).toHaveText('Call count: 0');

  // Set up a request counter
  let requestCount = 0;
  await page.route('**/delaySpam', async (route) => {
    if (route.request().method() === 'POST') {
      requestCount++;
    }
    await route.continue();
  });

  // Click the button multiple times rapidly
  for (let i = 0; i < callCount; i++) {
    await page.click('button');
    await page.waitForTimeout(100);
  }

  // Wait for the pending state
  await expect(page.locator('p#data')).toHaveText('Pending...');

  // Check that the call count has increased
  await expect(page.locator('p#callCount')).toHaveText(
    `Call count: ${callCount}`
  );

  // Wait for the action to complete
  await expect(page.locator('p#data')).toHaveText('Hello, world!', {
    timeout: 5000
  });

  // Check that only one request was made
  expect(requestCount).toBe(1);

  // Reset the request counter
  requestCount = 0;

  // Click the button again now that it's not pending
  await page.click('button');

  // Check that the call count has increased again
  await expect(page.locator('p#callCount')).toHaveText('Call count: 6');

  // Wait for the pending state again
  await expect(page.locator('p#data')).toHaveText('Pending...');

  // Wait for the action to complete again
  await expect(page.locator('p#data')).toHaveText('Hello, world!', {
    timeout: 5000
  });

  // Check that only one request was made for the second call
  expect(requestCount).toBe(1);
});
