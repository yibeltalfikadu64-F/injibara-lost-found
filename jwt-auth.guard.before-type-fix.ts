/**
 * Injibara Campus Lost & Found
 *
 * JWT Authentication Guard
 *
 * Express 5 middleware implementation.
 *
 * Responsibilities:
 * - Read bearer access tokens.
 * - Verify JWT signatures.
 * - Validate token claims.
 * - Load the current user.
 * - Reject inactive accounts.
 * - Attach authenticated user to Express request.
 *
 * IMPORTANT:
 * Refresh tokens must never be accepted as access tokens.
 */

import jwt, {
  type JwtPayload,
  type Secret,
  type VerifyOptions,
} from "jsonwebtoken";

import type { Request, Response, NextFunction, RequestHandler } from "express";

import type {
  AuthenticatedUser,
  AuthTokenPayload,
  UserRole,
} from "../decorators/current-user.decorator.js";

// ======================================================
// 1. CONFIGURATION TYPES
// ======================================================

export interface JwtAuthConfig {
  secret?: Secret;

  issuer?: string;

  audience?: string;

  algorithms?: jwt.Algorithm[];

  clockTolerance?: number;

  tokenType?: string;
}

export interface UserResolver {
  findActiveUserById(userId: string): Promise<AuthenticatedUser | null>;
}

export interface JwtAuthOptions {
  config?: JwtAuthConfig;

  resolver: UserResolver;

  optional?: boolean;

  allowInactive?: boolean;
}

// ======================================================
// 2. AUTHENTICATION ERROR
// ======================================================

export class AuthenticationError extends Error {
  public readonly statusCode = 401;

  public readonly code: string;

  constructor(message: string, code = "AUTHENTICATION_FAILED") {
    super(message);

    this.name = "AuthenticationError";

    this.code = code;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ======================================================
// 3. TOKEN EXTRACTION
// ======================================================

/**
 * Extracts a Bearer token from Authorization.
 *
 * Expected:
 * Authorization: Bearer eyJ...
 */

export function extractBearerToken(request: Request): string | null {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return null;
  }

  const parts = authorization.trim().split(/\s+/);

  if (parts.length !== 2) {
    return null;
  }

  const [scheme, token] = parts;

  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

// ======================================================
// 4. TOKEN CLAIM VALIDATION
// ======================================================

function isValidUserRole(value: unknown): value is UserRole {
  return (
    value === "STUDENT" ||
    value === "STAFF" ||
    value === "SECURITY" ||
    value === "ADMIN"
  );
}

function isValidJwtPayload(
  payload: string | JwtPayload,
): payload is JwtPayload {
  if (typeof payload === "string") {
    return false;
  }

  return (
    typeof payload.sub === "string" &&
    payload.sub.length > 0 &&
    typeof payload.email === "string" &&
    isValidUserRole(payload.role)
  );
}

// ======================================================
// 5. VERIFY JWT
// ======================================================

function verifyAccessToken(
  token: string,
  config: JwtAuthConfig,
): AuthTokenPayload {
  const secret = config.secret ?? process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured.");
  }

  if (typeof secret === "string" && secret.length < 32) {
    throw new Error("JWT access secret must contain at least 32 characters.");
  }

  const verifyOptions: VerifyOptions = {
    algorithms: config.algorithms ?? ["HS256"],

    ...(config.issuer ? { issuer: config.issuer } : {}),

    ...(config.audience ? { audience: config.audience } : {}),

    clockTolerance: config.clockTolerance ?? 5,
  };

  const decoded = jwt.verify(token, secret, verifyOptions);

  if (!isValidJwtPayload(decoded)) {
    throw new AuthenticationError(
      "Access token contains invalid claims.",
      "INVALID_TOKEN_CLAIMS",
    );
  }

  // If your token issuer includes a token type,
  // require it to match the access token type.
  if (config.tokenType && decoded.tokenType !== config.tokenType) {
    throw new AuthenticationError(
      "This token cannot be used for API access.",
      "INVALID_TOKEN_TYPE",
    );
  }

  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role as UserRole,
    ...(typeof decoded.iat === "number" ? { iat: decoded.iat } : {}),
    ...(typeof decoded.exp === "number" ? { exp: decoded.exp } : {}),
    ...(typeof decoded.jti === "string" ? { jti: decoded.jti } : {}),
  };
}

// ======================================================
// 6. JWT ERROR CONVERSION
// ======================================================

