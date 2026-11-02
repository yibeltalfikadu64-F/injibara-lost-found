/**
 * Injibara Campus Lost & Found
 *
 * Notifications Module
 *
 * Express 5 router composition.
 */

import { Router } from "express";

import type { PrismaClient } from "../../generated/prisma/client.js";

import { NotificationsService } from "./notifications.service.js";

import {
  NotificationsController,
  notificationSearchSchema,
  broadcastNotificationSchema,
} from "./notifications.controller.js";

import {
  validateBody,
  validateQuery,
} from "../common/pipes/validation.pipe.js";

import { createRequiredJwtGuard } from "../common/guards/jwt-auth.guard.js";

import { requireRoles } from "../common/guards/roles.guard.js";

import { createPrismaUserResolver } from "../auth/strategies/jwt.strategy.js";

import { configuration } from "../config/configuration.js";

// ======================================================
// 1. MODULE OPTIONS
// ======================================================

export interface NotificationsModuleOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. CREATE MODULE
// ======================================================

export function createNotificationsModule(
  options: NotificationsModuleOptions,
): Router {
  const router = Router();

  // ====================================================
  // 3. SERVICE
  // ====================================================

  const service = new NotificationsService({
    prisma: options.prisma,
  });

  // ====================================================
  // 4. CONTROLLER
  // ====================================================

  const controller = new NotificationsController(service);

  // ====================================================
  // 5. USER RESOLVER
  // ====================================================

  const resolver = createPrismaUserResolver(options.prisma);

  // ====================================================
  // 6. JWT
  // ====================================================

  const authenticate = createRequiredJwtGuard(resolver, {
    secret: configuration.jwt.accessSecret,
    algorithms: ["HS256"],
    issuer: "injibara-lost-found",
    audience: "injibara-lost-found-mobile",
    tokenType: "access",
  });

  const adminOnly = requireRoles("ADMIN");

  // All notification routes require authentication.
  router.use(authenticate);

  // ====================================================
  // 7. PERSONAL NOTIFICATIONS
  // ====================================================

  router.get(
    "/",
    validateQuery(notificationSearchSchema),
    controller.getMyNotifications,
  );

  router.get("/unread", controller.getUnreadNotifications);

  router.get("/unread/count", controller.getUnreadCount);

  router.get("/statistics", controller.getMyStatistics);

  // ====================================================
  // 8. READ OPERATIONS
  // ====================================================

  router.patch("/read-all", controller.markAllAsRead);

  router.patch("/:id/read", controller.markAsRead);

  // ====================================================
  // 9. DELETE OPERATIONS
  // ====================================================

  router.delete("/read", controller.deleteAllReadNotifications);

  router.delete("/:id", controller.deleteNotification);

  // ====================================================
  // 10. ADMIN OPERATIONS
  // ====================================================

  router.post(
    "/admin/broadcast",
    adminOnly,
    validateBody(broadcastNotificationSchema),
    controller.broadcastNotification,
  );

  router.get("/admin/statistics", adminOnly, controller.getSystemStatistics);

  // ====================================================
  // 11. SINGLE NOTIFICATION
  // ====================================================

  router.get("/:id", controller.getNotificationById);

  console.info("[NOTIFICATIONS MODULE] Routes registered.");

  return router;
}

// ======================================================
// 12. DEFAULT EXPORT
// ======================================================

export default createNotificationsModule;
