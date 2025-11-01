import { z } from "zod";

/**
 * Environment variable validation schema
 * Only includes PUBLIC variables safe for browser exposure
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, "Supabase publishable key is required"),
  VITE_SUPABASE_PROJECT_ID: z.string().min(1, "Supabase project ID is required"),
  VITE_APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  VITE_APP_VERSION: z.string().default("0.0.0"),
  // Optional variables
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_PLAUSIBLE_DOMAIN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates and parses environment variables
 * Throws detailed error if validation fails
 */
function validateEnv(): Env {
  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION || "dev",
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_PLAUSIBLE_DOMAIN: import.meta.env.VITE_PLAUSIBLE_DOMAIN,
  };

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => issue.path.join(".")).join(", ");
      
      console.error("❌ Environment validation failed!");
      console.error("Missing or invalid environment variables:", missingVars);
      console.error("\nPlease ensure all required variables are set in your .env file.");
      console.error("See .env.example for reference.\n");
      console.error("Detailed errors:", error.issues);

      // In CI/test, provide more helpful error
      if (import.meta.env.MODE === "test" || process.env.CI) {
        console.error("\n⚠️  Running in CI/test mode. Set variables in GitHub Secrets.");
      }

      throw new Error(
        `Environment validation failed. Missing/invalid: ${missingVars}. Check console for details.`
      );
    }
    throw error;
  }
}

/**
 * Validated environment variables
 * Use this throughout the app instead of import.meta.env
 */
export const env = validateEnv();

/**
 * Runtime environment helpers
 */
export const isDevelopment = env.VITE_APP_ENV === "development";
export const isProduction = env.VITE_APP_ENV === "production";
export const isStaging = env.VITE_APP_ENV === "staging";
