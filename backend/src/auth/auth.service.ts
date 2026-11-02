/**
 * Injibara Campus Lost & Found
 *
 * Authentication Service
 *
 * Express 5 + Prisma 7 + Argon2 + JWT.
 */

import { randomBytes, createHash } from "node:crypto";

import argon2 from "argon2";

import jwt from "jsonwebtoken";

import type { PrismaClient } from "../../generated/prisma/client.js";

import { configuration } from "../config/configuration.js";

import { generateAccessToken } from "./strategies/jwt.strategy.js";

import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "../common/filters/http-exception.filter.js";

import type { RegisterDto } from "./dto/register.dto.js";

import type { LoginDto } from "./dto/login.dto.js";

// ======================================================
// 1. AUTHENTICATED USER TYPE
// ======================================================

export interface AuthUser {
  id: string;

  fullName: string;

  email: string;

  role: "STUDENT" | "STAFF" | "SECURITY" | "ADMIN";

  studentId: string | null;

  department: string | null;

  phone: string | null;

  avatarUrl: string | null;

  isActive: boolean;

  emailVerifiedAt?: Date | null;
}

// ======================================================
// 2. TOKEN RESPONSE
// ======================================================

export interface AuthTokens {
  accessToken: string;

  refreshToken: string;

  tokenType: "Bearer";

  expiresIn: number;

  refreshExpiresAt: string;
}

// ======================================================
// 3. AUTHENTICATION RESPONSE
// ======================================================

export interface AuthResponse {
  success: true;

  message: string;

  user: AuthUser;

  tokens?: AuthTokens;
}

// ======================================================
// 4. MAILER INTERFACE
// ======================================================

export interface AuthMailer {
  sendVerificationEmail(input: {
    email: string;
    fullName: string;
    verificationUrl: string;
  }): Promise<void>;

  sendPasswordResetEmail(input: {
    email: string;
    fullName: string;
    resetUrl: string;
  }): Promise<void>;
}

// ======================================================
// 5. AUTH SERVICE OPTIONS
// ======================================================

export interface AuthServiceOptions {
  prisma: PrismaClient;

  mailer: AuthMailer;
}

// ======================================================
// 6. INTERNAL USER SELECTION
// ======================================================

const publicUserSelection = {
  id: true,

  fullName: true,

  email: true,

  role: true,

  studentId: true,

  department: true,

  phone: true,

  avatarUrl: true,

  isActive: true,

  emailVerifiedAt: true,
} as const;

// ======================================================
// 7. TOKEN HASHING
// ======================================================

/**
 * SHA-256 is suitable here because refresh and
 * one-time recovery tokens are generated randomly
 * with high entropy.
 *
 * Passwords must use Argon2 instead.
 */

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// ======================================================
// 8. RANDOM TOKEN GENERATION
// ======================================================

function generateOpaqueToken(): string {
  return randomBytes(48).toString("base64url");
}

// ======================================================
// 9. REFRESH EXPIRATION
// ======================================================

function getRefreshExpiration(): Date {
  const days = configuration.jwt.refreshExpiresInDays;

  const expiration = new Date();

  expiration.setDate(expiration.getDate() + days);

  return expiration;
}

// ======================================================
// 10. PUBLIC USER CONVERSION
// ======================================================

function toPublicUser(user: {
  id: string;
  fullName: string;
  email: string;
  role: string;
  studentId: string | null;
  department: string | null;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  emailVerifiedAt?: Date | null;
}): AuthUser {
  return {
    id: user.id,

    fullName: user.fullName,

    email: user.email,

    role: user.role as AuthUser["role"],

    studentId: user.studentId,

    department: user.department,

    phone: user.phone,

    avatarUrl: user.avatarUrl,

    isActive: user.isActive,

    ...(user.emailVerifiedAt !== undefined
      ? {
          emailVerifiedAt: user.emailVerifiedAt,
        }
      : {}),
  };
}

// ======================================================
// 11. AUTHENTICATION SERVICE
// ======================================================

