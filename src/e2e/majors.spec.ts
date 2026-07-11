import { test, expect } from "@playwright/test";

test.describe("Majors Page", () => {
  test("renders majors listing", async ({ page }) => {
    await page.goto("/majors");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("navigates back to home", async ({ page }) => {
    await page.goto("/majors");
    await page.getByRole("link", { name: /home|accueil/i }).first().click();
    await expect(page).toHaveURL("/");
  });
});