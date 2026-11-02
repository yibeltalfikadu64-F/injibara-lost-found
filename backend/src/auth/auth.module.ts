/**
 * Injibara Campus Lost & Found
 *
 * Authentication Module
 *
 * Express module composition.
 *
 * This is NOT a NestJS @Module().
 */

import { Router } from "express";

import { rateLimit } from "express-rate-limit";

import type { PrismaClient } from "../../generated/prisma/client.js";

import { AuthService, type AuthMailer } from "./auth.service.js";

import {
  AuthController,
  refreshTokenRequestSchema,
  logoutRequestSchema,
  changePasswordRequestSchema,
} from "./auth.controller.js";

import { registerDtoSchema } from "./dto/register.dto.js";

import { loginDtoSchema } from "./dto/login.dto.js";

import { verifyEmailDtoSchema } from "./dto/verify-email.dto.js";

import { forgotPasswordDtoSchema } from "./dto/forgot-password.dto.js";

import { resetPasswordDtoSchema } from "./dto/reset-password.dto.js";

import { validateBody } from "../common/pipes/validation.pipe.js";

import { createRequiredJwtGuard } from "../common/guards/jwt-auth.guard.js";

import { createPrismaUserResolver } from "./strategies/jwt.strategy.js";

import { configuration } from "../config/configuration.js";

// ======================================================
// 1. MODULE OPTIONS
// ======================================================

export interface AuthModuleOptions {
  prisma: PrismaClient;

  mailer: AuthMailer;
}

// ======================================================
// 2. AUTH ROUTER
// ======================================================

export function createAuthModule(options: AuthModuleOptions): Router {
  const router = Router();

  const { prisma, mailer } = options;

  // ====================================================
  // 3. CREATE SERVICE
  // ====================================================

  const authService = new AuthService({
    prisma,
    mailer,
  });

  // ====================================================
  // 4. CREATE CONTROLLER
  // ====================================================

  const controller = new AuthController(authService);

  // ====================================================
  // 5. CREATE JWT AUTHENTICATION
  // ====================================================

  const userResolver = createPrismaUserResolver(prisma);

  const authenticate = createRequiredJwtGuard(userResolver, {
    secret: configuration.jwt.accessSecret,

    algorithms: ["HS256"],

    issuer: "injibara-lost-found",

    audience: "injibara-lost-found-mobile",

    tokenType: "access",

    clockTolerance: 5,
  });

  // ====================================================
  // 6. LOGIN RATE LIMITER
  // ====================================================

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: configuration.auth.maxLoginAttempts,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
      success: false,

      code: "LOGIN_RATE_LIMITED",

      message: "Too many login attempts. Please try again later.",
    },

    skipSuccessfulRequests: true,
  });

  // ====================================================
  // 7. REGISTRATION RATE LIMITER
  // ====================================================

  const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,

    limit: 10,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
      success: false,

      code: "REGISTRATION_RATE_LIMITED",

      message: "Too many registration attempts. Please try again later.",
    },
  });

  // ====================================================
  // 8. RECOVERY RATE LIMITER
  // ====================================================

  const recoveryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 5,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
      success: false,

      code: "RECOVERY_RATE_LIMITED",

      message: "Too many recovery requests. Please try again later.",
    },
  });

  // ====================================================
  // 9. REGISTRATION ROUTE
  // ====================================================

  router.post(
    "/register",

    registrationLimiter,

    validateBody(registerDtoSchema),

    controller.register,
  );

  // ====================================================
  // 10. LOGIN ROUTE
  // ====================================================

  router.post(
    "/login",

    loginLimiter,

    validateBody(loginDtoSchema),

    controller.login,
  );

  // ====================================================
  // 11. REFRESH TOKEN ROUTE
  // ====================================================

  router.post(
    "/refresh",

    validateBody(refreshTokenRequestSchema),

    controller.refresh,
  );

  // ====================================================
  // 12. LOGOUT ROUTE
  // ====================================================

  router.post(
    "/logout",

    validateBody(logoutRequestSchema),

    controller.logout,
  );

  // ====================================================
  // 13. LOGOUT ALL DEVICES ROUTE
  // ====================================================

  router.post(
    "/logout-all",

    authenticate,

    controller.logoutAll,
  );

  // ====================================================
  // 14. EMAIL VERIFICATION ROUTE
  // ====================================================

  router.post(
    "/verify-email",

    recoveryLimiter,

    validateBody(verifyEmailDtoSchema),

    controller.verifyEmail,
  );

  // ====================================================
  // 15. FORGOT PASSWORD ROUTE
  // ====================================================

  router.post(
    "/forgot-password",

    recoveryLimiter,

    validateBody(forgotPasswordDtoSchema),

    controller.forgotPassword,
  );

  // ====================================================
  // 16. RESET PASSWORD ROUTE
  // ====================================================

  router.post(
    "/reset-password",

    recoveryLimiter,

    validateBody(resetPasswordDtoSchema),

    controller.resetPassword,
  );

  // ====================================================
  // 17. CHANGE PASSWORD ROUTE
  // ====================================================

  router.post(
    "/change-password",

    authenticate,

    validateBody(changePasswordRequestSchema),

    controller.changePassword,
  );

  // ====================================================
  // 18. CURRENT USER ROUTE
  // ====================================================

  router.get(
    "/me",

    authenticate,

    controller.me,
  );

  // ====================================================
  // 19. MODULE INFORMATION
  // ====================================================

  console.info("[AUTH MODULE] Authentication routes registered.");

  return router;
}

// ======================================================
// 20. DEFAULT EXPORT
// ======================================================

export default createAuthModule;
