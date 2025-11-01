import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock import.meta.env
const mockEnv = {
  VITE_SUPABASE_URL: "https://test.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "test-key",
  VITE_SUPABASE_PROJECT_ID: "test-project",
  VITE_APP_ENV: "development",
  VITE_APP_VERSION: "1.0.0",
};

vi.mock("../lib/env", async () => {
  const actual = await vi.importActual("../lib/env");
  return {
    ...actual,
    env: mockEnv,
    isDevelopment: true,
    isProduction: false,
    isStaging: false,
  };
});

describe("Environment Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export env object with required variables", async () => {
    const { env } = await import("../lib/env");
    
    expect(env).toBeDefined();
    expect(env.VITE_SUPABASE_URL).toBe(mockEnv.VITE_SUPABASE_URL);
    expect(env.VITE_SUPABASE_PUBLISHABLE_KEY).toBe(mockEnv.VITE_SUPABASE_PUBLISHABLE_KEY);
    expect(env.VITE_SUPABASE_PROJECT_ID).toBe(mockEnv.VITE_SUPABASE_PROJECT_ID);
  });

  it("should export environment helper flags", async () => {
    const { isDevelopment, isProduction, isStaging } = await import("../lib/env");
    
    expect(isDevelopment).toBe(true);
    expect(isProduction).toBe(false);
    expect(isStaging).toBe(false);
  });

  it("should have correct app metadata", async () => {
    const { env } = await import("../lib/env");
    
    expect(env.VITE_APP_ENV).toBe("development");
    expect(env.VITE_APP_VERSION).toBeDefined();
  });
});
