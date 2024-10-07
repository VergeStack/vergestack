import { expect, test } from '@playwright/test';

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    callbackLogs: any[];
  }
}

test('useAction success', async ({ page }) => {
  await page.goto('/useAction/callbacks/local/success');

  // Wait for "No data" to appear
  await page.waitForSelector('p:has-text("No data")');

  // Declare the callbackLogs property on the window object
  await page.evaluate(() => {
    window.callbackLogs = [];
  });

  // Create a new page with a custom route to intercept logs
  await page.route('**/log', async (route) => {
    const postData = route.request().postData();
    await page.evaluate((data) => {
      window.callbackLogs.push(JSON.parse(data as string));
    }, postData);
    await route.fulfill({ status: 200 });
  });

  // Click the button to execute the action
  await page.click('button');

  // Check if the greeting text is present
  await page.waitForSelector('p#data:has-text("Hello, world!")');

  // Wait for logs to be populated
  await page.waitForFunction(() => window.callbackLogs.length >= 2);

  // Retrieve and check the logs
  const logs = await page.evaluate(() => window.callbackLogs);

  // Check if onSuccess callback was called
  const onSuccessLog = logs.find((log) => log.type === 'onSuccess');
  expect(onSuccessLog).toBeTruthy();
  expect(onSuccessLog.data).toBe('Hello, world!');

  // Check if onComplete callback was called
  const onCompleteLog = logs.find((log) => log.type === 'onComplete');
  expect(onCompleteLog).toBeTruthy();

  // Check that onError was not called
  const onErrorLog = logs.find((log) => log.type === 'onError');
  expect(onErrorLog).toBeFalsy();
});
