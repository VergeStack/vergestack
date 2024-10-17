import { expect, test } from '@playwright/test';

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    callbackLogs: any[];
  }
}

test('useAction local success overrides global', async ({ page }) => {
  await page.goto('/useAction/callbacks/local/override');

  await page.waitForSelector('p:has-text("No data")');

  await page.evaluate(() => {
    window.callbackLogs = [];
  });

  await page.route('**/log', async (route) => {
    const postData = route.request().postData();
    await page.evaluate((data) => {
      window.callbackLogs.push(JSON.parse(data as string));
    }, postData);
    await route.fulfill({ status: 200 });
  });

  await page.click('button');

  await page.waitForSelector('p#data:has-text("Hello, world!")');

  await page.waitForFunction(() => window.callbackLogs.length >= 3);

  const logs = await page.evaluate(() => window.callbackLogs);

  const localOnStartLog = logs.find((log) => log.type === 'localOnStart');
  expect(localOnStartLog).toBeTruthy();

  const globalOnStartLog = logs.find((log) => log.type === 'globalOnStart');
  expect(globalOnStartLog).toBeFalsy();

  const localOnSuccessLog = logs.find((log) => log.type === 'localOnSuccess');
  expect(localOnSuccessLog).toBeTruthy();
  expect(localOnSuccessLog.data).toBe('Hello, world!');

  const globalOnSuccessLog = logs.find((log) => log.type === 'globalOnSuccess');
  expect(globalOnSuccessLog).toBeFalsy();

  const globalOnCompleteLog = logs.find(
    (log) => log.type === 'globalOnComplete'
  );
  expect(globalOnCompleteLog).toBeTruthy();

  const globalOnErrorLog = logs.find((log) => log.type === 'globalOnError');
  expect(globalOnErrorLog).toBeFalsy();

  // Check the order of callbacks
  const logOrder = logs.map((log) => log.type);
  expect(logOrder).toEqual([
    'localOnStart',
    'localOnSuccess',
    'globalOnComplete'
  ]);
});
