/**
 * Injibara Campus Lost & Found
 *
 * Categories Controller
 *
 * Express 5 controller.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

import { z } from "zod";

import { CategoriesService } from "./categories.service.js";

import {
  getValidatedBody,
  getValidatedQuery,
} from "../common/pipes/validation.pipe.js";

import {
  BadRequestException,
  UnauthorizedException,
} from "../common/filters/http-exception.filter.js";

// ======================================================
// 1. CREATE CATEGORY VALIDATION
// ======================================================

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must contain at least 2 characters.")
    .max(100),

  description: z.string().trim().max(1000).nullable().optional(),

  icon: z.string().trim().max(100).nullable().optional(),
});

// ======================================================
// 2. UPDATE CATEGORY VALIDATION
// ======================================================

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),

    description: z.string().trim().max(1000).nullable().optional(),

    icon: z.string().trim().max(100).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });

// ======================================================
// 3. CATEGORY SEARCH VALIDATION
// ======================================================

export const categorySearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().max(100).optional(),

  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),

  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// ======================================================
// 4. ASYNC HANDLER
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
// 5. CURRENT USER
// ======================================================

function getCurrentUser(request: Request) {
  if (!request.user) {
    throw new UnauthorizedException("Authentication is required.");
  }

  return request.user;
}

// ======================================================
// 6. CATEGORY ID
// ======================================================

function getCategoryId(request: Request): string {
  const result = z.uuid().safeParse(request.params.id);

  if (!result.success) {
    throw new BadRequestException("Invalid category ID.");
  }

  return result.data;
}

// ======================================================
// 7. CATEGORIES CONTROLLER
// ======================================================

export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ====================================================
  // 8. GET ACTIVE CATEGORIES
  // ====================================================

  getActiveCategories: RequestHandler = asyncHandler(
    async (_request, response) => {
      const result = await this.categoriesService.getActiveCategories();

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 9. GET CATEGORY BY ID
  // ====================================================

  getCategoryById: RequestHandler = asyncHandler(async (request, response) => {
    const categoryId = getCategoryId(request);

    const result = await this.categoriesService.getCategoryById(categoryId);

    response.status(200).json(result);
  });

  // ====================================================
  // 10. CREATE CATEGORY
  // ====================================================

  createCategory: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const input = getValidatedBody<{
      name: string;
      description?: string | null;
      icon?: string | null;
    }>(request);

    const result = await this.categoriesService.createCategory(
      input,
      currentUser,
    );

    response.status(201).json(result);
  });

  // ====================================================
  // 11. SEARCH CATEGORIES
  // ====================================================

  searchCategories: RequestHandler = asyncHandler(async (request, response) => {
    const input = getValidatedQuery<{
      page: number;
      limit: number;
      search?: string;
      isActive?: boolean;
      sortBy: "name" | "createdAt" | "updatedAt";
      sortOrder: "asc" | "desc";
    }>(request);

    const result = await this.categoriesService.searchCategories(input);

    response.status(200).json(result);
  });

  // ====================================================
  // 12. ADMIN: GET ALL CATEGORIES
  // ====================================================

  getAllCategoriesForAdmin: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const input = getValidatedQuery<{
        page: number;
        limit: number;
        search?: string;
        isActive?: boolean;
        sortBy: "name" | "createdAt" | "updatedAt";
        sortOrder: "asc" | "desc";
      }>(request);

      const result = await this.categoriesService.getAllCategoriesForAdmin(
        input,
        currentUser,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 13. UPDATE CATEGORY
  // ====================================================

  updateCategory: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const categoryId = getCategoryId(request);

    const input = getValidatedBody<{
      name?: string;
      description?: string | null;
      icon?: string | null;
    }>(request);

    const result = await this.categoriesService.updateCategory(
      categoryId,
      input,
      currentUser,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 14. DEACTIVATE CATEGORY
  // ====================================================

  deactivateCategory: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const categoryId = getCategoryId(request);

      const result = await this.categoriesService.deactivateCategory(
        categoryId,
        currentUser,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 15. ACTIVATE CATEGORY
  // ====================================================

  activateCategory: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const categoryId = getCategoryId(request);

    const result = await this.categoriesService.activateCategory(
      categoryId,
      currentUser,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 16. CATEGORY STATISTICS
  // ====================================================

  getCategoryStatistics: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const result =
        await this.categoriesService.getCategoryStatistics(currentUser);

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 17. CATEGORY ITEM COUNT
  // ====================================================

  getCategoryItemCount: RequestHandler = asyncHandler(
    async (request, response) => {
      const categoryId = getCategoryId(request);

      const total =
        await this.categoriesService.getCategoryItemCount(categoryId);

      response.status(200).json({
        success: true,
        data: {
          categoryId,
          totalItems: total,
        },
      });
    },
  );
}

// ======================================================
// 18. DEFAULT EXPORT
// ======================================================

export default CategoriesController;
