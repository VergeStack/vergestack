import { expect, test } from '@playwright/test';

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    callbackLogs: any[];
  }
}

test('useAction global error', async ({ page }) => {
  await page.goto('/useAction/callbacks/global/error');

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

  await page.waitForSelector(
    'p#error:has-text(\'[{"message":"Forbidden error!"}]\')'
  );

  await page.waitForFunction(() => window.callbackLogs.length >= 3);

  const logs = await page.evaluate(() => window.callbackLogs);

  const onStartLog = logs.find((log) => log.type === 'onStart');
  expect(onStartLog).toBeTruthy();

  const onErrorLog = logs.find((log) => log.type === 'onError');
  expect(onErrorLog).toBeTruthy();
  expect(onErrorLog.errors).toEqual(
    expect.arrayContaining([
      {
        message: 'Forbidden error!'
      }
    ])
  );

  const onCompleteLog = logs.find((log) => log.type === 'onComplete');
  expect(onCompleteLog).toBeTruthy();

  const onSuccessLog = logs.find((log) => log.type === 'onSuccess');
  expect(onSuccessLog).toBeFalsy();

  // Check the order of callbacks
  const logOrder = logs.map((log) => log.type);
  expect(logOrder).toEqual(['onStart', 'onError', 'onComplete']);
});
