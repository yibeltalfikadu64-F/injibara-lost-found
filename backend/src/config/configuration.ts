/**
 * Injibara Campus Lost & Found
 *
 * Application Configuration
 *
 * Centralized typed configuration.
 */

import "dotenv/config";

import {
  validateEnvironment,
  validateAuthenticationSecrets,
  type Environment,
} from "./env.validation.js";

// ======================================================
// 1. LOAD AND VALIDATE ENVIRONMENT
// ======================================================

const environment: Environment = validateEnvironment(process.env);

// ======================================================
// 2. VALIDATE SECRET RELATIONSHIPS
// ======================================================

validateAuthenticationSecrets(environment);

// ======================================================
// 3. APPLICATION CONFIGURATION
// ======================================================

export const configuration = {
  app: {
    name: environment.APP_NAME,

    environment: environment.NODE_ENV,

    port: environment.PORT,

    apiPrefix: environment.API_PREFIX,

    isProduction: environment.NODE_ENV === "production",

    isDevelopment: environment.NODE_ENV === "development",

    isTest: environment.NODE_ENV === "test",
  },

  database: {
    url: environment.DATABASE_URL,
  },

  jwt: {
    accessSecret: environment.JWT_ACCESS_SECRET,

    refreshSecret: environment.JWT_REFRESH_SECRET,

    emailSecret: environment.JWT_EMAIL_SECRET ?? environment.JWT_ACCESS_SECRET,

    accessExpiresIn: environment.JWT_ACCESS_EXPIRES_IN,

    refreshExpiresInDays: environment.JWT_REFRESH_EXPIRES_IN_DAYS,

    emailExpiresInMinutes: environment.JWT_EMAIL_EXPIRES_IN_MINUTES,
  },

  auth: {
    requireEmailVerification: environment.AUTH_REQUIRE_EMAIL_VERIFICATION,

    allowPublicRegistration: environment.AUTH_ALLOW_PUBLIC_REGISTRATION,

    maxLoginAttempts: environment.AUTH_MAX_LOGIN_ATTEMPTS,

    passwordResetExpiresInMinutes:
      environment.AUTH_PASSWORD_RESET_EXPIRES_IN_MINUTES,
  },

  cors: {
    origin: environment.CORS_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  },

  uploads: {
    directory: environment.UPLOAD_DIR,
  },

  frontend: {
    url: environment.FRONTEND_URL,
  },
} as const;

// ======================================================
// 4. CONFIGURATION TYPE
// ======================================================

export type ApplicationConfiguration = typeof configuration;

// ======================================================
// 5. CONFIGURATION HELPERS
// ======================================================

export function getConfiguration(): ApplicationConfiguration {
  return configuration;
}

export function getApiPrefix(): string {
  return configuration.app.apiPrefix;
}

export function getPort(): number {
  return configuration.app.port;
}

export function getDatabaseUrl(): string {
  return configuration.database.url;
}

export function getAccessTokenSecret(): string {
  return configuration.jwt.accessSecret;
}

export function getRefreshTokenSecret(): string {
  return configuration.jwt.refreshSecret;
}

export function getEmailTokenSecret(): string {
  return configuration.jwt.emailSecret;
}

export function getFrontendUrl(): string {
  return configuration.frontend.url;
}

// ======================================================
// 6. CONFIGURATION SUMMARY
// ======================================================

/**
 * This function intentionally excludes:
 * - DATABASE_URL
 * - JWT secrets
 * - Passwords
 *
 * It is safe to use in startup logs.
 */

export function getSafeConfigurationSummary() {
  return {
    application: configuration.app.name,

    environment: configuration.app.environment,

    port: configuration.app.port,

    apiPrefix: configuration.app.apiPrefix,

    databaseConfigured: Boolean(configuration.database.url),

    jwtConfigured: Boolean(
      configuration.jwt.accessSecret && configuration.jwt.refreshSecret,
    ),

    emailVerificationRequired: configuration.auth.requireEmailVerification,

    publicRegistrationEnabled: configuration.auth.allowPublicRegistration,

    uploadDirectory: configuration.uploads.directory,
  };
}

// ======================================================
// 7. DEFAULT EXPORT
// ======================================================

export default configuration;
