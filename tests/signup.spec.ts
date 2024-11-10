import { test, expect } from '@playwright/test';
import sql from '@/database/sql';

test.describe('Signup Flow', () => {
  const TEST_EMAIL = 'newuser@example.com';

  // Clean up test user before and after tests
  test.beforeAll(async () => {
    try {
      await sql`DELETE FROM users WHERE email = ${TEST_EMAIL}`;
    } catch (error) {
      console.error('Error cleaning up test user:', error);
    }
  });

  test.afterAll(async () => {
    try {
      await sql`DELETE FROM users WHERE email = ${TEST_EMAIL}`;
      await sql.end();
    } catch (error) {
      console.error('Error cleaning up test user:', error);
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Click submit without filling the form
    await page.click('form[method="post"] button[type="submit"]');
    
    // Wait for validation messages
    await page.waitForTimeout(100);
    
    // Check for validation messages
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
    await expect(page.locator('text=You must accept the terms and conditions')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Fill form with invalid email
    await page.fill('form[method="post"] input[type="text"]', 'Test User');
    await page.fill('form[method="post"] input[type="email"]', 'invalid-email');
    await page.fill('form[method="post"] input[type="password"]', 'password123');
    await page.locator('#terms-checkbox').evaluate(e => (e as HTMLInputElement).click());
    
    // Submit form
    await page.click('form[method="post"] button[type="submit"]');
    
    // Check for error message
    await expect(page.locator('text=Invalid email format')).toBeVisible();
  });

  test('should show error for weak password', async ({ page }) => {
    // Fill form with weak password
    await page.fill('form[method="post"] input[type="text"]', 'Test User');
    await page.fill('form[method="post"] input[type="email"]', TEST_EMAIL);
    await page.fill('form[method="post"] input[type="password"]', '123');
    await page.locator('#terms-checkbox').evaluate(e => (e as HTMLInputElement).click());
    
    // Submit form
    await page.click('form[method="post"] button[type="submit"]');
    
    // Check for error message about password requirements
    await expect(page.locator('text=Password must be at least 6 characters long')).toBeVisible();
  });

  test('should show Google signup option', async ({ page }) => {
    // Check if Google signup button exists
    await expect(page.locator('button:has-text("Sign up with Google")')).toBeVisible();
  });

  test('should signup successfully with valid data', async ({ page }) => {
    // Fill in form with valid data
    await page.fill('form[method="post"] input[type="text"]', 'Test User');
    await page.fill('form[method="post"] input[type="email"]', TEST_EMAIL);
    await page.fill('form[method="post"] input[type="password"]', 'password123');
    await page.locator('#terms-checkbox').evaluate(e => (e as HTMLInputElement).click());
    
    // Submit form
    await page.click('form[method="post"] button[type="submit"]');
    
    // Check if redirected to home page
    await expect(page).toHaveURL('/');
    
    // Verify logged in state by checking for Dashboard link
    await expect(page.locator('a[href="/dashboard"][data-discover="true"]')).toBeVisible();
    // Or alternatively using the text content
    // await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  });

  test('should show error for existing email', async ({ page }) => {
    // First signup
    await page.fill('form[method="post"] input[type="text"]', 'Test User');
    await page.fill('form[method="post"] input[type="email"]', TEST_EMAIL);
    await page.fill('form[method="post"] input[type="password"]', 'password123');
    await page.locator('#terms-checkbox').evaluate(e => (e as HTMLInputElement).click());
    await page.click('form[method="post"] button[type="submit"]');
    
    // Go back to signup page
    await page.goto('/signup');
    
    // Try to signup with same email
    await page.fill('form[method="post"] input[type="text"]', 'Another User');
    await page.fill('form[method="post"] input[type="email"]', TEST_EMAIL);
    await page.fill('form[method="post"] input[type="password"]', 'password123');
    await page.locator('#terms-checkbox').evaluate(e => (e as HTMLInputElement).click());
    await page.click('form[method="post"] button[type="submit"]');
    
    // Check for duplicate email error
    await expect(page.locator('text=Email already exists')).toBeVisible();
  });
}); 