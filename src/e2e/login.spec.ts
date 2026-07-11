import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test("renders login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|connexion/i })).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("wrong@test.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in|connexion/i }).click();
    // Should show an error message
    await expect(page.getByText(/invalid|error/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("has link to signup page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /sign up|s'inscrire/i })).toBeVisible();
  });
});