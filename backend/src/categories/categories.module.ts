import { Router } from "express";

import type { PrismaClient } from "../../generated/prisma/client.js";

import { CategoriesService } from "./categories.service.js";

import {
  CategoriesController,
  createCategorySchema,
  updateCategorySchema,
  categorySearchSchema,
} from "./categories.controller.js";

import {
  validateBody,
  validateQuery,
} from "../common/pipes/validation.pipe.js";

import { createRequiredJwtGuard } from "../common/guards/jwt-auth.guard.js";

import { requireRoles } from "../common/guards/roles.guard.js";

import { createPrismaUserResolver } from "../auth/strategies/jwt.strategy.js";

import { configuration } from "../config/configuration.js";

export interface CategoriesModuleOptions {
  prisma: PrismaClient;
}

export function createCategoriesModule(
  options: CategoriesModuleOptions,
): Router {
  const router = Router();

  const service = new CategoriesService({
    prisma: options.prisma,
  });

  const controller = new CategoriesController(service);

  const resolver = createPrismaUserResolver(options.prisma);

  const jwtOptions = {
    secret: configuration.jwt.accessSecret,
    algorithms: ["HS256"],
    issuer: "injibara-lost-found",
    audience: "injibara-lost-found-mobile",
    tokenType: "access",
  } as const;

  const authenticate = createRequiredJwtGuard(resolver, jwtOptions);

  const adminOnly = requireRoles("ADMIN");

  // PUBLIC ROUTES

  router.get("/", controller.getActiveCategories);

  router.get(
    "/search",
    validateQuery(categorySearchSchema),
    controller.searchCategories,
  );

  // ADMIN READ ROUTES
  // Register these before /:id.

  router.get(
    "/admin/statistics",
    authenticate,
    adminOnly,
    controller.getCategoryStatistics,
  );

  router.get(
    "/admin/all",
    authenticate,
    adminOnly,
    validateQuery(categorySearchSchema),
    controller.getAllCategoriesForAdmin,
  );

  router.get(
    "/:id/item-count",
    authenticate,
    adminOnly,
    controller.getCategoryItemCount,
  );

  // PUBLIC CATEGORY DETAILS

  router.get("/:id", controller.getCategoryById);

  // ADMIN WRITE ROUTES

  router.use(authenticate);
  router.use(adminOnly);

  router.post(
    "/",
    validateBody(createCategorySchema),
    controller.createCategory,
  );

  router.patch(
    "/:id",
    validateBody(updateCategorySchema),
    controller.updateCategory,
  );

  router.patch("/:id/deactivate", controller.deactivateCategory);

  router.patch("/:id/activate", controller.activateCategory);

  console.info("[CATEGORIES MODULE] Category routes registered.");

  return router;
}

export default createCategoriesModule;
