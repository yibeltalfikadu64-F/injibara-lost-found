/**
 * Injibara Campus Lost & Found
 *
 * Authentication Controller
 *
 * Express 5 controller.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

import { z } from "zod";

import { AuthService } from "./auth.service.js";

import { getValidatedBody } from "../common/pipes/validation.pipe.js";

import type { RegisterDto } from "./dto/register.dto.js";

import type { LoginDto } from "./dto/login.dto.js";

import type { VerifyEmailDto } from "./dto/verify-email.dto.js";

import type { ForgotPasswordDto } from "./dto/forgot-password.dto.js";

import type { ResetPasswordDto } from "./dto/reset-password.dto.js";

// ======================================================
// 1. REQUEST DTO SCHEMAS
// ======================================================

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(40).max(500),
});

export const logoutRequestSchema = z.object({
  refreshToken: z.string().min(40).max(500),
});

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1).max(128),

  newPassword: z
    .string()
    .min(12)
    .max(128)
    .refine(
      (value) => /[a-z]/.test(value),
      "Password must contain a lowercase letter.",
    )
    .refine(
      (value) => /[A-Z]/.test(value),
      "Password must contain an uppercase letter.",
    )
    .refine((value) => /\d/.test(value), "Password must contain a number."),
});

// ======================================================
// 2. ASYNC HANDLER
// ======================================================

function asyncHandler(
  handler: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<unknown>,
): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

// ======================================================
// 3. AUTH CONTROLLER
// ======================================================

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ====================================================
  // 4. REGISTER
  // ====================================================

  register: RequestHandler = asyncHandler(async (request, response) => {
    const input = getValidatedBody<RegisterDto>(request);

    const result = await this.authService.register(input);

    response.status(201).json(result);
  });

  // ====================================================
  // 5. LOGIN
  // ====================================================

  login: RequestHandler = asyncHandler(async (request, response) => {
    const input = getValidatedBody<LoginDto>(request);

    const result = await this.authService.login(input);

    response.status(200).json(result);
  });

  // ====================================================
  // 6. REFRESH TOKEN
  // ====================================================

  refresh: RequestHandler = asyncHandler(async (request, response) => {
    const input = getValidatedBody<{
      refreshToken: string;
    }>(request);

    const result = await this.authService.refreshTokens(input.refreshToken);

    response.status(200).json(result);
  });

  // ====================================================
  // 7. LOGOUT
  // ====================================================

  logout: RequestHandler = asyncHandler(async (request, response) => {
    const input = getValidatedBody<{
      refreshToken: string;
    }>(request);

    const result = await this.authService.logout(input.refreshToken);

    response.status(200).json(result);
  });

  // ====================================================
  // 8. LOGOUT ALL DEVICES
  // ====================================================

  logoutAll: RequestHandler = asyncHandler(async (request, response) => {
    if (!request.user) {
      response.status(401).json({
        success: false,
        message: "Authentication is required.",
      });

      return;
    }

    const result = await this.authService.logoutAll(request.user.id);

    response.status(200).json(result);
  });

  // ====================================================
  // 9. VERIFY EMAIL
  // ====================================================

  verifyEmail: RequestHandler = asyncHandler(async (request, response) => {
    const input = getValidatedBody<VerifyEmailDto>(request);

    const result = await this.authService.verifyEmail(input.token);

    response.status(200).json(result);
  });

  // ====================================================
  // 10. FORGOT PASSWORD
  // ====================================================

  forgotPassword: RequestHandler = asyncHandler(async (request, response) => {
    const input = getValidatedBody<ForgotPasswordDto>(request);

    const result = await this.authService.forgotPassword(input.email);

    response.status(200).json(result);
  });

  // ====================================================
  // 11. RESET PASSWORD
  // ====================================================

  resetPassword: RequestHandler = asyncHandler(async (request, response) => {
    const input = getValidatedBody<ResetPasswordDto>(request);

    const result = await this.authService.resetPassword(
      input.token,
      input.newPassword,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 12. CHANGE PASSWORD
  // ====================================================

  changePassword: RequestHandler = asyncHandler(async (request, response) => {
    if (!request.user) {
      response.status(401).json({
        success: false,
        message: "Authentication is required.",
      });

      return;
    }

    const input = getValidatedBody<{
      currentPassword: string;
      newPassword: string;
    }>(request);

    const result = await this.authService.changePassword(
      request.user.id,
      input.currentPassword,
      input.newPassword,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 13. CURRENT USER PROFILE
  // ====================================================

  me: RequestHandler = asyncHandler(async (request, response) => {
    if (!request.user) {
      response.status(401).json({
        success: false,
        message: "Authentication is required.",
      });

      return;
    }

    const user = await this.authService.getProfile(request.user.id);

    response.status(200).json({
      success: true,

      user,
    });
  });
}

// ======================================================
// 14. DEFAULT EXPORT
// ======================================================

export default AuthController;
