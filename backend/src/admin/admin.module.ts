/**
 * Injibara Campus Lost & Found
 *
 * ADMIN MODULE
 *
 * Express 5 router composition.
 *
 * All routes in this module:
 * - Require a valid access token.
 * - Require the ADMIN role.
 *
 * Base URL:
 * /api/v1/admin
 */

import { Router } from "express";

import type { PrismaClient } from "../../generated/prisma/client.js";

import { AdminService } from "./admin.service.js";

import { AdminController } from "./admin.controller.js";

import { createRequiredJwtGuard } from "../common/guards/jwt-auth.guard.js";

import { requireRoles } from "../common/guards/roles.guard.js";

import { createPrismaUserResolver } from "../auth/strategies/jwt.strategy.js";

import { configuration } from "../config/configuration.js";

// ======================================================
// 1. MODULE OPTIONS
// ======================================================

export interface AdminModuleOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. CREATE ADMIN MODULE
// ======================================================

export function createAdminModule(options: AdminModuleOptions): Router {
  const router = Router();

  // ====================================================
  // 3. INITIALIZE ADMIN SERVICE
  // ====================================================

  const adminService = new AdminService({
    prisma: options.prisma,
  });

  // ====================================================
  // 4. INITIALIZE ADMIN CONTROLLER
  // ====================================================

  const adminController = new AdminController(adminService);

  // ====================================================
  // 5. CREATE PRISMA USER RESOLVER
  // ====================================================

  const userResolver = createPrismaUserResolver(options.prisma);

  // ====================================================
  // 6. JWT AUTHENTICATION
  // ====================================================

  const authenticate = createRequiredJwtGuard(userResolver, {
    secret: configuration.jwt.accessSecret,
    algorithms: ["HS256"],
    issuer: "injibara-lost-found",
    audience: "injibara-lost-found-mobile",
    tokenType: "access",
  });

  // ====================================================
  // 7. ADMIN ROLE GUARD
  // ====================================================

  const adminOnly = requireRoles("ADMIN");

  // ====================================================
  // 8. GLOBAL SECURITY
  // ====================================================

  /**
   * Every route in this module requires:
   *
   * 1. Valid JWT access token.
   * 2. Existing active user.
   * 3. ADMIN role.
   *
   * This protects routes even if a route is
   * accidentally added without its own role guard.
   */

  router.use(authenticate, adminOnly);

  // ====================================================
  // 9. DASHBOARD ROUTES
  // ====================================================

  router.get("/dashboard", adminController.getDashboardSummary);

  router.get("/dashboard/recent-users", adminController.getRecentUsers);

  router.get("/dashboard/recent-items", adminController.getRecentItems);

  router.get("/dashboard/recent-claims", adminController.getRecentClaims);

  // ====================================================
  // 10. USER MANAGEMENT ROUTES
  // ====================================================

  router.get("/users", adminController.getUsers);

  router.get("/users/:id", adminController.getUserDetails);

  router.patch("/users/:id/role", adminController.changeUserRole);

  router.patch("/users/:id/activate", adminController.activateUser);

  router.patch("/users/:id/deactivate", adminController.deactivateUser);

  // ====================================================
  // 11. ITEM MANAGEMENT ROUTES
  // ====================================================

  router.get("/items", adminController.getItems);

  router.get("/items/:id", adminController.getItemDetails);

  router.patch("/items/:id/approve", adminController.approveItem);

  router.patch("/items/:id/reject", adminController.rejectItem);

  router.patch("/items/:id/archive", adminController.archiveItem);

  router.patch("/items/:id/restore", adminController.restoreItem);

  // ====================================================
  // 12. CLAIM MANAGEMENT ROUTES
  // ====================================================

  router.get("/claims", adminController.getClaims);

  router.get("/claims/:id", adminController.getClaimDetails);

  // ====================================================
  // 13. ANNOUNCEMENT MANAGEMENT ROUTES
  // ====================================================

  router.get("/announcements", adminController.getAnnouncements);

  router.post("/announcements", adminController.createAnnouncement);

  router.patch("/announcements/:id", adminController.updateAnnouncement);

  router.delete("/announcements/:id", adminController.deleteAnnouncement);

  // ====================================================
  // 14. AUDIT LOG ROUTES
  // ====================================================

  router.get("/audit-logs", adminController.getAuditLogs);

  router.get("/activity-summary", adminController.getActivitySummary);

  // ====================================================
  // 15. MODULE INITIALIZATION
  // ====================================================

  console.info("[ADMIN MODULE] Administrative routes registered.");

  return router;
}

// ======================================================
// 16. DEFAULT EXPORT
// ======================================================

export default createAdminModule;
