import { test, expect } from '@playwright/test';
import sql from '@/database/sql';
import { UserModel } from '@/models/UserModel';

test.describe('Login Flow', () => {
  const TEST_EMAIL = 'test@example.com';
  const TEST_PASSWORD = 'password123';

  test.beforeAll(async () => {
    try {
      await sql`DELETE FROM users WHERE email = ${TEST_EMAIL}`;
      await UserModel.create({
        name: 'Test User',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'user'
      });
    } catch (error) {
      console.error('Error setting up test user:', error);
      throw error;
    }
  });

  test.afterAll(async () => {
    try {
      await sql`DELETE FROM users WHERE email = ${TEST_EMAIL}`;
    } catch (error) {
      console.error('Error cleaning up test user:', error);
      throw error;
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('form[method="post"] button[type="submit"]');
    
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('form[method="post"] input[type="email"]', TEST_EMAIL);
    await page.fill('form[method="post"] input[type="password"]', TEST_PASSWORD);
    
    await page.click('form[method="post"] button[type="submit"]');
    
    await expect(page).toHaveURL('/');
    
    await expect(page.locator('a[href="/dashboard"][data-discover="true"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('form[method="post"] input[type="email"]', 'wrong@example.com');
    await page.fill('form[method="post"] input[type="password"]', 'wrongpassword');
    
    await page.click('form[method="post"] button[type="submit"]');
    
    await expect(page.locator('text=Login failed, please try again.')).toBeVisible();
  });

  test('should show Google login option', async ({ page }) => {
    await expect(page.locator('button:has-text("Log in with Google")')).toBeVisible();
  });
}); 