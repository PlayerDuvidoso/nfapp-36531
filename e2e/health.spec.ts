import { test, expect } from "@playwright/test";

test.describe("Health Check Page", () => {
  test("should display health check page", async ({ page }) => {
    await page.goto("/health");
    
    // Check page title
    await expect(page.getByRole("heading", { name: /health check/i })).toBeVisible();
    
    // Check for application status
    await expect(page.getByText(/application/i)).toBeVisible();
    
    // Check for Supabase connection status
    await expect(page.getByText(/supabase connection/i)).toBeVisible();
  });

  test("should show application info", async ({ page }) => {
    await page.goto("/health");
    
    // Check for version info
    await expect(page.getByText(/version/i)).toBeVisible();
    
    // Check for environment info
    await expect(page.getByText(/environment/i)).toBeVisible();
  });

  test("should perform health checks", async ({ page }) => {
    await page.goto("/health");
    
    // Wait for health checks to complete (checking state changes to healthy/unhealthy)
    await page.waitForTimeout(2000);
    
    // At least one check should complete
    const healthyBadges = page.locator('text=healthy').or(page.locator('text=unhealthy'));
    await expect(healthyBadges.first()).toBeVisible();
  });
});
