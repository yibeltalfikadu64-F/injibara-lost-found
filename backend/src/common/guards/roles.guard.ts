/**
 * Injibara Campus Lost & Found
 *
 * Role Authorization Guard
 *
 * Express middleware implementation.
 *
 * Authentication must execute before role authorization.
 */

import type { Request, RequestHandler } from "express";

import type { UserRole } from "../decorators/current-user.decorator.js";

// ======================================================
// 1. AUTHORIZATION ERROR
// ======================================================

export class AuthorizationError extends Error {
  public readonly statusCode = 403;

  public readonly code = "FORBIDDEN";

  constructor(message = "You do not have permission to perform this action.") {
    super(message);

    this.name = "AuthorizationError";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ======================================================
// 2. ROLE CONSTANTS
// ======================================================

export const ROLES = {
  STUDENT: "STUDENT",
  STAFF: "STAFF",
  SECURITY: "SECURITY",
  ADMIN: "ADMIN",
} as const;

// ======================================================
// 3. ROLE GROUPS
// ======================================================

export const ROLE_GROUPS = {
  ALL: ["STUDENT", "STAFF", "SECURITY", "ADMIN"],

  ADMIN: ["ADMIN"],

  SECURITY: ["SECURITY", "ADMIN"],

  STAFF: ["STAFF", "ADMIN"],

  CAMPUS_MEMBERS: ["STUDENT", "STAFF"],

  ITEM_REPORTERS: ["STUDENT", "STAFF", "SECURITY", "ADMIN"],
} as const;

// ======================================================
// 4. VALIDATE ROLE
// ======================================================

export function isUserRole(role: unknown): role is UserRole {
  return (
    role === "STUDENT" ||
    role === "STAFF" ||
    role === "SECURITY" ||
    role === "ADMIN"
  );
}

// ======================================================
// 5. GET CURRENT ROLE
// ======================================================

export function getRequestRole(request: Request): UserRole | null {
  if (!request.user) {
    return null;
  }

  return request.user.role;
}

// ======================================================
// 6. CHECK ACTIVE AUTHENTICATED USER
// ======================================================

function assertAuthenticated(request: Request): void {
  if (!request.user) {
    const error = new Error("Authentication is required.") as Error & {
      statusCode: number;
      code: string;
    };

    error.statusCode = 401;
    error.code = "UNAUTHENTICATED";

    throw error;
  }

  if (!request.user.isActive) {
    const error = new Error("Your account is inactive.") as Error & {
      statusCode: number;
      code: string;
    };

    error.statusCode = 401;
    error.code = "ACCOUNT_INACTIVE";

    throw error;
  }
}

// ======================================================
// 7. CHECK ROLE
// ======================================================

export function hasRole(request: Request, role: UserRole): boolean {
  return request.user?.isActive === true && request.user.role === role;
}

// ======================================================
// 8. CHECK ANY ROLE
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
// 9. REQUIRE ONE OR MORE ROLES
// ======================================================

export function requireRoles(...allowedRoles: UserRole[]): RequestHandler {
  if (allowedRoles.length === 0) {
    throw new Error("At least one allowed role must be provided.");
  }

  for (const role of allowedRoles) {
    if (!isUserRole(role)) {
      throw new Error(`Invalid user role: ${String(role)}`);
    }
  }

  const uniqueRoles = [...new Set(allowedRoles)];

  return (request, _response, next) => {
    try {
      assertAuthenticated(request);

      if (!uniqueRoles.includes(request.user!.role)) {
        throw new AuthorizationError(
          "Your role is not permitted to access this resource.",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ======================================================
// 10. ADMINISTRATOR GUARD
// ======================================================

export const adminGuard: RequestHandler = requireRoles("ADMIN");

// ======================================================
// 11. SECURITY GUARD
// ======================================================

export const securityGuard: RequestHandler = requireRoles("SECURITY", "ADMIN");

// ======================================================
// 12. STAFF GUARD
// ======================================================

export const staffGuard: RequestHandler = requireRoles("STAFF", "ADMIN");

// ======================================================
// 13. STUDENT GUARD
// ======================================================

export const studentGuard: RequestHandler = requireRoles("STUDENT");

// ======================================================
// 14. ITEM REPORTER GUARD
// ======================================================

export const itemReporterGuard: RequestHandler = requireRoles(
  "STUDENT",
  "STAFF",
  "SECURITY",
  "ADMIN",
);

// ======================================================
// 15. CLAIM REVIEW GUARD
// ======================================================

export const claimReviewGuard: RequestHandler = requireRoles(
  "SECURITY",
  "ADMIN",
);

// ======================================================
// 16. HANDOVER VERIFICATION GUARD
// ======================================================

export const handoverGuard: RequestHandler = requireRoles("SECURITY", "ADMIN");

// ======================================================
// 17. USER MANAGEMENT GUARD
// ======================================================

export const userManagementGuard: RequestHandler = requireRoles("ADMIN");

// ======================================================
// 18. ITEM MANAGEMENT GUARD
// ======================================================

export const itemManagementGuard: RequestHandler = requireRoles("ADMIN");

// ======================================================
// 19. OWNERSHIP GUARD
// ======================================================

export type OwnerIdResolver = (
  request: Request,
) => string | null | undefined | Promise<string | null | undefined>;

/**
 * Restricts access to the owner of a resource.
 *
 * The resolver must obtain the owner ID from a trusted
 * database-loaded record, not from an untrusted body field.
 */

export function ownershipGuard(getOwnerId: OwnerIdResolver): RequestHandler {
  return async (request, _response, next) => {
    try {
      assertAuthenticated(request);

      const ownerId = await getOwnerId(request);

      if (!ownerId) {
        throw new AuthorizationError(
          "Resource ownership could not be verified.",
        );
      }

      if (ownerId !== request.user!.id) {
        throw new AuthorizationError(
          "You cannot access another user's resource.",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ======================================================
// 20. ADMIN OR OWNER GUARD
// ======================================================

export function adminOrOwnerGuard(getOwnerId: OwnerIdResolver): RequestHandler {
  return async (request, _response, next) => {
    try {
      assertAuthenticated(request);

      if (request.user!.role === "ADMIN") {
        next();
        return;
      }

      const ownerId = await getOwnerId(request);

      if (!ownerId || ownerId !== request.user!.id) {
        throw new AuthorizationError("You can only access your own resource.");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ======================================================
// 21. CHECK PERMISSIONS
// ======================================================

export interface PermissionContext {
  role: UserRole;

  ownerId?: string;

  currentUserId: string;
}

export function canViewResource(context: PermissionContext): boolean {
  return (
    context.role === "ADMIN" ||
    context.role === "SECURITY" ||
    context.ownerId === context.currentUserId
  );
}

export function canEditResource(context: PermissionContext): boolean {
  return context.role === "ADMIN" || context.ownerId === context.currentUserId;
}

export function canDeleteResource(context: PermissionContext): boolean {
  return context.role === "ADMIN" || context.ownerId === context.currentUserId;
}

export function canApproveItem(role: UserRole): boolean {
  return role === "ADMIN" || role === "SECURITY";
}

export function canReviewClaim(role: UserRole): boolean {
  return role === "ADMIN" || role === "SECURITY";
}

export function canManageAccounts(role: UserRole): boolean {
  return role === "ADMIN";
}

// ======================================================
// 22. ROLE DISPLAY NAMES
// ======================================================

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    STUDENT: "Student",
    STAFF: "University Staff",
    SECURITY: "Campus Security",
    ADMIN: "Administrator",
  };

  return labels[role];
}

// ======================================================
// 23. DEFAULT EXPORT
// ======================================================

export default requireRoles;
