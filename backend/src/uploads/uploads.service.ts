/**
 * Injibara Campus Lost & Found
 *
 * UPLOADS SERVICE
 *
 * Local file upload implementation.
 *
 * Supported:
 * - JPEG
 * - PNG
 * - WebP
 *
 * Storage:
 * backend/uploads/
 *
 * No separate Prisma upload model is required.
 */

import { randomUUID } from "node:crypto";

import { mkdir, writeFile, unlink, access } from "node:fs/promises";

import { constants } from "node:fs";

import { basename, extname, resolve } from "node:path";

import multer from "multer";

import type { Express } from "express";

import type { PrismaClient } from "../../generated/prisma/client.js";

import type { AuthenticatedUser } from "../common/decorators/current-user.decorator.js";

import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "../common/filters/http-exception.filter.js";

// ======================================================
// 1. UPLOAD CONFIGURATION
// ======================================================

export const UPLOAD_MAX_FILE_SIZE = 8 * 1024 * 1024;

export const UPLOAD_MAX_FILES = 5;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

// ======================================================
// 2. UPLOAD DIRECTORY
// ======================================================

/**
 * Set UPLOAD_DIRECTORY in the backend environment
 * when you want to use a custom absolute directory.
 *
 * Default: uploads/ relative to backend process cwd.
 */

export function getUploadRoot(): string {
  const configured = process.env.UPLOAD_DIRECTORY?.trim();

  if (configured) {
    return resolve(configured);
  }

  return resolve(process.cwd(), "uploads");
}

// ======================================================
// 3. STORAGE SUBDIRECTORIES
// ======================================================

function getItemUploadDirectory(): string {
  return resolve(getUploadRoot(), "items");
}

function getAvatarUploadDirectory(): string {
  return resolve(getUploadRoot(), "avatars");
}

// ======================================================
// 4. UPLOAD FILE RESULT
// ======================================================

export interface UploadedFileResult {
  filename: string;
  originalName: string;
  mimeType: AllowedImageMimeType;
  size: number;
  url: string;
  uploadedAt: string;
}

// ======================================================
// 5. IMAGE VALIDATION RESULT
// ======================================================

interface ImageValidationResult {
  valid: boolean;
  mimeType?: AllowedImageMimeType;
  extension?: string;
}

// ======================================================
// 6. AUTHORIZATION
// ======================================================

function ensureAuthenticated(user: AuthenticatedUser): void {
  if (!user?.id) {
    throw new ForbiddenException("Authentication is required.");
  }
}

function ensureAdminOrOwner(user: AuthenticatedUser, ownerId: string): void {
  ensureAuthenticated(user);

  if (user.id !== ownerId && user.role !== "ADMIN") {
    throw new ForbiddenException("You are not allowed to manage this file.");
  }
}

// ======================================================
// 7. MIME TYPE VALIDATION
// ======================================================

function isAllowedMimeType(mimeType: string): mimeType is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

// ======================================================
// 8. FILE SIGNATURE VALIDATION
// ======================================================

/**
 * File extension and browser MIME type are not
 * sufficient security checks.
 *
 * This function verifies the image's leading bytes.
 */

function validateImageSignature(
  buffer: Buffer,
  claimedMimeType: string,
): ImageValidationResult {
  if (!isAllowedMimeType(claimedMimeType)) {
    return {
      valid: false,
    };
  }

  // JPEG signature: FF D8 FF
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  // WebP: RIFF....WEBP
  const isWebp =
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  if (claimedMimeType === "image/jpeg" && isJpeg) {
    return {
      valid: true,
      mimeType: "image/jpeg",
      extension: ".jpg",
    };
  }

  if (claimedMimeType === "image/png" && isPng) {
    return {
      valid: true,
      mimeType: "image/png",
      extension: ".png",
    };
  }

  if (claimedMimeType === "image/webp" && isWebp) {
    return {
      valid: true,
      mimeType: "image/webp",
      extension: ".webp",
    };
  }

  return {
    valid: false,
  };
}

// ======================================================
// 9. FILE VALIDATION
// ======================================================

function validateUploadedFile(
  file: Express.Multer.File,
): ImageValidationResult {
  if (!file) {
    return {
      valid: false,
    };
  }

  if (!file.buffer || file.buffer.length === 0) {
    return {
      valid: false,
    };
  }

  if (file.size > UPLOAD_MAX_FILE_SIZE) {
    return {
      valid: false,
    };
  }

  return validateImageSignature(file.buffer, file.mimetype);
}

// ======================================================
// 10. SAFE ORIGINAL FILENAME
// ======================================================

function sanitizeOriginalFilename(filename: string): string {
  const safe = basename(filename)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 150);

  return safe || "uploaded-image";
}

// ======================================================
// 11. FILE STORAGE
// ======================================================

