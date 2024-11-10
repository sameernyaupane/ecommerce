import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Click the email/password form submit button specifically
    await page.click('form[method="post"] button[type="submit"]');
    
    // Add a small wait to allow for validation to complete
    await page.waitForTimeout(100);
    
    // Check for validation messages
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in form with invalid credentials
    await page.fill('form[method="post"] input[type="email"]', 'wrong@example.com');
    await page.fill('form[method="post"] input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('form[method="post"] button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=Login failed, please try again.')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in form with valid credentials
    await page.fill('form[method="post"] input[type="email"]', 'test@example.com');
    await page.fill('form[method="post"] input[type="password"]', 'password123');
    
    // Submit form
    await page.click('form[method="post"] button[type="submit"]');
    
    // Check if redirected to home page
    await expect(page).toHaveURL('/');
    
    // Verify logged in state
    await expect(page.locator('text=Account')).toBeVisible();
  });

  test('should show Google login option', async ({ page }) => {
    // Check if Google login button exists
    await expect(page.locator('button:has-text("Continue with Google")')).toBeVisible();
  });
}); 