/**
 * Injibara Campus Lost & Found
 *
 * AUDIT MODULE
 *
 * Base URL:
 * /api/v1/audit
 *
 * Access:
 * ADMIN only.
 */

import { Router } from "express";

import type { Request, Response, NextFunction, RequestHandler } from "express";

import { z } from "zod";

import type { PrismaClient } from "../../generated/prisma/client.js";

import { AuditService, type AuditActionType } from "./audit.service.js";

import { createAuditInterceptor } from "./audit.interceptor.js";

import { createRequiredJwtGuard } from "../common/guards/jwt-auth.guard.js";

import { requireRoles } from "../common/guards/roles.guard.js";

import { createPrismaUserResolver } from "../auth/strategies/jwt.strategy.js";

import { configuration } from "../config/configuration.js";

import {
  BadRequestException,
  NotFoundException,
} from "../common/filters/http-exception.filter.js";

// ======================================================
// 1. MODULE OPTIONS
// ======================================================

export interface AuditModuleOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. ACTION SCHEMA
// ======================================================

const auditActionSchema = z.enum([
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "APPROVE",
  "REJECT",
  "HANDOVER",
  "ROLE_CHANGE",
]);

// ======================================================
// 3. QUERY SCHEMA
// ======================================================

const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  action: auditActionSchema.optional(),

  entity: z.string().trim().max(100).optional(),

  entityId: z.uuid().optional(),

  actorId: z.uuid().optional(),

  search: z.string().trim().max(150).optional(),

  from: z.iso.datetime({ offset: true }).optional(),

  to: z.iso.datetime({ offset: true }).optional(),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ======================================================
// 4. ASYNC HANDLER
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
// 5. QUERY VALIDATION
// ======================================================

function parseAuditQuery(request: Request) {
  const result = auditQuerySchema.safeParse(request.query);

  if (!result.success) {
    throw new BadRequestException("Invalid audit query parameters.");
  }

  return result.data;
}

// ======================================================
// 6. UUID VALIDATION
// ======================================================

function parseUuid(value: unknown, fieldName: string): string {
  const result = z.uuid().safeParse(value);

  if (!result.success) {
    throw new BadRequestException(`Invalid ${fieldName}.`);
  }

  return result.data;
}

// ======================================================
// 7. CREATE MODULE
// ======================================================

export function createAuditModule(options: AuditModuleOptions): Router {
  const router = Router();

  // ====================================================
  // 8. SERVICE
  // ====================================================

  const auditService = new AuditService({
    prisma: options.prisma,
  });

  // ====================================================
  // 9. JWT USER RESOLVER
  // ====================================================

  const userResolver = createPrismaUserResolver(options.prisma);

  // ====================================================
  // 10. AUTHENTICATION
  // ====================================================

  const authenticate = createRequiredJwtGuard(userResolver, {
    secret: configuration.jwt.accessSecret,
    algorithms: ["HS256"],
    issuer: "injibara-lost-found",
    audience: "injibara-lost-found-mobile",
    tokenType: "access",
  });

  // ====================================================
  // 11. ADMIN AUTHORIZATION
  // ====================================================

  const adminOnly = requireRoles("ADMIN");

  router.use(authenticate, adminOnly);

  // ====================================================
  // 12. GET AUDIT STATISTICS
  // ====================================================

  router.get(
    "/statistics",

    asyncHandler(async (_request, response) => {
      const result = await auditService.getStatistics();

      response.status(200).json(result);
    }),
  );

  // ====================================================
  // 13. GET DAILY ACTIVITY
  // ====================================================

  router.get(
    "/daily",

    asyncHandler(async (request, response) => {
      const parsed = z.coerce
        .number()
        .int()
        .min(1)
        .max(90)
        .default(7)
        .safeParse(request.query.days);

      if (!parsed.success) {
        throw new BadRequestException("Invalid days value.");
      }

      const result = await auditService.getDailyActivity(parsed.data);

      response.status(200).json(result);
    }),
  );

  // ====================================================
  // 14. GET RECENT ACTIVITY
  // ====================================================

  router.get(
    "/recent",

    asyncHandler(async (request, response) => {
      const parsed = z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10)
        .safeParse(request.query.limit);

      if (!parsed.success) {
        throw new BadRequestException("Invalid limit value.");
      }

      const result = await auditService.getRecentActivity(parsed.data);

      response.status(200).json(result);
    }),
  );

  // ====================================================
  // 15. SEARCH AUDIT LOGS
  // ====================================================

  router.get(
    "/",

    asyncHandler(async (request, response) => {
      const filters = parseAuditQuery(request);

      const result = await auditService.searchLogs({
        ...filters,

        from: filters.from ? new Date(filters.from) : undefined,

        to: filters.to ? new Date(filters.to) : undefined,

        action: filters.action as AuditActionType | undefined,
      });

      response.status(200).json(result);
    }),
  );

  // ====================================================
  // 16. GET USER ACTIVITY
  // ====================================================

  router.get(
    "/users/:userId",

    asyncHandler(async (request, response) => {
      const userId = parseUuid(request.params.userId, "user ID");

      const page = z.coerce
        .number()
        .int()
        .min(1)
        .default(1)
        .parse(request.query.page);

      const limit = z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20)
        .parse(request.query.limit);

      const result = await auditService.getUserActivity(userId, page, limit);

      response.status(200).json(result);
    }),
  );

  // ====================================================
  // 17. GET ENTITY ACTIVITY
  // ====================================================

  router.get(
    "/entities/:entity/:entityId",

    asyncHandler(async (request, response) => {
      const entity = z
        .string()
        .trim()
        .min(1)
        .max(100)
        .parse(request.params.entity);

      const entityId = parseUuid(request.params.entityId, "entity ID");

      const page = z.coerce
        .number()
        .int()
        .min(1)
        .default(1)
        .parse(request.query.page);

      const limit = z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20)
        .parse(request.query.limit);

      const result = await auditService.getEntityActivity(
        entity,
        entityId,
        page,
        limit,
      );

      response.status(200).json(result);
    }),
  );

  // ====================================================
  // 18. GET ONE AUDIT LOG
  // ====================================================

  router.get(
    "/:id",

    asyncHandler(async (request, response) => {
      const logId = parseUuid(request.params.id, "audit log ID");

      const result = await auditService.getLogById(logId);

      if (!result) {
        throw new NotFoundException("Audit record not found.");
      }

      response.status(200).json({
        success: true,
        data: result,
      });
    }),
  );

  // ====================================================
  // 19. MODULE READY
  // ====================================================

  console.info("[AUDIT MODULE] Audit routes registered.");

  return router;
}

// ======================================================
// 20. CREATE AUTOMATIC AUDIT MIDDLEWARE
// ======================================================

/**
 * Optional application-wide middleware.
 *
 * Use this separately from createAuditModule().
 * Do not install it if you do not want generic
 * automatic audit entries for all write requests.
 */

export function createApplicationAuditMiddleware(
  prisma: PrismaClient,
): RequestHandler {
  const auditService = new AuditService({
    prisma,
  });

  return createAuditInterceptor({
    auditService,
    enabled: true,
    successfulResponsesOnly: true,

    excludedPaths: ["/api/v1/audit", "/api/v1/uploads"],
  });
}

// ======================================================
// 21. DEFAULT EXPORT
// ======================================================

export default createAuditModule;
