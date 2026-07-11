import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("renders the page title", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/medlearn/i);
  });

  test("shows academic programs section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/academic programs|programmes académiques/i)).toBeVisible();
  });

  test("navigates to majors page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /browse modules|parcourir/i }).first().click();
    await expect(page).toHaveURL(/\/majors/);
  });

  test("has working header navigation", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav, header");
    await expect(nav).toBeVisible();
  });
});