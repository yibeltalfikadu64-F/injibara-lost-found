/**
 * Injibara Campus Lost & Found
 *
 * Items Controller
 *
 * Express 5 HTTP controller.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

import { z } from "zod";

import { ItemsService, ITEM_STATUSES } from "./items.service.js";

import {
  getValidatedBody,
  getValidatedQuery,
} from "../common/pipes/validation.pipe.js";

import {
  BadRequestException,
  UnauthorizedException,
} from "../common/filters/http-exception.filter.js";

import type { CreateItemDto } from "./dto/create-item.dto.js";

import type { UpdateItemDto } from "./dto/update-item.dto.js";

import type { SearchItemDto } from "./dto/search-item.dto.js";

// ======================================================
// 1. ADMIN ITEM STATUS SCHEMA
// ======================================================

export const changeItemStatusSchema = z.object({
  status: z.enum(ITEM_STATUSES),
});

// ======================================================
// 2. ASYNC HANDLER
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
// 3. CURRENT USER HELPER
// ======================================================

function getCurrentUser(request: Request) {
  if (!request.user) {
    throw new UnauthorizedException("Authentication is required.");
  }

  return request.user;
}

// ======================================================
// 4. ITEM ID HELPER
// ======================================================

function getItemId(request: Request): string {
  const result = z.uuid().safeParse(request.params.id);

  if (!result.success) {
    throw new BadRequestException("Invalid item ID.");
  }

  return result.data;
}

// ======================================================
// 5. ITEMS CONTROLLER
// ======================================================

export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  // ====================================================
  // 6. SEARCH PUBLIC ITEMS
  // ====================================================

  searchItems: RequestHandler = asyncHandler(async (request, response) => {
    const input = getValidatedQuery<SearchItemDto>(request);

    const result = await this.itemsService.searchItems(input);

    response.status(200).json(result);
  });

  // ====================================================
  // 7. GET ITEM DETAILS
  // ====================================================

  getItemById: RequestHandler = asyncHandler(async (request, response) => {
    const itemId = getItemId(request);

    const result = await this.itemsService.getItemById(itemId, request.user);

    response.status(200).json(result);
  });

  // ====================================================
  // 8. CREATE ITEM
  // ====================================================

  createItem: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const input = getValidatedBody<CreateItemDto>(request);

    const result = await this.itemsService.createItem(input, currentUser);

    response.status(201).json(result);
  });

  // ====================================================
  // 9. GET MY ITEMS
  // ====================================================

  getMyItems: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const input = getValidatedQuery<SearchItemDto>(request);

    const result = await this.itemsService.getMyItems(currentUser, input);

    response.status(200).json(result);
  });

  // ====================================================
  // 10. UPDATE MY ITEM
  // ====================================================

  updateMyItem: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const itemId = getItemId(request);

    const input = getValidatedBody<UpdateItemDto>(request);

    const result = await this.itemsService.updateMyItem(
      itemId,
      input,
      currentUser,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 11. ARCHIVE MY ITEM
  // ====================================================

  archiveMyItem: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const itemId = getItemId(request);

    const result = await this.itemsService.archiveMyItem(itemId, currentUser);

    response.status(200).json(result);
  });

  // ====================================================
  // 12. ADMIN: GET ALL ITEMS
  // ====================================================

  getAllItemsForAdmin: RequestHandler = asyncHandler(
    async (request, response) => {
      const input = getValidatedQuery<SearchItemDto>(request);

      const result = await this.itemsService.getAllItemsForAdmin(input);

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 13. ADMIN: GET PENDING APPROVALS
  // ====================================================

  getPendingApprovals: RequestHandler = asyncHandler(
    async (request, response) => {
      const page = Math.max(1, Number(request.query.page) || 1);

      const limit = Math.min(
        100,
        Math.max(1, Number(request.query.limit) || 20),
      );

      const result = await this.itemsService.getPendingApprovals(page, limit);

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 14. ADMIN: APPROVE ITEM
  // ====================================================

  approveItem: RequestHandler = asyncHandler(async (request, response) => {
    const administrator = getCurrentUser(request);

    const itemId = getItemId(request);

    const result = await this.itemsService.approveItem(itemId, administrator);

    response.status(200).json(result);
  });

  // ====================================================
  // 15. ADMIN: CHANGE ITEM STATUS
  // ====================================================

  changeItemStatus: RequestHandler = asyncHandler(async (request, response) => {
    const administrator = getCurrentUser(request);

    const itemId = getItemId(request);

    const input = getValidatedBody<{
      status: (typeof ITEM_STATUSES)[number];
    }>(request);

    const result = await this.itemsService.changeItemStatus(
      itemId,
      input.status,
      administrator,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 16. ADMIN: GET ITEM STATISTICS
  // ====================================================

  getItemStatistics: RequestHandler = asyncHandler(
    async (_request, response) => {
      const result = await this.itemsService.getItemStatistics();

      response.status(200).json(result);
    },
  );
}

// ======================================================
// 17. DEFAULT EXPORT
// ======================================================

export default ItemsController;
