/**
 * Injibara Campus Lost & Found
 *
 * Current User Helper
 *
 * This module provides strongly typed access to the
 * authenticated user attached to an Express request.
 *
 * IMPORTANT:
 * This is an Express-compatible helper, not a NestJS
 * parameter decorator.
 */

// ======================================================
// 1. IMPORTS
// ======================================================

import type { Request, RequestHandler } from "express";

// ======================================================
// 2. USER ROLE TYPE
// ======================================================

export type UserRole = "STUDENT" | "STAFF" | "SECURITY" | "ADMIN";

// ======================================================
// 3. AUTHENTICATED USER INTERFACE
// ======================================================

export interface AuthenticatedUser {
  id: string;

  email: string;

  fullName: string;

  role: UserRole;

  studentId?: string | null;

  department?: string | null;

  phone?: string | null;

  avatarUrl?: string | null;

  isActive: boolean;
}

// ======================================================
// 4. AUTHENTICATION TOKEN PAYLOAD
// ======================================================

export interface AuthTokenPayload {
  sub: string;

  email: string;

  role: UserRole;

  iat?: number;

  exp?: number;

  jti?: string;
}

// ======================================================
// 5. EXPRESS REQUEST EXTENSION
// ======================================================

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;

      authToken?: AuthTokenPayload;

      requestId?: string;
    }
  }
}

// ======================================================
// 6. AUTHENTICATION ERROR
// ======================================================

export class UnauthenticatedError extends Error {
  public readonly statusCode = 401;

  public readonly code = "UNAUTHENTICATED";

  constructor(message = "Authentication is required.") {
    super(message);

    this.name = "UnauthenticatedError";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ======================================================
// 7. USER NOT FOUND ERROR
// ======================================================

export class CurrentUserNotFoundError extends Error {
  public readonly statusCode = 401;

  public readonly code = "CURRENT_USER_NOT_FOUND";

  constructor(message = "Authenticated user could not be found.") {
    super(message);

    this.name = "CurrentUserNotFoundError";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ======================================================
// 8. GET CURRENT USER
// ======================================================

/**
 * Retrieves the authenticated user from an Express request.
 *
 * The authentication middleware must attach req.user
 * before this helper is called.
 */

export function getCurrentUser(request: Request): AuthenticatedUser {
  const user = request.user;

  if (!user) {
    throw new UnauthenticatedError();
  }

  return user;
}

// ======================================================
// 9. GET CURRENT USER ID
// ======================================================

export function getCurrentUserId(request: Request): string {
  const user = getCurrentUser(request);

  return user.id;
}

// ======================================================
// 10. GET CURRENT USER EMAIL
// ======================================================

export function getCurrentUserEmail(request: Request): string {
  const user = getCurrentUser(request);

  return user.email;
}

// ======================================================
// 11. GET CURRENT USER ROLE
// ======================================================

export function getCurrentUserRole(request: Request): UserRole {
  const user = getCurrentUser(request);

  return user.role;
}

// ======================================================
// 12. CHECK AUTHENTICATION
// ======================================================

export function isAuthenticated(request: Request): boolean {
  return Boolean(request.user && request.user.id && request.user.isActive);
}

// ======================================================
// 13. CHECK CURRENT USER ROLE
// ======================================================

export function hasRole(request: Request, role: UserRole): boolean {
  const user = request.user;

  if (!user || !user.isActive) {
    return false;
  }

  return user.role === role;
}

// ======================================================
// 14. CHECK MULTIPLE ROLES
// ======================================================

export function hasAnyRole(
  request: Request,
  roles: readonly UserRole[],
): boolean {
  const user = request.user;

  if (!user || !user.isActive) {
    return false;
  }

  return roles.includes(user.role);
}

// ======================================================
// 15. AUTHENTICATED REQUEST TYPE
// ======================================================

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

// ======================================================
// 16. ASSERT AUTHENTICATED REQUEST
// ======================================================

export function assertAuthenticated(
  request: Request,
): asserts request is AuthenticatedRequest {
  if (!request.user) {
    throw new UnauthenticatedError();
  }

  if (!request.user.isActive) {
    throw new UnauthenticatedError("Your account is inactive.");
  }
}

// ======================================================
// 17. CURRENT USER MIDDLEWARE
// ======================================================

/**
 * Ensures that an authentication middleware has already
 * attached an active user to the request.
 *
 * This does not verify JWT tokens itself.
 */

export const requireAuthenticatedUser: RequestHandler = (
  request,
  _response,
  next,
) => {
  try {
    assertAuthenticated(request);

    next();
  } catch (error) {
    next(error);
  }
};

// ======================================================
// 18. GET OPTIONAL CURRENT USER
// ======================================================

/**
 * Returns null when the request is unauthenticated.
 *
 * Useful for public endpoints that support optional login.
 */

export function getOptionalCurrentUser(
  request: Request,
): AuthenticatedUser | null {
  return request.user ?? null;
}

// ======================================================
// 19. CHECK RESOURCE OWNERSHIP
// ======================================================

/**
 * Checks whether the current user owns a resource.
 *
 * Example:
 *
 * isResourceOwner(req, item.reporterId)
 */

export function isResourceOwner(request: Request, ownerId: string): boolean {
  const user = request.user;

  if (!user || !user.isActive) {
    return false;
  }

  return user.id === ownerId;
}

// ======================================================
// 20. CHECK ADMINISTRATOR
// ======================================================

export function isAdministrator(request: Request): boolean {
  return hasRole(request, "ADMIN");
}

// ======================================================
// 21. CHECK SECURITY OFFICER
// ======================================================

export function isSecurityOfficer(request: Request): boolean {
  return hasRole(request, "SECURITY");
}

// ======================================================
// 22. CHECK STAFF
// ======================================================

export function isStaffMember(request: Request): boolean {
  return hasRole(request, "STAFF");
}

// ======================================================
// 23. CHECK STUDENT
// ======================================================

export function isStudent(request: Request): boolean {
  return hasRole(request, "STUDENT");
}

// ======================================================
// 24. CURRENT USER SUMMARY
// ======================================================

export interface CurrentUserSummary {
  id: string;

  fullName: string;

  email: string;

  role: UserRole;
}

/**
 * Returns a safe user summary.
 *
 * Never include passwordHash or refresh tokens here.
 */

export function getCurrentUserSummary(request: Request): CurrentUserSummary {
  const user = getCurrentUser(request);

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}

// ======================================================
// 25. DEFAULT EXPORT
// ======================================================

export default getCurrentUser;
