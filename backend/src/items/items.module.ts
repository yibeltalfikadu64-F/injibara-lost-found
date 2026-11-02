/**
 * Injibara Campus Lost & Found
 *
 * Items Module
 *
 * Express 5 module composition.
 *
 * This is NOT a NestJS @Module().
 */

import { Router } from "express";

import type { PrismaClient } from "../../generated/prisma/client.js";

import { ItemsService } from "./items.service.js";

import { ItemsController, changeItemStatusSchema } from "./items.controller.js";

import { createItemDtoSchema } from "./dto/create-item.dto.js";

import { updateItemDtoSchema } from "./dto/update-item.dto.js";

import { searchItemDtoSchema } from "./dto/search-item.dto.js";

import {
  validateBody,
  validateQuery,
} from "../common/pipes/validation.pipe.js";

import {
  createRequiredJwtGuard,
  createOptionalJwtGuard,
} from "../common/guards/jwt-auth.guard.js";

import { requireRoles } from "../common/guards/roles.guard.js";

import { createPrismaUserResolver } from "../auth/strategies/jwt.strategy.js";

import { configuration } from "../config/configuration.js";

// ======================================================
// 1. MODULE OPTIONS
// ======================================================

export interface ItemsModuleOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. CREATE ITEMS MODULE
// ======================================================

export function createItemsModule(options: ItemsModuleOptions): Router {
  const router = Router();

  const { prisma } = options;

  // ====================================================
  // 3. CREATE SERVICE
  // ====================================================

  const itemsService = new ItemsService({
    prisma,
  });

  // ====================================================
  // 4. CREATE CONTROLLER
  // ====================================================

  const controller = new ItemsController(itemsService);

  // ====================================================
  // 5. CREATE USER RESOLVER
  // ====================================================

  const userResolver = createPrismaUserResolver(prisma);

  // ====================================================
  // 6. JWT CONFIGURATION
  // ====================================================

  const jwtOptions = {
    secret: configuration.jwt.accessSecret,

    algorithms: ["HS256"],

    issuer: "injibara-lost-found",

    audience: "injibara-lost-found-mobile",

    tokenType: "access",
  } as const;

  // ====================================================
  // 7. REQUIRED AUTHENTICATION
  // ====================================================

  const authenticate = createRequiredJwtGuard(userResolver, jwtOptions);

  // ====================================================
  // 8. OPTIONAL AUTHENTICATION
  // ====================================================

  const optionalAuthenticate = createOptionalJwtGuard(userResolver, jwtOptions);

  // ====================================================
  // 9. ADMIN AUTHORIZATION
  // ====================================================

  const adminOnly = requireRoles("ADMIN");

  // ====================================================
  // 10. PUBLIC SEARCH
  // ====================================================

  /**
   * GET /api/v1/items
   *
   * Examples:
   *
   * /api/v1/items
   * /api/v1/items?type=LOST
   * /api/v1/items?type=FOUND
   * /api/v1/items?search=phone
   * /api/v1/items?status=OPEN
   * /api/v1/items?page=1&limit=20
   *
   * Only approved items are returned.
   */

  router.get(
    "/",

    validateQuery(searchItemDtoSchema),

    controller.searchItems,
  );

  // ====================================================
  // 11. PUBLIC ITEM DETAILS
  // ====================================================

  /**
   * GET /api/v1/items/:id
   *
   * Approved items are publicly visible.
   * Optional authentication allows owners and admins
   * to view their own unapproved items.
   */

  router.get(
    "/:id",

    optionalAuthenticate,

    controller.getItemById,
  );

  // ====================================================
  // 12. AUTHENTICATION FOR PRIVATE ROUTES
  // ====================================================

  router.use(authenticate);

  // ====================================================
  // 13. CREATE LOST OR FOUND ITEM
  // ====================================================

  /**
   * POST /api/v1/items
   *
   * Example:
   *
   * {
   *   "title": "Black Samsung phone",
   *   "description": "A black Samsung phone...",
   *   "type": "LOST",
   *   "dateOccurred": "2026-10-30T10:00:00.000Z",
   *   "color": "Black",
   *   "brand": "Samsung",
   *   "categoryId": null,
   *   "locationId": null,
   *   "imageUrls": []
   * }
   */

  router.post(
    "/",

    validateBody(createItemDtoSchema),

    controller.createItem,
  );

  // ====================================================
  // 14. GET MY ITEMS
  // ====================================================

  /**
   * GET /api/v1/items/my-items
   */

  router.get(
    "/my-items",

    validateQuery(searchItemDtoSchema),

    controller.getMyItems,
  );

  // ====================================================
  // 15. UPDATE MY ITEM
  // ====================================================

  /**
   * PATCH /api/v1/items/:id
   */

  router.patch(
    "/:id",

    validateBody(updateItemDtoSchema),

    controller.updateMyItem,
  );

  // ====================================================
  // 16. ARCHIVE MY ITEM
  // ====================================================

  /**
   * DELETE /api/v1/items/:id
   *
   * This is a soft archive, not permanent deletion.
   */

  router.delete(
    "/:id",

    controller.archiveMyItem,
  );

  // ====================================================
  // 17. ADMIN: ITEM STATISTICS
  // ====================================================

  /**
   * GET /api/v1/items/admin/statistics
   */

  router.get(
    "/admin/statistics",

    adminOnly,

    controller.getItemStatistics,
  );

  // ====================================================
  // 18. ADMIN: ALL ITEMS
  // ====================================================

  /**
   * GET /api/v1/items/admin/all
   */

  router.get(
    "/admin/all",

    adminOnly,

    validateQuery(searchItemDtoSchema),

    controller.getAllItemsForAdmin,
  );

  // ====================================================
  // 19. ADMIN: PENDING APPROVALS
  // ====================================================

  /**
   * GET /api/v1/items/admin/pending-approvals
   */

  router.get(
    "/admin/pending-approvals",

    adminOnly,

    controller.getPendingApprovals,
  );

  // ====================================================
  // 20. ADMIN: APPROVE ITEM
  // ====================================================

  /**
   * PATCH /api/v1/items/:id/approve
   */

  router.patch(
    "/:id/approve",

    adminOnly,

    controller.approveItem,
  );

  // ====================================================
  // 21. ADMIN: CHANGE ITEM STATUS
  // ====================================================

  /**
   * PATCH /api/v1/items/:id/status
   *
   * Example:
   *
   * {
   *   "status": "RESOLVED"
   * }
   */

  router.patch(
    "/:id/status",

    adminOnly,

    validateBody(changeItemStatusSchema),

    controller.changeItemStatus,
  );

  // ====================================================
  // 22. MODULE INITIALIZATION
  // ====================================================

  console.info("[ITEMS MODULE] Item management routes registered.");

  return router;
}

// ======================================================
// 23. DEFAULT EXPORT
// ======================================================

export default createItemsModule;
