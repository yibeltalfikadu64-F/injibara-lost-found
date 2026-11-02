/**
 * Injibara Campus Lost & Found
 *
 * AUDIT INTERCEPTOR
 *
 * Express middleware for automatic audit logging.
 *
 * Records successful:
 * - POST
 * - PUT
 * - PATCH
 * - DELETE
 *
 * Does not record:
 * - GET requests
 * - Failed requests
 * - Health checks
 * - Sensitive request bodies
 * - Passwords or authentication tokens
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

import type { AuditActionType } from "./audit.service.js";

import { AuditService } from "./audit.service.js";

// ======================================================
// 1. OPTIONS
// ======================================================

export interface AuditInterceptorOptions {
  auditService: AuditService;

  /**
   * URL prefixes that should not be audited.
   */
  excludedPaths?: string[];

  /**
   * Enable or disable automatic audit logging.
   */
  enabled?: boolean;

  /**
   * Log successful requests only by default.
   */
  successfulResponsesOnly?: boolean;
}

// ======================================================
// 2. HTTP METHOD TO AUDIT ACTION
// ======================================================

function getAuditAction(method: string): AuditActionType | null {
  switch (method.toUpperCase()) {
    case "POST":
      return "CREATE";

    case "PUT":
    case "PATCH":
      return "UPDATE";

    case "DELETE":
      return "DELETE";

    default:
      return null;
  }
}

// ======================================================
// 3. EXTRACT ENTITY NAME
// ======================================================

function getEntityName(request: Request): string {
  const path = request.baseUrl || request.path;

  const segments = path.split("/").filter(Boolean);

  const firstSegment = segments[0] ?? "Other";

  const entityMap: Record<string, string> = {
    users: "User",
    items: "Item",
    claims: "Claim",
    categories: "Category",
    locations: "Location",
    announcements: "Announcement",
    notifications: "Notification",
    uploads: "Upload",
    auth: "Authentication",
    admin: "Admin",
  };

  return entityMap[firstSegment] ?? "Other";
}

// ======================================================
// 4. EXTRACT ENTITY ID
// ======================================================

function getEntityId(request: Request): string | null {
  const params = request.params as Record<
    string,
    string | string[] | undefined
  >;

  const candidate =
    params.id ?? params.itemId ?? params.claimId ?? params.userId;

  if (typeof candidate === "string") {
    return candidate;
  }

  return null;
}

// ======================================================
// 5. EXTRACT CLIENT IP
// ======================================================

function getClientIp(request: Request): string | null {
  /**
   * request.ip is used instead of trusting arbitrary
   * X-Forwarded-For values.
   *
   * Configure Express trust proxy only when your
   * deployment is behind a trusted reverse proxy.
   */

  return request.ip ?? null;
}

// ======================================================
// 6. EXCLUDED PATH CHECK
// ======================================================

function isExcludedPath(request: Request, excludedPaths: string[]): boolean {
  const path = request.originalUrl.split("?")[0] ?? "";

  return excludedPaths.some((excluded) => {
    return path === excluded || path.startsWith(`${excluded}/`);
  });
}

// ======================================================
// 7. SAFE ROUTE DESCRIPTION
// ======================================================

function createDescription(
  action: AuditActionType,
  entity: string,
  method: string,
): string {
  const descriptions: Record<AuditActionType, string> = {
    CREATE: `${entity} resource created through ${method}.`,
    UPDATE: `${entity} resource updated through ${method}.`,
    DELETE: `${entity} resource deleted through ${method}.`,
    LOGIN: "User login recorded.",
    LOGOUT: "User logout recorded.",
    APPROVE: `${entity} resource approved.`,
    REJECT: `${entity} resource rejected.`,
    HANDOVER: "Item handover recorded.",
    ROLE_CHANGE: "User role changed.",
  };

  return descriptions[action];
}

// ======================================================
// 8. CREATE AUDIT INTERCEPTOR
// ======================================================

export function createAuditInterceptor(
  options: AuditInterceptorOptions,
): RequestHandler {
  const enabled = options.enabled ?? true;

  const successfulResponsesOnly = options.successfulResponsesOnly ?? true;

  const excludedPaths = [
    "/health",
    "/healthz",
    "/ready",
    "/metrics",
    ...(options.excludedPaths ?? []),
  ];

  return (request: Request, response: Response, next: NextFunction) => {
    if (!enabled) {
      next();
      return;
    }

    if (isExcludedPath(request, excludedPaths)) {
      next();
      return;
    }

    const action = getAuditAction(request.method);

    if (!action) {
      next();
      return;
    }

    /**
     * Capture request information before the
     * response finishes.
     *
     * Never store request.body because it could
     * contain passwords, tokens, or private data.
     */

    const entity = getEntityName(request);
    const entityId = getEntityId(request);
    const actorId = request.user?.id ?? null;
    const ipAddress = getClientIp(request);

    const method = request.method;

    const startedAt = Date.now();

    let auditWritten = false;

    response.once("finish", () => {
      if (auditWritten) {
        return;
      }

      auditWritten = true;

      const successful =
        response.statusCode >= 200 && response.statusCode < 300;

      if (successfulResponsesOnly && !successful) {
        return;
      }

      /**
       * Audit failure must not change the response
       * that the client already received.
       *
       * The error is logged for operational review.
       */

      void options.auditService
        .createLog({
          action,
          entity,
          entityId,
          actorId,

          description: createDescription(action, entity, method),

          ipAddress,

          metadata: {
            method,
            statusCode: response.statusCode,
            durationMs: Date.now() - startedAt,
          },
        })
        .catch((error: unknown) => {
          console.error(
            "[AUDIT INTERCEPTOR] Failed to save audit record:",
            error instanceof Error ? error.message : "Unknown audit error",
          );
        });
    });

    next();
  };
}

// ======================================================
// 9. DEFAULT EXPORT
// ======================================================

export default createAuditInterceptor;
