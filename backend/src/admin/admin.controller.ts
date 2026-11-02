/**
 * Injibara Campus Lost & Found
 *
 * ADMIN CONTROLLER
 *
 * Handles administrative HTTP requests.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

import { z } from "zod";

import { AdminService } from "./admin.service.js";

import {
  BadRequestException,
  UnauthorizedException,
} from "../common/filters/http-exception.filter.js";

// ======================================================
// 1. ENUM SCHEMAS
// ======================================================

const userRoleSchema = z.enum(["STUDENT", "STAFF", "SECURITY", "ADMIN"]);

const itemTypeSchema = z.enum(["LOST", "FOUND"]);

const itemStatusSchema = z.enum(["OPEN", "CLAIMED", "RESOLVED", "ARCHIVED"]);

const claimStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
]);

// ======================================================
// 2. PAGINATION SCHEMA
// ======================================================

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().max(150).optional(),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ======================================================
// 3. USER FILTER SCHEMA
// ======================================================

export const adminUserQuerySchema = paginationSchema.extend({
  role: userRoleSchema.optional(),

  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  department: z.string().trim().max(150).optional(),
});

// ======================================================
// 4. CHANGE ROLE SCHEMA
// ======================================================

export const changeUserRoleSchema = z.object({
  role: userRoleSchema,
});

// ======================================================
// 5. ITEM FILTER SCHEMA
// ======================================================

export const adminItemQuerySchema = paginationSchema.extend({
  type: itemTypeSchema.optional(),

  status: itemStatusSchema.optional(),

  isApproved: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  categoryId: z.uuid().optional(),

  locationId: z.uuid().optional(),
});

// ======================================================
// 6. CLAIM FILTER SCHEMA
// ======================================================

export const adminClaimQuerySchema = paginationSchema.extend({
  status: claimStatusSchema.optional(),
});

// ======================================================
// 7. ANNOUNCEMENT CREATE SCHEMA
// ======================================================

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(2).max(200),

  content: z.string().trim().min(5).max(10000),

  isPublished: z.boolean().optional(),
});

// ======================================================
// 8. ANNOUNCEMENT UPDATE SCHEMA
// ======================================================

export const updateAnnouncementSchema = z
  .object({
    title: z.string().trim().min(2).max(200).optional(),

    content: z.string().trim().min(5).max(10000).optional(),

    isPublished: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field must be supplied.",
  });

// ======================================================
// 9. REJECT ITEM SCHEMA
// ======================================================

export const rejectItemSchema = z.object({
  reason: z.string().trim().min(5).max(2000),
});

// ======================================================
// 10. ASYNC HANDLER
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
// 11. CURRENT USER
// ======================================================

function getCurrentUser(request: Request) {
  if (!request.user) {
    throw new UnauthorizedException("Authentication is required.");
  }

  return request.user;
}

// ======================================================
// 12. VALIDATE UUID PARAMETER
// ======================================================

function getId(request: Request, parameter = "id"): string {
  const result = z.uuid().safeParse(request.params[parameter]);

  if (!result.success) {
    throw new BadRequestException(`Invalid ${parameter}.`);
  }

  return result.data;
}

// ======================================================
// 13. VALIDATE QUERY
// ======================================================

function parseQuery<T>(schema: z.ZodType<T>, request: Request): T {
  const result = schema.safeParse(request.query);

  if (!result.success) {
    throw new BadRequestException("Invalid query parameters.");
  }

  return result.data;
}

// ======================================================
// 14. ADMIN CONTROLLER
// ======================================================

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ====================================================
  // 15. DASHBOARD SUMMARY
  // ====================================================

  getDashboardSummary: RequestHandler = asyncHandler(
    async (request, response) => {
      const result = await this.adminService.getDashboardSummary(
        getCurrentUser(request),
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 16. RECENT USERS
  // ====================================================

  getRecentUsers: RequestHandler = asyncHandler(async (request, response) => {
    const limitResult = z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10)
      .safeParse(request.query.limit);

    if (!limitResult.success) {
      throw new BadRequestException("Invalid limit.");
    }

    const result = await this.adminService.getRecentUsers(
      getCurrentUser(request),
      limitResult.data,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 17. RECENT ITEMS
  // ====================================================

  getRecentItems: RequestHandler = asyncHandler(async (request, response) => {
    const limitResult = z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10)
      .safeParse(request.query.limit);

    if (!limitResult.success) {
      throw new BadRequestException("Invalid limit.");
    }

    const result = await this.adminService.getRecentItems(
      getCurrentUser(request),
      limitResult.data,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 18. RECENT CLAIMS
  // ====================================================

  getRecentClaims: RequestHandler = asyncHandler(async (request, response) => {
    const limitResult = z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10)
      .safeParse(request.query.limit);

    if (!limitResult.success) {
      throw new BadRequestException("Invalid limit.");
    }

    const result = await this.adminService.getRecentClaims(
      getCurrentUser(request),
      limitResult.data,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 19. GET ALL USERS
  // ====================================================

  getUsers: RequestHandler = asyncHandler(async (request, response) => {
    const filters = parseQuery(adminUserQuerySchema, request);

    const result = await this.adminService.getUsers(
      filters,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 20. GET USER DETAILS
  // ====================================================

  getUserDetails: RequestHandler = asyncHandler(async (request, response) => {
    const userId = getId(request);

    const result = await this.adminService.getUserDetails(
      userId,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 21. CHANGE USER ROLE
  // ====================================================

  changeUserRole: RequestHandler = asyncHandler(async (request, response) => {
    const userId = getId(request);

    const parsed = changeUserRoleSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new BadRequestException("Invalid user role.");
    }

    const result = await this.adminService.changeUserRole(
      userId,
      parsed.data.role,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 22. ACTIVATE USER
  // ====================================================

  activateUser: RequestHandler = asyncHandler(async (request, response) => {
    const userId = getId(request);

    const result = await this.adminService.activateUser(
      userId,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 23. DEACTIVATE USER
  // ====================================================

  deactivateUser: RequestHandler = asyncHandler(async (request, response) => {
    const userId = getId(request);

    const result = await this.adminService.deactivateUser(
      userId,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 24. GET ALL ITEMS
  // ====================================================

  getItems: RequestHandler = asyncHandler(async (request, response) => {
    const filters = parseQuery(adminItemQuerySchema, request);

    const result = await this.adminService.getItems(
      filters,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 25. GET ITEM DETAILS
  // ====================================================

  getItemDetails: RequestHandler = asyncHandler(async (request, response) => {
    const itemId = getId(request);

    const result = await this.adminService.getItemDetails(
      itemId,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 26. APPROVE ITEM
  // ====================================================

  approveItem: RequestHandler = asyncHandler(async (request, response) => {
    const itemId = getId(request);

    const result = await this.adminService.approveItem(
      itemId,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 27. REJECT ITEM
  // ====================================================

  rejectItem: RequestHandler = asyncHandler(async (request, response) => {
    const itemId = getId(request);

    const parsed = rejectItemSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new BadRequestException("A valid rejection reason is required.");
    }

    const result = await this.adminService.rejectItem(
      itemId,
      parsed.data.reason,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 28. ARCHIVE ITEM
  // ====================================================

  archiveItem: RequestHandler = asyncHandler(async (request, response) => {
    const itemId = getId(request);

    const result = await this.adminService.archiveItem(
      itemId,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 29. RESTORE ITEM
  // ====================================================

  restoreItem: RequestHandler = asyncHandler(async (request, response) => {
    const itemId = getId(request);

    const result = await this.adminService.restoreItem(
      itemId,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 30. GET CLAIMS
  // ====================================================

  getClaims: RequestHandler = asyncHandler(async (request, response) => {
    const filters = parseQuery(adminClaimQuerySchema, request);

    const result = await this.adminService.getClaims(
      filters,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 31. GET CLAIM DETAILS
  // ====================================================

  getClaimDetails: RequestHandler = asyncHandler(async (request, response) => {
    const claimId = getId(request);

    const result = await this.adminService.getClaimDetails(
      claimId,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 32. GET ANNOUNCEMENTS
  // ====================================================

  getAnnouncements: RequestHandler = asyncHandler(async (request, response) => {
    const filters = parseQuery(paginationSchema, request);

    const result = await this.adminService.getAnnouncements(
      getCurrentUser(request),
      filters.page,
      filters.limit,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 33. CREATE ANNOUNCEMENT
  // ====================================================

  createAnnouncement: RequestHandler = asyncHandler(
    async (request, response) => {
      const parsed = createAnnouncementSchema.safeParse(request.body);

      if (!parsed.success) {
        throw new BadRequestException("Invalid announcement data.");
      }

      const result = await this.adminService.createAnnouncement(
        parsed.data,
        getCurrentUser(request),
      );

      response.status(201).json(result);
    },
  );

  // ====================================================
  // 34. UPDATE ANNOUNCEMENT
  // ====================================================

  updateAnnouncement: RequestHandler = asyncHandler(
    async (request, response) => {
      const announcementId = getId(request);

      const parsed = updateAnnouncementSchema.safeParse(request.body);

      if (!parsed.success) {
        throw new BadRequestException("Invalid announcement update.");
      }

      const result = await this.adminService.updateAnnouncement(
        announcementId,
        parsed.data,
        getCurrentUser(request),
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 35. DELETE ANNOUNCEMENT
  // ====================================================

  deleteAnnouncement: RequestHandler = asyncHandler(
    async (request, response) => {
      const announcementId = getId(request);

      const result = await this.adminService.deleteAnnouncement(
        announcementId,
        getCurrentUser(request),
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 36. GET AUDIT LOGS
  // ====================================================

  getAuditLogs: RequestHandler = asyncHandler(async (request, response) => {
    const filters = parseQuery(paginationSchema, request);

    const result = await this.adminService.getAuditLogs(
      filters,
      getCurrentUser(request),
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 37. ADMIN ACTIVITY SUMMARY
  // ====================================================

  getActivitySummary: RequestHandler = asyncHandler(
    async (request, response) => {
      const result = await this.adminService.getAdminActivitySummary(
        getCurrentUser(request),
      );

      response.status(200).json(result);
    },
  );
}

// ======================================================
// 38. DEFAULT EXPORT
// ======================================================

export default AdminController;
