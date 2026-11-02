/**
 * Injibara Campus Lost & Found
 *
 * Reports Controller
 *
 * Exposes administrative analytics and personal reports.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

import { z } from "zod";

import { ReportsService } from "./reports.service.js";

import {
  BadRequestException,
  UnauthorizedException,
} from "../common/filters/http-exception.filter.js";

// ======================================================
// 1. REPORT PERIOD SCHEMA
// ======================================================

const reportPeriodSchema = z.enum(["7d", "30d", "90d", "365d", "all"]);

// ======================================================
// 2. REPORT ITEM FILTER SCHEMA
// ======================================================

export const reportItemQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  type: z.enum(["LOST", "FOUND"]).optional(),

  status: z.enum(["OPEN", "CLAIMED", "RESOLVED", "ARCHIVED"]).optional(),

  search: z.string().trim().max(150).optional(),

  startDate: z.iso.datetime().optional(),

  endDate: z.iso.datetime().optional(),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ======================================================
// 3. REPORT PAGINATION SCHEMA
// ======================================================

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),
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
// 6. UUID PARAMETER
// ======================================================

function getItemId(request: Request): string {
  const result = z.uuid().safeParse(request.params.id);

  if (!result.success) {
    throw new BadRequestException("Invalid item ID.");
  }

  return result.data;
}

// ======================================================
// 7. QUERY NUMBER HELPER
// ======================================================

function getNumberQuery(
  value: unknown,
  fallback: number,
  maximum: number,
): number {
  const result = z.coerce.number().int().min(1).max(maximum).safeParse(value);

  return result.success ? result.data : fallback;
}

// ======================================================
// 8. REPORTS CONTROLLER
// ======================================================

export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ====================================================
  // 9. ADMIN DASHBOARD SUMMARY
  // ====================================================

  getDashboardSummary: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const periodResult = reportPeriodSchema.safeParse(
        request.query.period ?? "30d",
      );

      if (!periodResult.success) {
        throw new BadRequestException("Invalid report period.");
      }

      const result = await this.reportsService.getDashboardSummary(
        currentUser,
        periodResult.data,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 10. ITEM TYPE STATISTICS
  // ====================================================

  getItemTypeStatistics: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const periodResult = reportPeriodSchema.safeParse(
        request.query.period ?? "all",
      );

      if (!periodResult.success) {
        throw new BadRequestException("Invalid report period.");
      }

      const result = await this.reportsService.getItemTypeStatistics(
        currentUser,
        periodResult.data,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 11. ITEM STATUS STATISTICS
  // ====================================================

  getItemStatusStatistics: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const result =
        await this.reportsService.getItemStatusStatistics(currentUser);

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 12. CLAIM STATUS STATISTICS
  // ====================================================

  getClaimStatusStatistics: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const result =
        await this.reportsService.getClaimStatusStatistics(currentUser);

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 13. MONTHLY ITEM ACTIVITY
  // ====================================================

  getMonthlyItemActivity: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const months = getNumberQuery(request.query.months, 12, 36);

      const result = await this.reportsService.getMonthlyItemActivity(
        currentUser,
        months,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 14. TOP CATEGORIES
  // ====================================================

  getTopCategories: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const limit = getNumberQuery(request.query.limit, 10, 50);

    const result = await this.reportsService.getTopCategories(
      currentUser,
      limit,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 15. TOP LOCATIONS
  // ====================================================

  getTopLocations: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const limit = getNumberQuery(request.query.limit, 10, 50);

    const result = await this.reportsService.getTopLocations(
      currentUser,
      limit,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 16. ADMIN ITEM REPORTS
  // ====================================================

  getItemReports: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const parsed = reportItemQuerySchema.safeParse(request.query);

    if (!parsed.success) {
      throw new BadRequestException("Invalid item report filters.");
    }

    const result = await this.reportsService.getItemReports(
      {
        ...parsed.data,

        startDate: parsed.data.startDate
          ? new Date(parsed.data.startDate)
          : undefined,

        endDate: parsed.data.endDate
          ? new Date(parsed.data.endDate)
          : undefined,
      },
      currentUser,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 17. ADMIN CLAIM REPORTS
  // ====================================================

  getClaimReports: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const startDateResult = z.iso
      .datetime()
      .optional()
      .safeParse(request.query.startDate);

    const endDateResult = z.iso
      .datetime()
      .optional()
      .safeParse(request.query.endDate);

    if (!startDateResult.success || !endDateResult.success) {
      throw new BadRequestException("Invalid claim report date range.");
    }

    const startDate = startDateResult.data
      ? new Date(startDateResult.data)
      : undefined;

    const endDate = endDateResult.data
      ? new Date(endDateResult.data)
      : undefined;

    const result = await this.reportsService.getClaimReports(
      currentUser,
      startDate,
      endDate,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 18. PENDING ITEM APPROVAL REPORT
  // ====================================================

  getPendingItemApprovals: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const parsed = paginationSchema.safeParse(request.query);

      if (!parsed.success) {
        throw new BadRequestException("Invalid pagination parameters.");
      }

      const result = await this.reportsService.getPendingItemApprovals(
        currentUser,
        parsed.data.page,
        parsed.data.limit,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 19. USER ITEM REPORTS
  // ====================================================

  getMyItemReports: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const parsed = z
      .object({
        page: z.coerce.number().int().min(1).default(1),

        limit: z.coerce.number().int().min(1).max(100).default(20),

        type: z.enum(["LOST", "FOUND"]).optional(),
      })
      .safeParse(request.query);

    if (!parsed.success) {
      throw new BadRequestException("Invalid personal report filters.");
    }

    const result = await this.reportsService.getMyItemReports(
      currentUser,
      parsed.data.page,
      parsed.data.limit,
      parsed.data.type,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 20. USER ITEM SUMMARY
  // ====================================================

  getMyItemReportSummary: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const result =
        await this.reportsService.getMyItemReportSummary(currentUser);

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 21. USER CLAIM SUMMARY
  // ====================================================

  getMyClaimReportSummary: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const result =
        await this.reportsService.getMyClaimReportSummary(currentUser);

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 22. USER ACTIVITY REPORT
  // ====================================================

  getMyActivityReport: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const result = await this.reportsService.getMyActivityReport(currentUser);

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 23. ADMIN USER STATISTICS
  // ====================================================

  getUserStatistics: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const result = await this.reportsService.getUserStatistics(currentUser);

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 24. ITEM REPORT DETAILS
  // ====================================================

  getItemReportById: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const itemId = getItemId(request);

      const result = await this.reportsService.getItemReportById(
        itemId,
        currentUser,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 25. REPORT METADATA
  // ====================================================

  getReportMetadata: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const result = await this.reportsService.getReportMetadata(currentUser);

      response.status(200).json(result);
    },
  );
}

// ======================================================
// 26. DEFAULT EXPORT
// ======================================================

export default ReportsController;