async function saveImage(
  file: Express.Multer.File,
  directory: string,
  publicPrefix: string,
): Promise<UploadedFileResult> {
  const validation = validateUploadedFile(file);

  if (!validation.valid || !validation.extension || !validation.mimeType) {
    throw new BadRequestException(
      "Invalid image. Upload a genuine JPEG, PNG, or WebP file.",
    );
  }

  await mkdir(directory, {
    recursive: true,
  });

  const filename = `${randomUUID()}${validation.extension}`;

  const destination = resolve(directory, filename);

  await writeFile(destination, file.buffer, {
    flag: "wx",
  });

  return {
    filename,
    originalName: sanitizeOriginalFilename(file.originalname),
    mimeType: validation.mimeType,
    size: file.buffer.length,
    url: `${publicPrefix}/${filename}`,
    uploadedAt: new Date().toISOString(),
  };
}

// ======================================================
// 12. SAFE FILE PATH
// ======================================================

/**
 * Only a basename is accepted.
 * This prevents path traversal such as ../../secret.
 */

function getSafeFilePath(directory: string, filename: string): string {
  const safeName = basename(filename);

  if (safeName !== filename || safeName.length === 0) {
    throw new BadRequestException("Invalid filename.");
  }

  const destination = resolve(directory, safeName);

  if (
    !destination.startsWith(`${resolve(directory)}/`) &&
    !destination.startsWith(`${resolve(directory)}\\`)
  ) {
    throw new BadRequestException("Invalid file path.");
  }

  return destination;
}

// ======================================================
// 13. DELETE FILE FROM DISK
// ======================================================

async function deletePhysicalFile(
  directory: string,
  filename: string,
): Promise<void> {
  const destination = getSafeFilePath(directory, filename);

  try {
    await unlink(destination);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") {
      throw error;
    }
  }
}

// ======================================================
// 14. FILE EXISTS
// ======================================================

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);

    return true;
  } catch {
    return false;
  }
}

// ======================================================
// 15. MULTER CONFIGURATION
// ======================================================

const memoryStorage = multer.memoryStorage();

export const imageUploadMiddleware = multer({
  storage: memoryStorage,

  limits: {
    fileSize: UPLOAD_MAX_FILE_SIZE,
    files: UPLOAD_MAX_FILES,
    fields: 10,
    parts: 15,
  },

  fileFilter: (_request, file, callback) => {
    if (!isAllowedMimeType(file.mimetype)) {
      callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));

      return;
    }

    callback(null, true);
  },
});

// ======================================================
// 16. UPLOAD SERVICE OPTIONS
// ======================================================

export interface UploadsServiceOptions {
  prisma: PrismaClient;
}

// ======================================================
// 17. UPLOAD SERVICE
// ======================================================

export class UploadsService {
  private readonly prisma: PrismaClient;

  constructor(options: UploadsServiceOptions) {
    this.prisma = options.prisma;
  }

  // ====================================================
  // 18. UPLOAD ITEM IMAGES
  // ====================================================

