import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display main dashboard", async ({ page }) => {
    // Check for main heading or title
    await expect(page.locator("text=Sistema Nota Fiscal").or(page.locator("text=Notas Fiscais"))).toBeVisible();
  });

  test("should display NFe list", async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Should show either NFe items or empty state
    const hasContent = await page.locator("table, text=Nenhuma nota fiscal encontrada").isVisible();
    expect(hasContent).toBeTruthy();
  });

  test("should have filter controls", async ({ page }) => {
    // Check for filter dropdowns
    const filters = page.locator("select, button[role='combobox']");
    const filterCount = await filters.count();
    
    // Should have at least some filter controls
    expect(filterCount).toBeGreaterThan(0);
  });

  test("should open NFe registration dialog", async ({ page }) => {
    // Look for the floating action button or registration button
    const registerButton = page.locator("button").filter({ hasText: /registrar|adicionar|novo/i }).first();
    
    if (await registerButton.isVisible()) {
      await registerButton.click();
      
      // Dialog should open
      await page.waitForTimeout(500);
      const dialog = page.locator("[role='dialog'], [role='alertdialog']");
      await expect(dialog).toBeVisible();
    }
  });

  test("should navigate between tabs", async ({ page }) => {
    // Look for tabs
    const lojaTab = page.locator("text=Lojas, text=Loja").first();
    
    if (await lojaTab.isVisible()) {
      await lojaTab.click();
      await page.waitForTimeout(500);
      
      // Should see shops content
      expect(await page.locator("text=CNPJ, text=loja").isVisible()).toBeTruthy();
    }
  });
});
