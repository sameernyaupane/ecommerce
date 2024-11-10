import { test, expect } from '@playwright/test';

test('should signup successfully with valid data', async ({ page }) => {
  // Fill in form with valid data
  await page.fill('form[method="post"] input[type="text"]', 'Test User');
  await page.fill('form[method="post"] input[type="email"]', 'newuser@example.com');
  await page.fill('form[method="post"] input[type="password"]', 'password123');
  await page.locator('#terms-checkbox').evaluate(e => (e as HTMLInputElement).click());
  
  // Submit form
  await page.click('form[method="post"] button[type="submit"]');
  
  // Check if redirected to home page
  await expect(page).toHaveURL('/');
  
  // Verify logged in state - use a more specific selector
  await expect(page.locator('[data-testid="user-menu-button"]')).toBeVisible();
  // Or if you have a specific navigation element that only appears when logged in:
  // await expect(page.locator('nav [data-testid="user-profile"]')).toBeVisible();
}); 