  async uploadItemImages(
    itemId: string,
    files: Express.Multer.File[],
    currentUser: AuthenticatedUser,
  ) {
    ensureAuthenticated(currentUser);

    if (!files || files.length === 0) {
      throw new BadRequestException("Select at least one image.");
    }

    if (files.length > UPLOAD_MAX_FILES) {
      throw new BadRequestException(
        `You can upload at most ${UPLOAD_MAX_FILES} images at a time.`,
      );
    }

    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: {
        id: true,
        reporterId: true,
        imageUrls: true,
      },
    });

    if (!item) {
      throw new NotFoundException("Item not found.");
    }

    ensureAdminOrOwner(currentUser, item.reporterId);

    const remaining = Math.max(0, 10 - item.imageUrls.length);

    if (files.length > remaining) {
      throw new BadRequestException(
        `This item can have at most 10 images. You can add ${remaining} more.`,
      );
    }

    const savedFiles: UploadedFileResult[] = [];

    try {
      for (const file of files) {
        const saved = await saveImage(
          file,
          getItemUploadDirectory(),
          "/api/v1/uploads/files/items",
        );

        savedFiles.push(saved);
      }

      const updated = await this.prisma.item.update({
        where: {
          id: itemId,
        },

        data: {
          imageUrls: {
            push: savedFiles.map((file) => file.url),
          },
        },

        select: {
          id: true,
          title: true,
          imageUrls: true,
          updatedAt: true,
        },
      });

      return {
        success: true as const,
        message: "Item images uploaded successfully.",
        data: {
          item: updated,
          files: savedFiles,
        },
      };
    } catch (error) {
      // Remove files if the database update fails.
      await Promise.all(
        savedFiles.map((file) =>
          deletePhysicalFile(getItemUploadDirectory(), file.filename).catch(
            () => undefined,
          ),
        ),
      );

      throw error;
    }
  }

  // ====================================================
  // 19. UPLOAD PROFILE AVATAR
  // ====================================================

  async uploadAvatar(
    file: Express.Multer.File,
    currentUser: AuthenticatedUser,
  ) {
    ensureAuthenticated(currentUser);

    if (!file) {
      throw new BadRequestException("Select a profile image.");
    }

    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },

      select: {
        id: true,
        avatarUrl: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException("User not found.");
    }

    const saved = await saveImage(
      file,
      getAvatarUploadDirectory(),
      "/api/v1/uploads/files/avatars",
    );

    try {
      const updated = await this.prisma.user.update({
        where: {
          id: currentUser.id,
        },

        data: {
          avatarUrl: saved.url,
        },

        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          updatedAt: true,
        },
      });

      // Delete previous avatar only when it belongs
      // to this application's local avatar directory.
      if (existingUser.avatarUrl) {
        await this.deletePreviousAvatar(existingUser.avatarUrl);
      }

      return {
        success: true as const,
        message: "Profile image uploaded successfully.",
        data: {
          user: updated,
          file: saved,
        },
      };
    } catch (error) {
      await deletePhysicalFile(
        getAvatarUploadDirectory(),
        saved.filename,
      ).catch(() => undefined);

      throw error;
    }
  }

  // ====================================================
  // 20. DELETE PREVIOUS AVATAR
  // ====================================================

  private async deletePreviousAvatar(avatarUrl: string): Promise<void> {
    const prefix = "/api/v1/uploads/files/avatars/";

    if (!avatarUrl.startsWith(prefix)) {
      return;
    }

    const filename = avatarUrl.slice(prefix.length);

    if (!filename || basename(filename) !== filename) {
      return;
    }

    await deletePhysicalFile(getAvatarUploadDirectory(), filename).catch(
      (error: unknown) => {
        console.error(
          "[UPLOADS] Could not remove previous avatar:",
          error instanceof Error ? error.message : "Unknown error",
        );
      },
    );
  }

  // ====================================================
  // 21. DELETE ITEM IMAGE
  // ====================================================

  async deleteItemImage(
    itemId: string,
    filename: string,
    currentUser: AuthenticatedUser,
  ) {
    ensureAuthenticated(currentUser);

    if (!filename || basename(filename) !== filename) {
      throw new BadRequestException("Invalid image filename.");
    }

    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: {
        id: true,
        reporterId: true,
        imageUrls: true,
      },
    });

    if (!item) {
      throw new NotFoundException("Item not found.");
    }

    ensureAdminOrOwner(currentUser, item.reporterId);

    const expectedUrl = `/api/v1/uploads/files/items/${filename}`;

    if (!item.imageUrls.includes(expectedUrl)) {
      throw new NotFoundException("Image does not belong to this item.");
    }

    const updated = await this.prisma.item.update({
      where: {
        id: itemId,
      },

      data: {
        imageUrls: {
          set: item.imageUrls.filter((url) => url !== expectedUrl),
        },
      },

      select: {
        id: true,
        title: true,
        imageUrls: true,
      },
    });

    await deletePhysicalFile(getItemUploadDirectory(), filename);

    return {
      success: true as const,
      message: "Item image deleted successfully.",
      data: updated,
    };
  }

  // ====================================================
  // 22. DELETE MY AVATAR
  // ====================================================

  async deleteMyAvatar(currentUser: AuthenticatedUser) {
    ensureAuthenticated(currentUser);

    const user = await this.prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },

      select: {
        id: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    if (!user.avatarUrl) {
      throw new BadRequestException("You do not have a profile image.");
    }

    const oldAvatarUrl = user.avatarUrl;

    await this.prisma.user.update({
      where: {
        id: currentUser.id,
      },

      data: {
        avatarUrl: null,
      },
    });

    await this.deletePreviousAvatar(oldAvatarUrl);

    return {
      success: true as const,
      message: "Profile image removed successfully.",
    };
  }

  // ====================================================
  // 23. GET ITEM IMAGE INFORMATION
  // ====================================================

  async getItemImages(itemId: string, currentUser: AuthenticatedUser) {
    ensureAuthenticated(currentUser);

    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: {
        id: true,
        reporterId: true,
        imageUrls: true,
      },
    });

    if (!item) {
      throw new NotFoundException("Item not found.");
    }

    ensureAdminOrOwner(currentUser, item.reporterId);

    return {
      success: true as const,

      data: {
        itemId: item.id,
        total: item.imageUrls.length,
        images: item.imageUrls,
      },
    };
  }

  // ====================================================
  // 24. CHECK STORED IMAGE
  // ====================================================

  async checkItemImage(
    itemId: string,
    filename: string,
    currentUser: AuthenticatedUser,
  ) {
    ensureAuthenticated(currentUser);

    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: {
        id: true,
        reporterId: true,
        imageUrls: true,
      },
    });

    if (!item) {
      throw new NotFoundException("Item not found.");
    }

    ensureAdminOrOwner(currentUser, item.reporterId);

    if (basename(filename) !== filename) {
      throw new BadRequestException("Invalid filename.");
    }

    const url = `/api/v1/uploads/files/items/${filename}`;

    if (!item.imageUrls.includes(url)) {
      throw new NotFoundException("Image not associated with this item.");
    }

    const filePath = getSafeFilePath(getItemUploadDirectory(), filename);

    const exists = await fileExists(filePath);

    return {
      success: true as const,
      data: {
        itemId,
        filename,
        exists,
        url,
      },
    };
  }
}

// ======================================================
// 25. DEFAULT EXPORT
// ======================================================

export default UploadsService;
