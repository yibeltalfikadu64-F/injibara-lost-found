/**
 * Injibara Campus Lost & Found
 *
 * Reports Module
 *
 * Express 5 Router composition.
 *
 * Reports are generated from existing database records.
 */

import { Router } from "express";

import type { PrismaClient } from "../../generated/prisma/client.js";

import { ReportsService } from "./reports.service.js";

import { ReportsController } from "./reports.controller.js";

import { createRequiredJwtGuard } from "../common/guards/jwt-auth.guard.js";

import { requireRoles } from "../common/guards/roles.guard.js";

import { createPrismaUserResolver } from "../auth/strategies/jwt.strategy.js";

import { configuration } from "../config/configuration.js";

// ======================================================
// 1. MODULE OPTIONS
// ======================================================

export interface ReportsModuleOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. CREATE REPORTS MODULE
// ======================================================

export function createReportsModule(options: ReportsModuleOptions): Router {
  const router = Router();

  // ====================================================
  // 3. INITIALIZE SERVICE
  // ====================================================

  const reportsService = new ReportsService({
    prisma: options.prisma,
  });

  // ====================================================
  // 4. INITIALIZE CONTROLLER
  // ====================================================

  const controller = new ReportsController(reportsService);

  // ====================================================
  // 5. USER RESOLVER
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
  // 7. ROLE PERMISSIONS
  // ====================================================

  const adminOnly = requireRoles("ADMIN");

  // All report routes require authentication.
  router.use(authenticate);

  // ====================================================
  // 8. PERSONAL REPORTS
  // ====================================================

  /**
   * GET /api/v1/reports/my/items
   */

  router.get("/my/items", controller.getMyItemReports);

  /**
   * GET /api/v1/reports/my/items/summary
   */

  router.get("/my/items/summary", controller.getMyItemReportSummary);

  /**
   * GET /api/v1/reports/my/claims/summary
   */

  router.get("/my/claims/summary", controller.getMyClaimReportSummary);

  /**
   * GET /api/v1/reports/my/activity
   */

  router.get("/my/activity", controller.getMyActivityReport);

  // ====================================================
  // 9. ADMIN DASHBOARD
  // ====================================================

  router.get("/admin/dashboard", adminOnly, controller.getDashboardSummary);

  router.get("/admin/metadata", adminOnly, controller.getReportMetadata);

  // ====================================================
  // 10. ADMIN USER REPORTS
  // ====================================================

  router.get("/admin/users", adminOnly, controller.getUserStatistics);

  // ====================================================
  // 11. ADMIN ITEM REPORTS
  // ====================================================

  router.get("/admin/items", adminOnly, controller.getItemReports);

  router.get(
    "/admin/items/pending-approval",
    adminOnly,
    controller.getPendingItemApprovals,
  );

  router.get("/admin/items/types", adminOnly, controller.getItemTypeStatistics);

  router.get(
    "/admin/items/statuses",
    adminOnly,
    controller.getItemStatusStatistics,
  );

  router.get(
    "/admin/items/monthly",
    adminOnly,
    controller.getMonthlyItemActivity,
  );

  // ====================================================
  // 12. ADMIN CLAIM REPORTS
  // ====================================================

  router.get("/admin/claims", adminOnly, controller.getClaimReports);

  router.get(
    "/admin/claims/statuses",
    adminOnly,
    controller.getClaimStatusStatistics,
  );

  // ====================================================
  // 13. ADMIN CATEGORY AND LOCATION REPORTS
  // ====================================================

  router.get("/admin/categories/top", adminOnly, controller.getTopCategories);

  router.get("/admin/locations/top", adminOnly, controller.getTopLocations);

  // ====================================================
  // 14. ADMIN ITEM REPORT DETAILS
  // ====================================================

  /**
   * Keep this route after the named admin routes.
   *
   * GET /api/v1/reports/items/:id
   */

  router.get("/items/:id", controller.getItemReportById);

  // ====================================================
  // 15. INITIALIZATION
  // ====================================================

  console.info("[REPORTS MODULE] Reporting routes registered.");

  return router;
}

// ======================================================
// 16. DEFAULT EXPORT
// ======================================================

export default createReportsModule;