export class AuthService {
  private readonly prisma: PrismaClient;

  private readonly mailer: AuthMailer;

  constructor(options: AuthServiceOptions) {
    this.prisma = options.prisma;

    this.mailer = options.mailer;
  }

  // ====================================================
  // 12. HASH PASSWORD
  // ====================================================

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,

      memoryCost: 19456,

      timeCost: 2,

      parallelism: 1,
    });
  }

  // ====================================================
  // 13. VERIFY PASSWORD
  // ====================================================

  private async verifyPassword(
    passwordHash: string,
    password: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }

  // ====================================================
  // 14. GENERATE REFRESH TOKEN
  // ====================================================

  private async createRefreshToken(userId: string): Promise<{
    rawToken: string;
    expiresAt: Date;
  }> {
    const rawToken = generateOpaqueToken();

    const expiresAt = getRefreshExpiration();

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(rawToken),

        expiresAt,

        userId,
      },
    });

    return {
      rawToken,
      expiresAt,
    };
  }

  // ====================================================
  // 15. GENERATE AUTH TOKENS
  // ====================================================

  private async createAuthTokens(user: {
    id: string;
    email: string;
    role: AuthUser["role"];
  }): Promise<AuthTokens> {
    const accessToken = generateAccessToken(user);

    const refresh = await this.createRefreshToken(user.id);

    return {
      accessToken,

      refreshToken: refresh.rawToken,

      tokenType: "Bearer",

      expiresIn: 15 * 60,

      refreshExpiresAt: refresh.expiresAt.toISOString(),
    };
  }

  // ====================================================
  // 16. CREATE EMAIL VERIFICATION TOKEN
  // ====================================================

  private createEmailVerificationToken(user: {
    id: string;
    email: string;
  }): string {
    return jwt.sign(
      {
        email: user.email,

        purpose: "email-verification",
      },
      configuration.jwt.emailSecret,
      {
        subject: user.id,

        algorithm: "HS256",

        expiresIn: configuration.jwt.emailExpiresInMinutes * 60,

        issuer: "injibara-lost-found",

        audience: "injibara-email-verification",
      },
    );
  }

  // ====================================================
  // 17. SEND VERIFICATION EMAIL
  // ====================================================

  private async sendVerificationEmail(user: {
    id: string;
    email: string;
    fullName: string;
  }): Promise<void> {
    const token = this.createEmailVerificationToken(user);

    const verificationUrl = new URL(
      "/verify-email",
      configuration.frontend.url,
    );

    verificationUrl.searchParams.set("token", token);

    await this.mailer.sendVerificationEmail({
      email: user.email,

      fullName: user.fullName,

      verificationUrl: verificationUrl.toString(),
    });
  }

  // ====================================================
  // 18. REGISTER
  // ====================================================

  async register(input: RegisterDto): Promise<{
    success: true;
    message: string;
    user: AuthUser;
  }> {
    if (!configuration.auth.allowPublicRegistration) {
      throw new ForbiddenException(
        "Public registration is currently disabled.",
      );
    }

    const email = input.email.trim().toLowerCase();

    // ----------------------------------------------
    // Check duplicate email
    // ----------------------------------------------

    const existingEmail = await this.prisma.user.findUnique({
      where: {
        email,
      },

      select: {
        id: true,
      },
    });

    if (existingEmail) {
      throw new ConflictException("An account with this email already exists.");
    }

    // ----------------------------------------------
    // Check duplicate student ID
    // ----------------------------------------------

    if (input.studentId) {
      const existingStudent = await this.prisma.user.findUnique({
        where: {
          studentId: input.studentId,
        },

        select: {
          id: true,
        },
      });

      if (existingStudent) {
        throw new ConflictException("This student ID is already registered.");
      }
    }

    // ----------------------------------------------
    // Check duplicate phone
    // ----------------------------------------------

    if (input.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: {
          phone: input.phone,
        },

        select: {
          id: true,
        },
      });

      if (existingPhone) {
        throw new ConflictException("This phone number is already registered.");
      }
    }

    // ----------------------------------------------
    // Hash password
    // ----------------------------------------------

    const passwordHash = await this.hashPassword(input.password);

    // ----------------------------------------------
    // Create student account
    // ----------------------------------------------

    const user = await this.prisma.user.create({
      data: {
        fullName: input.fullName.trim(),

        email,

        passwordHash,

        // Public registration always creates
        // a STUDENT account.
        role: "STUDENT",

        studentId: input.studentId ?? null,

        department: input.department ?? null,

        phone: input.phone ?? null,

        isActive: true,
      },

      select: publicUserSelection,
    });

    // ----------------------------------------------
    // Send email verification
    // ----------------------------------------------

    if (configuration.auth.requireEmailVerification) {
      try {
        await this.sendVerificationEmail({
          id: user.id,

          email: user.email,

          fullName: user.fullName,
        });
      } catch (error) {
        // The account has already been created.
        // Do not delete it because mail delivery failed.
        console.error("[AUTH] Verification email delivery failed.", error);
      }
    }

    return {
      success: true,

      message: configuration.auth.requireEmailVerification
        ? "Account created. Check your email for verification instructions."
        : "Account created successfully.",

      user: toPublicUser(user),
    };
  }

  // ====================================================
  // 19. VERIFY EMAIL
  // ====================================================

  async verifyEmail(token: string): Promise<{
    success: true;
    message: string;
  }> {
    let decoded: jwt.JwtPayload;

    try {
      const result = jwt.verify(token, configuration.jwt.emailSecret, {
        algorithms: ["HS256"],

        issuer: "injibara-lost-found",

        audience: "injibara-email-verification",
      });

      if (typeof result === "string") {
        throw new Error("Invalid token.");
      }

      decoded = result;
    } catch {
      throw new BadRequestException(
        "The verification link is invalid or expired.",
      );
    }

    if (
      decoded.purpose !== "email-verification" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.email !== "string"
    ) {
      throw new BadRequestException("Invalid verification token.");
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: decoded.sub,
      },

      select: {
        id: true,

        email: true,

        emailVerifiedAt: true,
      },
    });

    if (!user || user.email !== decoded.email) {
      throw new BadRequestException(
        "The verification account could not be found.",
      );
    }

    if (user.emailVerifiedAt) {
      return {
        success: true,

        message: "Email is already verified.",
      };
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        emailVerifiedAt: new Date(),
      },
    });

    return {
      success: true,

      message: "Your email has been verified successfully.",
    };
  }

  // ====================================================
  // 20. LOGIN
  // ====================================================

  async login(input: LoginDto): Promise<AuthResponse> {
    const email = input.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },

      select: {
        ...publicUserSelection,

        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (!user.isActive) {
      throw new ForbiddenException("Your account has been deactivated.");
    }

    const passwordIsValid = await this.verifyPassword(
      user.passwordHash,
      input.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (configuration.auth.requireEmailVerification && !user.emailVerifiedAt) {
      throw new ForbiddenException(
        "Please verify your email before signing in.",
      );
    }

    const tokens = await this.createAuthTokens({
      id: user.id,

      email: user.email,

      role: user.role,
    });

    return {
      success: true,

      message: "Login successful.",

      user: toPublicUser(user),

      tokens,
    };
  }

  // ====================================================
  // 21. REFRESH ACCESS TOKEN
  // ====================================================

  async refreshTokens(refreshToken: string): Promise<{
    success: true;
    tokens: AuthTokens;
  }> {
    if (!refreshToken || refreshToken.length < 40) {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    const tokenHash = hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },

      include: {
        user: true,
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException("Refresh token is invalid.");
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException(
        "Refresh token has already been revoked.",
      );
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      await this.prisma.refreshToken.updateMany({
        where: {
          id: storedToken.id,

          revokedAt: null,
        },

        data: {
          revokedAt: new Date(),
        },
      });

      throw new UnauthorizedException("Refresh token has expired.");
    }

    if (!storedToken.user.isActive) {
      throw new ForbiddenException("This account is inactive.");
    }

    if (
      configuration.auth.requireEmailVerification &&
      !storedToken.user.emailVerifiedAt
    ) {
      throw new ForbiddenException("Email verification is required.");
    }

    // ----------------------------------------------
    // Atomic refresh token rotation
    // ----------------------------------------------

    const now = new Date();

    const rawNewRefreshToken = generateOpaqueToken();

    const newRefreshExpiresAt = getRefreshExpiration();

    const newAccessToken = generateAccessToken({
      id: storedToken.user.id,

      email: storedToken.user.email,

      role: storedToken.user.role,
    });

    const newRefreshHash = hashToken(rawNewRefreshToken);

    await this.prisma.$transaction(async (transaction) => {
      const revoked = await transaction.refreshToken.updateMany({
        where: {
          id: storedToken.id,

          revokedAt: null,

          expiresAt: {
            gt: now,
          },
        },

        data: {
          revokedAt: now,
        },
      });

      if (revoked.count !== 1) {
        throw new UnauthorizedException("Refresh token has already been used.");
      }

      await transaction.refreshToken.create({
        data: {
          tokenHash: newRefreshHash,

          expiresAt: newRefreshExpiresAt,

          userId: storedToken.user.id,
        },
      });
    });

    return {
      success: true,

      tokens: {
        accessToken: newAccessToken,

        refreshToken: rawNewRefreshToken,

        tokenType: "Bearer",

        expiresIn: 15 * 60,

        refreshExpiresAt: newRefreshExpiresAt.toISOString(),
      },
    };
  }

  // ====================================================
  // 22. LOGOUT
  // ====================================================

  async logout(refreshToken: string): Promise<{
    success: true;
    message: string;
  }> {
    if (!refreshToken || refreshToken.length < 40) {
      return {
        success: true,

        message: "Logged out successfully.",
      };
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashToken(refreshToken),

        revokedAt: null,
      },

      data: {
        revokedAt: new Date(),
      },
    });

    return {
      success: true,

      message: "Logged out successfully.",
    };
  }

  // ====================================================
  // 23. LOGOUT ALL DEVICES
  // ====================================================

  async logoutAll(userId: string): Promise<{
    success: true;
    message: string;
  }> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,

        revokedAt: null,
      },

      data: {
        revokedAt: new Date(),
      },
    });

    return {
      success: true,

      message: "All active sessions have been revoked.",
    };
  }

  // ====================================================
  // 24. FORGOT PASSWORD
  // ====================================================

  async forgotPassword(emailInput: string): Promise<{
    success: true;
    message: string;
  }> {
    const email = emailInput.trim().toLowerCase();

    const genericMessage =
      "If an account exists with that email, password recovery instructions will be sent.";

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },

      select: {
        id: true,

        email: true,

        fullName: true,

        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return {
        success: true,

        message: genericMessage,
      };
    }

    const rawToken = generateOpaqueToken();

    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(
      Date.now() + configuration.auth.passwordResetExpiresInMinutes * 60 * 1000,
    );

    // ----------------------------------------------
    // Invalidate previous reset tokens
    // ----------------------------------------------

    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,

        usedAt: null,
      },

      data: {
        usedAt: new Date(),
      },
    });

    // ----------------------------------------------
    // Save new token hash
    // ----------------------------------------------

    await this.prisma.passwordResetToken.create({
      data: {
        tokenHash,

        expiresAt,

        userId: user.id,
      },
    });

    // ----------------------------------------------
    // Send recovery email
    // ----------------------------------------------

    const resetUrl = new URL("/reset-password", configuration.frontend.url);

    resetUrl.searchParams.set("token", rawToken);

    try {
      await this.mailer.sendPasswordResetEmail({
        email: user.email,

        fullName: user.fullName,

        resetUrl: resetUrl.toString(),
      });
    } catch (error) {
      // Revoke the unusable token if delivery failed.
      await this.prisma.passwordResetToken.updateMany({
        where: {
          tokenHash,

          usedAt: null,
        },

        data: {
          usedAt: new Date(),
        },
      });

      console.error("[AUTH] Password reset email delivery failed.", error);

      // Keep a generic response to avoid exposing
      // whether an account exists.
    }

    return {
      success: true,

      message: genericMessage,
    };
  }

  // ====================================================
  // 25. RESET PASSWORD
  // ====================================================

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{
    success: true;
    message: string;
  }> {
    const tokenHash = hashToken(token);

    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: {
        tokenHash,
      },

      include: {
        user: true,
      },
    });

    if (!resetRecord) {
      throw new BadRequestException(
        "The password reset link is invalid or expired.",
      );
    }

    if (resetRecord.usedAt) {
      throw new BadRequestException(
        "This password reset link has already been used.",
      );
    }

    if (resetRecord.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException("The password reset link has expired.");
    }

    if (!resetRecord.user.isActive) {
      throw new ForbiddenException("This account is inactive.");
    }

    const passwordHash = await this.hashPassword(newPassword);

    const now = new Date();

    await this.prisma.$transaction(async (transaction) => {
      const consumed = await transaction.passwordResetToken.updateMany({
        where: {
          id: resetRecord.id,

          usedAt: null,

          expiresAt: {
            gt: now,
          },
        },

        data: {
          usedAt: now,
        },
      });

      if (consumed.count !== 1) {
        throw new BadRequestException(
          "This reset link has already been used or expired.",
        );
      }

      await transaction.user.update({
        where: {
          id: resetRecord.userId,
        },

        data: {
          passwordHash,
        },
      });

      // Changing the password revokes all sessions.
      await transaction.refreshToken.updateMany({
        where: {
          userId: resetRecord.userId,

          revokedAt: null,
        },

        data: {
          revokedAt: now,
        },
      });

      // Invalidate other outstanding reset tokens.
      await transaction.passwordResetToken.updateMany({
        where: {
          userId: resetRecord.userId,

          usedAt: null,
        },

        data: {
          usedAt: now,
        },
      });
    });

    return {
      success: true,

      message: "Password has been reset. Please sign in again.",
    };
  }

  // ====================================================
  // 26. CHANGE PASSWORD
  // ====================================================

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{
    success: true;
    message: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,

        passwordHash: true,

        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException("User account not found.");
    }

    const currentIsValid = await this.verifyPassword(
      user.passwordHash,
      currentPassword,
    );

    if (!currentIsValid) {
      throw new UnauthorizedException("Current password is incorrect.");
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        "New password must be different from your current password.",
      );
    }

    const newHash = await this.hashPassword(newPassword);

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          passwordHash: newHash,
        },
      }),

      this.prisma.refreshToken.updateMany({
        where: {
          userId,

          revokedAt: null,
        },

        data: {
          revokedAt: now,
        },
      }),
    ]);

    return {
      success: true,

      message: "Password changed successfully. Please sign in again.",
    };
  }

  // ====================================================
  // 27. GET CURRENT USER
  // ====================================================

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,

        isActive: true,
      },

      select: publicUserSelection,
    });

    if (!user) {
      throw new NotFoundException("User account not found.");
    }

    return toPublicUser(user);
  }

  // ====================================================
  // 28. REVOKE EXPIRED REFRESH TOKENS
  // ====================================================

  async revokeExpiredRefreshTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },

        revokedAt: null,
      },

      data: {
        revokedAt: new Date(),
      },
    });

    return result.count;
  }

  // ====================================================
  // 29. REVOKE EXPIRED PASSWORD RESET TOKENS
  // ====================================================

  async revokeExpiredPasswordResetTokens(): Promise<number> {
    const result = await this.prisma.passwordResetToken.updateMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },

        usedAt: null,
      },

      data: {
        usedAt: new Date(),
      },
    });

    return result.count;
  }
}

// ======================================================
// 30. DEFAULT EXPORT
// ======================================================

export default AuthService;