function convertJwtError(error: unknown): AuthenticationError {
  if (error instanceof AuthenticationError) {
    return error;
  }

  if (error instanceof jwt.TokenExpiredError) {
    return new AuthenticationError(
      "Your access token has expired. Please sign in again.",
      "TOKEN_EXPIRED",
    );
  }

  if (error instanceof jwt.NotBeforeError) {
    return new AuthenticationError(
      "Your access token is not active yet.",
      "TOKEN_NOT_ACTIVE",
    );
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return new AuthenticationError(
      "Your access token is invalid.",
      "INVALID_TOKEN",
    );
  }

  return new AuthenticationError(
    "Authentication failed.",
    "AUTHENTICATION_FAILED",
  );
}

// ======================================================
// 7. ATTACH USER TO REQUEST
// ======================================================

function attachAuthenticatedUser(
  request: Request,
  user: AuthenticatedUser,
  tokenPayload: AuthTokenPayload,
): void {
  request.user = user;

  request.authToken = tokenPayload;
}

// ======================================================
// 8. CREATE JWT AUTH MIDDLEWARE
// ======================================================

export function createJwtAuthGuard(options: JwtAuthOptions): RequestHandler {
  const {
    resolver,
    optional = false,
    allowInactive = false,
    config = {},
  } = options;

  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const token = extractBearerToken(request);

      // --------------------------------------------
      // Missing token
      // --------------------------------------------

      if (!token) {
        if (optional) {
          next();
          return;
        }

        throw new AuthenticationError(
          "Please sign in to access this resource.",
          "MISSING_ACCESS_TOKEN",
        );
      }

      // --------------------------------------------
      // Verify signature and expiration
      // --------------------------------------------

      let payload: AuthTokenPayload;

      try {
        payload = verifyAccessToken(token, config);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("JWT_ACCESS_SECRET is not configured")
        ) {
          throw error;
        }

        if (
          error instanceof Error &&
          error.message.includes("JWT access secret must contain")
        ) {
          throw error;
        }

        throw convertJwtError(error);
      }

      // --------------------------------------------
      // Load user from database
      // --------------------------------------------

      const user = await resolver.findActiveUserById(payload.sub);

      if (!user) {
        throw new AuthenticationError(
          "Your account could not be found.",
          "USER_NOT_FOUND",
        );
      }

      // --------------------------------------------
      // Validate account status
      // --------------------------------------------

      if (!allowInactive && !user.isActive) {
        throw new AuthenticationError(
          "Your account has been deactivated.",
          "ACCOUNT_INACTIVE",
        );
      }

      // --------------------------------------------
      // Validate current role
      // --------------------------------------------

      if (user.role !== payload.role) {
        throw new AuthenticationError(
          "Your account permissions have changed. Please sign in again.",
          "ROLE_CHANGED",
        );
      }

      // --------------------------------------------
      // Attach current user
      // --------------------------------------------

      attachAuthenticatedUser(request, user, payload);

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ======================================================
// 9. REQUIRED AUTHENTICATION
// ======================================================

export function createRequiredJwtGuard(
  resolver: UserResolver,
  config: JwtAuthConfig = {},
): RequestHandler {
  return createJwtAuthGuard({
    resolver,
    config,
    optional: false,
  });
}

// ======================================================
// 10. OPTIONAL AUTHENTICATION
// ======================================================

export function createOptionalJwtGuard(
  resolver: UserResolver,
  config: JwtAuthConfig = {},
): RequestHandler {
  return createJwtAuthGuard({
    resolver,
    config,
    optional: true,
  });
}

// ======================================================
// 11. AUTHENTICATION CHECK
// ======================================================

export function isRequestAuthenticated(request: Request): boolean {
  return Boolean(request.user && request.user.id && request.user.isActive);
}

// ======================================================
// 12. CURRENT USER ID
// ======================================================

export function getAuthenticatedUserId(request: Request): string {
  if (!request.user) {
    throw new AuthenticationError("Authentication is required.");
  }

  return request.user.id;
}

// ======================================================
// 13. CURRENT USER ROLE
// ======================================================

export function getAuthenticatedUserRole(request: Request): UserRole {
  if (!request.user) {
    throw new AuthenticationError("Authentication is required.");
  }

  return request.user.role;
}

// ======================================================
// 14. DEFAULT EXPORT
// ======================================================

export default createJwtAuthGuard;
