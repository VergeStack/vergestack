import { expect, test } from '@playwright/test';

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    callbackLogs: any[];
  }
}

test('useAction global success', async ({ page }) => {
  await page.goto('/useAction/callbacks/global/success');

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

  await page.waitForFunction(() => window.callbackLogs.length >= 2);

  const logs = await page.evaluate(() => window.callbackLogs);

  const onSuccessLog = logs.find((log) => log.type === 'onSuccess');
  expect(onSuccessLog).toBeTruthy();
  expect(onSuccessLog.data).toBe('Hello, world!');

  const onCompleteLog = logs.find((log) => log.type === 'onComplete');
  expect(onCompleteLog).toBeTruthy();

  const onErrorLog = logs.find((log) => log.type === 'onError');
  expect(onErrorLog).toBeFalsy();
});
