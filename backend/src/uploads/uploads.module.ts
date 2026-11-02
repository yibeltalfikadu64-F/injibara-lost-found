/**
 * Injibara Campus Lost & Found
 *
 * UPLOADS MODULE
 *
 * Base URL:
 * /api/v1/uploads
 *
 * File URL:
 * /api/v1/uploads/files/...
 *
 * Storage:
 * backend/uploads/
 *
 * Authentication:
 * All upload-management routes require
 * a valid JWT access token.
 */

import { Router, static as serveStatic } from "express";

import type { PrismaClient } from "../../generated/prisma/client.js";

import {
  UploadsService,
  imageUploadMiddleware,
  getUploadRoot,
} from "./uploads.service.js";

import { UploadsController } from "./uploads.controller.js";

import { createRequiredJwtGuard } from "../common/guards/jwt-auth.guard.js";

import { createPrismaUserResolver } from "../auth/strategies/jwt.strategy.js";

import { configuration } from "../config/configuration.js";

// ======================================================
// 1. MODULE OPTIONS
// ======================================================

export interface UploadsModuleOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. CREATE UPLOADS MODULE
// ======================================================

export function createUploadsModule(options: UploadsModuleOptions): Router {
  const router = Router();

  // ====================================================
  // 3. INITIALIZE SERVICE
  // ====================================================

  const uploadsService = new UploadsService({
    prisma: options.prisma,
  });

  // ====================================================
  // 4. INITIALIZE CONTROLLER
  // ====================================================

  const uploadsController = new UploadsController(uploadsService);

  // ====================================================
  // 5. PUBLIC STATIC IMAGE ACCESS
  // ====================================================

  /**
   * Stored images are public because item images
   * need to be displayed in lost-and-found listings.
   *
   * Do not store private documents, identity cards,
   * or confidential files in this public directory.
   *
   * UUID filenames reduce guessing but are not
   * a replacement for access control.
   */

  router.use(
    "/files",

    serveStatic(getUploadRoot(), {
      dotfiles: "deny",
      index: false,
      fallthrough: false,
      immutable: true,
      maxAge: "1d",
    }),
  );

  // ====================================================
  // 6. CREATE PRISMA USER RESOLVER
  // ====================================================

  const userResolver = createPrismaUserResolver(options.prisma);

  // ====================================================
  // 7. JWT AUTHENTICATION
  // ====================================================

  const authenticate = createRequiredJwtGuard(userResolver, {
    secret: configuration.jwt.accessSecret,
    algorithms: ["HS256"],
    issuer: "injibara-lost-found",
    audience: "injibara-lost-found-mobile",
    tokenType: "access",
  });

  // ====================================================
  // 8. PROTECT MANAGEMENT ROUTES
  // ====================================================

  router.use(authenticate);

  // ====================================================
  // 9. ITEM IMAGE ROUTES
  // ====================================================

  /**
   * Upload one or more images for an item.
   *
   * Multipart field:
   * images
   */

  router.post(
    "/items/:itemId/images",

    imageUploadMiddleware.array("images", 5),

    uploadsController.uploadItemImages,
  );

  // ====================================================
  // 10. GET ITEM IMAGES
  // ====================================================

  router.get(
    "/items/:itemId/images",

    uploadsController.getItemImages,
  );

  // ====================================================
  // 11. CHECK ITEM IMAGE
  // ====================================================

  router.get(
    "/items/:itemId/images/:filename/check",

    uploadsController.checkItemImage,
  );

  // ====================================================
  // 12. DELETE ITEM IMAGE
  // ====================================================

  router.delete(
    "/items/:itemId/images/:filename",

    uploadsController.deleteItemImage,
  );

  // ====================================================
  // 13. PROFILE AVATAR ROUTES
  // ====================================================

  /**
   * Multipart field:
   * image
   */

  router.post(
    "/avatar",

    imageUploadMiddleware.single("image"),

    uploadsController.uploadAvatar,
  );

  // ====================================================
  // 14. DELETE PROFILE AVATAR
  // ====================================================

  router.delete(
    "/avatar",

    uploadsController.deleteMyAvatar,
  );

  // ====================================================
  // 15. MODULE READY
  // ====================================================

  console.info("[UPLOADS MODULE] Upload routes registered.");

  console.info(`[UPLOADS MODULE] Storage directory: ${getUploadRoot()}`);

  return router;
}

// ======================================================
// 16. DEFAULT EXPORT
// ======================================================

export default createUploadsModule;
