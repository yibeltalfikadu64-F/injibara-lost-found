/**
 * Injibara Campus Lost & Found
 *
 * Role-Based Access Control
 *
 * Express middleware for authorization.
 *
 * Authentication must run BEFORE these middleware functions.
 */

// ======================================================
// 1. IMPORTS
// ======================================================

import type { Request, RequestHandler } from "express";

import type { UserRole } from "./current-user.decorator.js";

import { UnauthenticatedError } from "./current-user.decorator.js";

// ======================================================
// 2. AUTHORIZATION ERROR
// ======================================================

export class ForbiddenError extends Error {
  public readonly statusCode = 403;

  public readonly code = "FORBIDDEN";

  constructor(message = "You do not have permission to perform this action.") {
    super(message);

    this.name = "ForbiddenError";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ======================================================
// 3. ROLE DEFINITIONS
// ======================================================

export const USER_ROLES = {
  STUDENT: "STUDENT",
  STAFF: "STAFF",
  SECURITY: "SECURITY",
  ADMIN: "ADMIN",
} as const;

export const ALL_ROLES: readonly UserRole[] = [
  "STUDENT",
  "STAFF",
  "SECURITY",
  "ADMIN",
];

// ======================================================
// 4. ROLE GROUPS
// ======================================================

export const ROLE_GROUPS = {
  ADMIN_ONLY: ["ADMIN"],

  SECURITY_ONLY: ["SECURITY"],

  STAFF_AND_ADMIN: ["STAFF", "ADMIN"],

  SECURITY_AND_ADMIN: ["SECURITY", "ADMIN"],

  ALL_AUTHENTICATED: ["STUDENT", "STAFF", "SECURITY", "ADMIN"],
} as const;

// ======================================================
// 5. ROLE VALIDATION
// ======================================================

export function isValidRole(role: unknown): role is UserRole {
  if (typeof role !== "string") {
    return false;
  }

  return ALL_ROLES.includes(role as UserRole);
}

// ======================================================
// 6. CHECK ROLE
// ======================================================

export function userHasRole(request: Request, role: UserRole): boolean {
  const user = request.user;

  if (!user || !user.isActive) {
    return false;
  }

  return user.role === role;
}

// ======================================================
// 7. CHECK ANY ROLE
// ======================================================

export function userHasAnyRole(
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
// 8. REQUIRE AUTHENTICATED USER
// ======================================================

function ensureAuthenticated(request: Request): void {
  if (!request.user) {
    throw new UnauthenticatedError();
  }

  if (!request.user.isActive) {
    throw new UnauthenticatedError("Your account is inactive.");
  }
}

// ======================================================
// 9. REQUIRE ROLES
// ======================================================

/**
 * Restricts a route to one or more user roles.
 *
 * Example:
 *
 * router.get(
 *   '/admin/users',
 *   authenticate,
 *   requireRoles('ADMIN'),
 *   controller,
 * );
 */

export function requireRoles(...allowedRoles: UserRole[]): RequestHandler {
  if (allowedRoles.length === 0) {
    throw new Error("requireRoles needs at least one role.");
  }

  for (const role of allowedRoles) {
    if (!isValidRole(role)) {
      throw new Error(`Invalid authorization role: ${role}`);
    }
  }

  const uniqueRoles = [...new Set(allowedRoles)];

  return (request, _response, next) => {
    try {
      ensureAuthenticated(request);

      const currentRole = request.user!.role;

      if (!uniqueRoles.includes(currentRole)) {
        throw new ForbiddenError(
          "Your account role does not have permission to access this resource.",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ======================================================
// 10. ADMIN ONLY
// ======================================================

export const requireAdmin: RequestHandler = requireRoles("ADMIN");

// ======================================================
// 11. SECURITY ONLY
// ======================================================

export const requireSecurity: RequestHandler = requireRoles("SECURITY");

// ======================================================
// 12. STAFF ONLY
// ======================================================

export const requireStaff: RequestHandler = requireRoles("STAFF");

// ======================================================
// 13. STUDENT ONLY
// ======================================================

export const requireStudent: RequestHandler = requireRoles("STUDENT");

// ======================================================
// 14. ADMIN OR SECURITY
// ======================================================

export const requireAdminOrSecurity: RequestHandler = requireRoles(
  "ADMIN",
  "SECURITY",
);

// ======================================================
// 15. ADMIN OR STAFF
// ======================================================

export const requireAdminOrStaff: RequestHandler = requireRoles(
  "ADMIN",
  "STAFF",
);

// ======================================================
// 16. ANY AUTHENTICATED ROLE
// ======================================================

export const requireAnyAuthenticatedRole: RequestHandler = requireRoles(
  "STUDENT",
  "STAFF",
  "SECURITY",
  "ADMIN",
);

// ======================================================
// 17. RESOURCE OWNERSHIP
// ======================================================

/**
 * Allows access only when the authenticated user owns
 * the resource.
 *
 * ownerIdGetter must retrieve the owner ID from a trusted
 * source, such as a database-loaded resource.
 */

export function requireOwnership(
  ownerIdGetter: (
    request: Request,
  ) => string | undefined | Promise<string | undefined>,
): RequestHandler {
  return async (request, _response, next) => {
    try {
      ensureAuthenticated(request);

      const ownerId = await ownerIdGetter(request);

      if (!ownerId) {
        throw new ForbiddenError("Resource ownership could not be verified.");
      }

      if (request.user!.id !== ownerId) {
        throw new ForbiddenError("You cannot access another user's resource.");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ======================================================
// 18. ADMIN OR RESOURCE OWNER
// ======================================================

export function requireAdminOrOwner(
  ownerIdGetter: (
    request: Request,
  ) => string | undefined | Promise<string | undefined>,
): RequestHandler {
  return async (request, _response, next) => {
    try {
      ensureAuthenticated(request);

      const user = request.user!;

      if (user.role === "ADMIN") {
        next();
        return;
      }

      const ownerId = await ownerIdGetter(request);

      if (!ownerId || ownerId !== user.id) {
        throw new ForbiddenError("You can only access your own resource.");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ======================================================
// 19. ADMIN OR SECURITY RESOURCE ACCESS
// ======================================================

export const requireSecurityOrAdmin = requireRoles("SECURITY", "ADMIN");

// ======================================================
// 20. ROLE-BASED ACCESS HELPERS
// ======================================================

export function canManageUsers(role: UserRole): boolean {
  return role === "ADMIN";
}

export function canManageItems(role: UserRole): boolean {
  return role === "ADMIN";
}

export function canReviewClaims(role: UserRole): boolean {
  return role === "SECURITY" || role === "ADMIN";
}

export function canVerifyHandover(role: UserRole): boolean {
  return role === "SECURITY" || role === "ADMIN";
}

export function canReportItems(role: UserRole): boolean {
  return (
    role === "STUDENT" ||
    role === "STAFF" ||
    role === "SECURITY" ||
    role === "ADMIN"
  );
}

// ======================================================
// 21. ROLE DESCRIPTION
// ======================================================

export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    STUDENT: "Student account with permission to report and claim items.",

    STAFF: "University staff account with permitted reporting access.",

    SECURITY:
      "Campus security account with claim review and handover permissions.",

    ADMIN: "Administrator account with system management permissions.",
  };

  return descriptions[role];
}

// ======================================================
// 22. DEFAULT EXPORT
// ======================================================

export default requireRoles;
