/**
 * Injibara Campus Lost & Found
 *
 * Users Module
 *
 * Express 5 module composition.
 *
 * This is NOT a NestJS @Module().
 */

import { Router } from "express";

import type { PrismaClient } from "../../generated/prisma/client.js";

import { UsersService } from "./users.service.js";

import {
  UsersController,
  updateRoleSchema,
  userListQuerySchema,
} from "./users.controller.js";

import { updateUserDtoSchema } from "./dto/update-user.dto.js";

import { changePasswordDtoSchema } from "./dto/change-password.dto.js";

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

export interface UsersModuleOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. CREATE USERS MODULE
// ======================================================

export function createUsersModule(options: UsersModuleOptions): Router {
  const router = Router();

  const { prisma } = options;

  // ====================================================
  // 3. CREATE USERS SERVICE
  // ====================================================

  const usersService = new UsersService({
    prisma,
  });

  // ====================================================
  // 4. CREATE USERS CONTROLLER
  // ====================================================

  const controller = new UsersController(usersService);

  // ====================================================
  // 5. CREATE JWT USER RESOLVER
  // ====================================================

  const userResolver = createPrismaUserResolver(prisma);

  // ====================================================
  // 6. AUTHENTICATION MIDDLEWARE
  // ====================================================

  const authenticate = createRequiredJwtGuard(userResolver, {
    secret: configuration.jwt.accessSecret,

    algorithms: ["HS256"],

    issuer: "injibara-lost-found",

    audience: "injibara-lost-found-mobile",

    tokenType: "access",

    clockTolerance: 5,
  });

  // ====================================================
  // 7. ADMIN AUTHORIZATION
  // ====================================================

  const adminOnly = requireRoles("ADMIN");

  // ====================================================
  // 8. AUTHENTICATION FOR ALL USER ROUTES
  // ====================================================

  router.use(authenticate);

  // ====================================================
  // 9. CURRENT USER PROFILE ROUTES
  // ====================================================

  /**
   * GET /api/v1/users/me
   *
   * Get the currently authenticated user's profile.
   */

  router.get(
    "/me",

    controller.getMe,
  );

  /**
   * PATCH /api/v1/users/me
   *
   * Update the authenticated user's profile.
   */

  router.patch(
    "/me",

    validateBody(updateUserDtoSchema),

    controller.updateMe,
  );

  /**
   * PATCH /api/v1/users/me/password
   *
   * Change the authenticated user's password.
   */

  router.patch(
    "/me/password",

    validateBody(changePasswordDtoSchema),

    controller.changeMyPassword,
  );

  // ====================================================
  // 10. ADMIN USER STATISTICS
  // ====================================================

  /**
   * GET /api/v1/users/admin/statistics
   */

  router.get(
    "/admin/statistics",

    adminOnly,

    controller.getStatistics,
  );

  // ====================================================
  // 11. ADMIN GET ALL USERS
  // ====================================================

  /**
   * GET /api/v1/users
   *
   * Query examples:
   *
   * ?page=1&limit=20
   * ?search=Yibeltal
   * ?role=STUDENT
   * ?department=Software Engineering
   * ?isActive=true
   */

  router.get(
    "/",

    adminOnly,

    validateQuery(userListQuerySchema),

    controller.getAllUsers,
  );

  // ====================================================
  // 12. ADMIN GET USERS BY ROLE
  // ====================================================

  /**
   * GET /api/v1/users/role/STUDENT
   * GET /api/v1/users/role/STAFF
   * GET /api/v1/users/role/SECURITY
   * GET /api/v1/users/role/ADMIN
   */

  router.get(
    "/role/:role",

    adminOnly,

    controller.getUsersByRole,
  );

  // ====================================================
  // 13. ADMIN GET USERS BY DEPARTMENT
  // ====================================================

  /**
   * GET /api/v1/users/department/Software%20Engineering
   */

  router.get(
    "/department/:department",

    adminOnly,

    controller.getUsersByDepartment,
  );

  // ====================================================
  // 14. ADMIN GET USER BY ID
  // ====================================================

  /**
   * GET /api/v1/users/:id
   */

  router.get(
    "/:id",

    adminOnly,

    controller.getUserById,
  );

  // ====================================================
  // 15. ADMIN UPDATE USER
  // ====================================================

  /**
   * PATCH /api/v1/users/:id
   */

  router.patch(
    "/:id",

    adminOnly,

    validateBody(updateUserDtoSchema),

    controller.updateUser,
  );

  // ====================================================
  // 16. ADMIN CHANGE USER ROLE
  // ====================================================

  /**
   * PATCH /api/v1/users/:id/role
   *
   * Example request:
   *
   * {
   *   "role": "SECURITY"
   * }
   */

  router.patch(
    "/:id/role",

    adminOnly,

    validateBody(updateRoleSchema),

    controller.changeUserRole,
  );

  // ====================================================
  // 17. ADMIN DEACTIVATE USER
  // ====================================================

  /**
   * PATCH /api/v1/users/:id/deactivate
   */

  router.patch(
    "/:id/deactivate",

    adminOnly,

    controller.deactivateUser,
  );

  // ====================================================
  // 18. ADMIN ACTIVATE USER
  // ====================================================

  /**
   * PATCH /api/v1/users/:id/activate
   */

  router.patch(
    "/:id/activate",

    adminOnly,

    controller.activateUser,
  );

  // ====================================================
  // 19. ADMIN SOFT DELETE USER
  // ====================================================

  /**
   * DELETE /api/v1/users/:id
   *
   * IMPORTANT:
   * This performs soft deactivation.
   * It does not permanently delete user records.
   */

  router.delete(
    "/:id",

    adminOnly,

    controller.deleteUser,
  );

  // ====================================================
  // 20. MODULE INITIALIZATION LOG
  // ====================================================

  console.info("[USERS MODULE] User management routes registered.");

  return router;
}

// ======================================================
// 21. DEFAULT EXPORT
// ======================================================

export default createUsersModule;
