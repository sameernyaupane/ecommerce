import { test, expect } from '@playwright/test';
import sql from '@/database/sql';
import { UserModel } from '@/models/UserModel';

test.describe('Signup Flow', () => {
  const TEST_EMAIL = 'newuser@example.com';
  const EXISTING_EMAIL = 'existing@example.com';
  const TEST_PASSWORD = 'password123';

  test('should signup successfully with valid data', async ({ page }) => {
    await sql`DELETE FROM users WHERE email = ${TEST_EMAIL}`;

    await page.goto('/signup');
    await page.fill('form[method="post"] input[type="text"]', 'Test User');
    await page.fill('form[method="post"] input[type="email"]', TEST_EMAIL);
    await page.fill('form[method="post"] input[type="password"]', TEST_PASSWORD);
    await page.locator('#terms-checkbox').evaluate(e => (e as HTMLInputElement).click());
    
    await page.click('form[method="post"] button[type="submit"]');
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('a[href="/dashboard"][data-discover="true"]')).toBeVisible();

    await sql`DELETE FROM users WHERE email = ${TEST_EMAIL}`;
  });

  test('should show error for existing email', async ({ page }) => {
    await sql`DELETE FROM users WHERE email = ${EXISTING_EMAIL}`;

    await UserModel.create({
      name: 'Test User',
      email: EXISTING_EMAIL,
      password: TEST_PASSWORD,
      role: 'user'
    });
    
    await page.goto('/signup');
    await page.fill('form[method="post"] input[type="text"]', 'Another User');
    await page.fill('form[method="post"] input[type="email"]', EXISTING_EMAIL);
    await page.fill('form[method="post"] input[type="password"]', TEST_PASSWORD);
    await page.locator('#terms-checkbox').evaluate(e => (e as HTMLInputElement).click());
    await page.click('form[method="post"] button[type="submit"]');
    
    await expect(page.locator('text=Email already exists')).toBeVisible();

    await sql`DELETE FROM users WHERE email = ${EXISTING_EMAIL}`;
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/signup');
    await page.click('form[method="post"] button[type="submit"]');
    
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
    await expect(page.locator('text=You must accept the terms and conditions')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('form[method="post"] input[type="text"]', 'Test User');
    await page.fill('form[method="post"] input[type="email"]', 'invalid-email');
    await page.fill('form[method="post"] input[type="password"]', TEST_PASSWORD);
    await page.locator('#terms-checkbox').evaluate(e => (e as HTMLInputElement).click());
    
    await page.click('form[method="post"] button[type="submit"]');
    
    await expect(page.locator('text=Invalid email format')).toBeVisible();
  });

  test('should show error for weak password', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('form[method="post"] input[type="text"]', 'Test User');
    await page.fill('form[method="post"] input[type="email"]', TEST_EMAIL);
    await page.fill('form[method="post"] input[type="password"]', '123');
    await page.locator('#terms-checkbox').evaluate(e => (e as HTMLInputElement).click());
    
    await page.click('form[method="post"] button[type="submit"]');
    
    await expect(page.locator('text=Password must be at least 6 characters long')).toBeVisible();
  });

  test('should show Google signup option', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('button:has-text("Sign up with Google")')).toBeVisible();
  });
}); 