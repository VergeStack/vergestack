import { expect, test } from '@playwright/test';
test.use({ javaScriptEnabled: false });

const expectedFormData =
  `Content-Disposition: form-data; name="name" world`.replace(/\s+/g, ' ');

test('useAction success form with js disabled', async ({ page }) => {
  await page.goto('/useAction/success-form-js-disabled');

  await page.fill('input[name="name"]', 'world');

  await page.waitForSelector('button');

  // Intercept form submission
  const submitPromise = page.waitForRequest((request) => {
    return (
      request.url().includes('/useAction/success-form-js-disabled') &&
      request.method() === 'POST'
    );
  });

  await page.click('button');

  // Wait for and verify the form submission
  const request = await submitPromise;
  const data = request.postData();
  expect(data?.replace(/\s+/g, ' ').includes(expectedFormData)).toBeTruthy();

  // Wait for navigation/form submission to complete
  await page.waitForLoadState('networkidle');

  // Check that input field is cleared after submission
  const inputValue = await page.inputValue('input[name="name"]');
  expect(inputValue).toBe('');
});
