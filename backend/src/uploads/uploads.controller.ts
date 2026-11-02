/**
 * Injibara Campus Lost & Found
 *
 * UPLOADS CONTROLLER
 *
 * Handles HTTP requests for:
 * - Item image uploads
 * - Profile avatar uploads
 * - Item image listing
 * - Item image deletion
 * - Profile avatar deletion
 * - Image existence checks
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

import { z } from "zod";

import { UploadsService } from "./uploads.service.js";

import {
  BadRequestException,
  UnauthorizedException,
} from "../common/filters/http-exception.filter.js";

// ======================================================
// 1. ASYNC HANDLER
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
// 2. GET CURRENT USER
// ======================================================

function getCurrentUser(request: Request) {
  if (!request.user) {
    throw new UnauthorizedException("Authentication is required.");
  }

  return request.user;
}

// ======================================================
// 3. VALIDATE UUID
// ======================================================

function getItemId(request: Request): string {
  const result = z.uuid().safeParse(request.params.itemId);

  if (!result.success) {
    throw new BadRequestException("Invalid item ID.");
  }

  return result.data;
}

// ======================================================
// 4. VALIDATE FILENAME
// ======================================================

function getFilename(request: Request): string {
  const result = z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9-]+\.(jpg|png|webp)$/i)
    .safeParse(request.params.filename);

  if (!result.success) {
    throw new BadRequestException("Invalid image filename.");
  }

  return result.data;
}

// ======================================================
// 5. GET UPLOADED FILES
// ======================================================

function getUploadedFiles(request: Request) {
  const files = request.files;

  if (!Array.isArray(files)) {
    return [];
  }

  return files as Express.Multer.File[];
}

// ======================================================
// 6. GET SINGLE UPLOADED FILE
// ======================================================

function getUploadedFile(request: Request) {
  const file = request.file;

  if (!file) {
    throw new BadRequestException("Please select an image.");
  }

  return file;
}

// ======================================================
// 7. UPLOADS CONTROLLER
// ======================================================

export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // ====================================================
  // 8. UPLOAD ITEM IMAGES
  // ====================================================

  uploadItemImages: RequestHandler = asyncHandler(async (request, response) => {
    const itemId = getItemId(request);

    const files = getUploadedFiles(request);

    const result = await this.uploadsService.uploadItemImages(
      itemId,
      files,
      getCurrentUser(request),
    );

    response.status(201).json(result);
  });

  // ====================================================
  // 9. UPLOAD PROFILE AVATAR
  // ====================================================

  uploadAvatar: RequestHandler = asyncHandler(async (request, response) => {
    const file = getUploadedFile(request);

    const result = await this.uploadsService.uploadAvatar(
      file,
      getCurrentUser(request),
    );

    response.status(201).json(result);
  });

  // ====================================================
  // 10. GET ITEM IMAGES
  // ====================================================

  getItemImages: RequestHandler = asyncHandler(async (request, response) => {
    const itemId = getItemId(request);

    const result = await this.uploadsService.getItemImages(
      itemId,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 11. DELETE ITEM IMAGE
  // ====================================================

  deleteItemImage: RequestHandler = asyncHandler(async (request, response) => {
    const itemId = getItemId(request);

    const filename = getFilename(request);

    const result = await this.uploadsService.deleteItemImage(
      itemId,
      filename,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 12. DELETE MY AVATAR
  // ====================================================

  deleteMyAvatar: RequestHandler = asyncHandler(async (request, response) => {
    const result = await this.uploadsService.deleteMyAvatar(
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 13. CHECK ITEM IMAGE
  // ====================================================

  checkItemImage: RequestHandler = asyncHandler(async (request, response) => {
    const itemId = getItemId(request);

    const filename = getFilename(request);

    const result = await this.uploadsService.checkItemImage(
      itemId,
      filename,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });
}

// ======================================================
// 14. DEFAULT EXPORT
// ======================================================

export default UploadsController;
