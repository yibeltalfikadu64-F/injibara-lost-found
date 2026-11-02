/**
 * Injibara Campus Lost & Found
 *
 * Environment Variable Validation
 *
 * Zod 4 validation for backend configuration.
 */

import { z } from "zod";

// ======================================================
// 1. ENVIRONMENT SCHEMA
// ======================================================

export const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z
    .string()
    .default("5000")
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535)),

  API_PREFIX: z
    .string()
    .default("/api/v1")
    .transform((value) => (value.startsWith("/") ? value : `/${value}`)),

  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required.")
    .refine((value) => {
      try {
        const parsed = new URL(value);

        return (
          parsed.protocol === "postgresql:" || parsed.protocol === "postgres:"
        );
      } catch {
        return false;
      }
    }, "DATABASE_URL must be a valid PostgreSQL connection URL."),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must contain at least 32 characters."),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must contain at least 32 characters."),

  JWT_EMAIL_SECRET: z.string().min(32).optional(),

  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

  JWT_REFRESH_EXPIRES_IN_DAYS: z
    .string()
    .default("30")
    .transform(Number)
    .pipe(z.number().int().min(1).max(365)),

  JWT_EMAIL_EXPIRES_IN_MINUTES: z
    .string()
    .default("30")
    .transform(Number)
    .pipe(z.number().int().min(1).max(1440)),

  CORS_ORIGIN: z.string().default("http://localhost:8081"),

  UPLOAD_DIR: z.string().default("uploads"),

  AUTH_REQUIRE_EMAIL_VERIFICATION: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),

  AUTH_ALLOW_PUBLIC_REGISTRATION: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),

  AUTH_MAX_LOGIN_ATTEMPTS: z
    .string()
    .default("10")
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),

  AUTH_PASSWORD_RESET_EXPIRES_IN_MINUTES: z
    .string()
    .default("15")
    .transform(Number)
    .pipe(z.number().int().min(1).max(60)),

  FRONTEND_URL: z.string().url().default("http://localhost:8081"),

  APP_NAME: z.string().default("Injibara Campus Lost & Found"),
});

// ======================================================
// 2. ENVIRONMENT TYPE
// ======================================================

export type Environment = z.infer<typeof environmentSchema>;

// ======================================================
// 3. VALIDATE ENVIRONMENT
// ======================================================

export function validateEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): Environment {
  const result = environmentSchema.safeParse(environment);

  if (!result.success) {
    const formattedErrors = result.error.issues.map((issue) => ({
      variable: issue.path.join("."),
      message: issue.message,
    }));

    console.error("\n========== ENVIRONMENT VALIDATION FAILED ==========\n");

    for (const issue of formattedErrors) {
      console.error(`${issue.variable}: ${issue.message}`);
    }

    console.error("\nPlease check your backend/.env file.");

    console.error("Do not share your database password or JWT secrets.");

    console.error("\n====================================================\n");

    throw new Error("Invalid backend environment configuration.");
  }

  return result.data;
}

// ======================================================
// 4. ENVIRONMENT CHECK
// ======================================================

export function isProduction(environment: Environment): boolean {
  return environment.NODE_ENV === "production";
}

export function isDevelopment(environment: Environment): boolean {
  return environment.NODE_ENV === "development";
}

export function isTest(environment: Environment): boolean {
  return environment.NODE_ENV === "test";
}

// ======================================================
// 5. REQUIRED SECRET CHECK
// ======================================================

export function validateAuthenticationSecrets(environment: Environment): void {
  if (environment.JWT_ACCESS_SECRET === environment.JWT_REFRESH_SECRET) {
    throw new Error(
      "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different.",
    );
  }

  if (
    environment.JWT_EMAIL_SECRET &&
    environment.JWT_EMAIL_SECRET === environment.JWT_ACCESS_SECRET
  ) {
    throw new Error(
      "JWT_EMAIL_SECRET must be different from JWT_ACCESS_SECRET.",
    );
  }

  if (
    environment.JWT_EMAIL_SECRET &&
    environment.JWT_EMAIL_SECRET === environment.JWT_REFRESH_SECRET
  ) {
    throw new Error(
      "JWT_EMAIL_SECRET must be different from JWT_REFRESH_SECRET.",
    );
  }
}

// ======================================================
// 6. DEFAULT EXPORT
// ======================================================

export default validateEnvironment;
