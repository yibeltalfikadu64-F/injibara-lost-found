/**
 * Injibara Campus Lost & Found
 *
 * Locations Module
 *
 * Express Router composition.
 */

import { Router } from "express";

import type { PrismaClient } from "../../generated/prisma/client.js";

import { LocationsService } from "./locations.service.js";

import {
  LocationsController,
  createLocationSchema,
  updateLocationSchema,
  locationSearchSchema,
} from "./locations.controller.js";

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

export interface LocationsModuleOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. CREATE LOCATIONS MODULE
// ======================================================

export function createLocationsModule(options: LocationsModuleOptions): Router {
  const router = Router();

  const { prisma } = options;

  // ====================================================
  // 3. SERVICE
  // ====================================================

  const locationsService = new LocationsService({
    prisma,
  });

  // ====================================================
  // 4. CONTROLLER
  // ====================================================

  const controller = new LocationsController(locationsService);

  // ====================================================
  // 5. USER RESOLVER
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
  // 7. AUTHENTICATION
  // ====================================================

  const authenticate = createRequiredJwtGuard(userResolver, jwtOptions);

  // ====================================================
  // 8. ADMIN AUTHORIZATION
  // ====================================================

  const adminOnly = requireRoles("ADMIN");

  // ====================================================
  // 9. PUBLIC ROUTES
  // ====================================================

  /**
   * GET /api/v1/locations
   */

  router.get("/", controller.getActiveLocations);

  /**
   * GET /api/v1/locations/search
   */

  router.get(
    "/search",
    validateQuery(locationSearchSchema),
    controller.searchLocations,
  );

  /**
   * GET /api/v1/locations/building/:building
   */

  router.get("/building/:building", controller.getLocationsByBuilding);

  // ====================================================
  // 10. ADMIN GET ROUTES
  // ====================================================

  router.get(
    "/admin/statistics",
    authenticate,
    adminOnly,
    controller.getLocationStatistics,
  );

  router.get(
    "/admin/all",
    authenticate,
    adminOnly,
    validateQuery(locationSearchSchema),
    controller.getAllLocationsForAdmin,
  );

  router.get(
    "/:id/item-count",
    authenticate,
    adminOnly,
    controller.getLocationItemCount,
  );

  // ====================================================
  // 11. PUBLIC LOCATION DETAILS
  // ====================================================

  router.get("/:id", controller.getLocationById);

  // ====================================================
  // 12. ADMIN WRITE ROUTES
  // ====================================================

  router.use(authenticate);

  router.use(adminOnly);

  // ====================================================
  // 13. CREATE LOCATION
  // ====================================================

  router.post(
    "/",
    validateBody(createLocationSchema),
    controller.createLocation,
  );

  // ====================================================
  // 14. UPDATE LOCATION
  // ====================================================

  router.patch(
    "/:id",
    validateBody(updateLocationSchema),
    controller.updateLocation,
  );

  // ====================================================
  // 15. DEACTIVATE LOCATION
  // ====================================================

  router.patch("/:id/deactivate", controller.deactivateLocation);

  // ====================================================
  // 16. ACTIVATE LOCATION
  // ====================================================

  router.patch("/:id/activate", controller.activateLocation);

  // ====================================================
  // 17. INITIALIZATION
  // ====================================================

  console.info("[LOCATIONS MODULE] Campus location routes registered.");

  return router;
}

// ======================================================
// 18. DEFAULT EXPORT
// ======================================================

export default createLocationsModule;
