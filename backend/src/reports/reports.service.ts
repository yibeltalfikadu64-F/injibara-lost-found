/**
 * Injibara Campus Lost & Found
 *
 * Reports Service
 *
 * Generates administrative analytics and personal reports
 * from existing PostgreSQL records through Prisma.
 */

import type { PrismaClient } from "../../generated/prisma/client.js";

import {
  ForbiddenException,
  NotFoundException,
} from "../common/filters/http-exception.filter.js";

import type { AuthenticatedUser } from "../common/decorators/current-user.decorator.js";

// ======================================================
// TYPES
// ======================================================

type ReportPeriod = "7d" | "30d" | "90d" | "365d" | "all";

interface ReportsServiceOptions {
  prisma: PrismaClient;
}

interface ItemReportFilters {
  page: number;
  limit: number;
  type?: "LOST" | "FOUND";
  status?: "OPEN" | "CLAIMED" | "RESOLVED" | "ARCHIVED";
  search?: string;
  startDate?: Date;
  endDate?: Date;
  sortOrder: "asc" | "desc";
}

// ======================================================
// HELPERS
// ======================================================

function requireAuthenticated(user: AuthenticatedUser): void {
  if (!user?.id || !user.isActive) {
    throw new ForbiddenException(
      "An active authenticated account is required.",
    );
  }
}

function requireAdmin(user: AuthenticatedUser): void {
  requireAuthenticated(user);

  if (user.role !== "ADMIN") {
    throw new ForbiddenException("Administrator access is required.");
  }
}

function getPeriodStart(period: ReportPeriod): Date | undefined {
  if (period === "all") return undefined;

  const days: Record<Exclude<ReportPeriod, "all">, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "365d": 365,
  };

  const date = new Date();
  date.setDate(date.getDate() - days[period]);

  return date;
}

function pagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

function dateRange(startDate?: Date, endDate?: Date) {
  if (!startDate && !endDate) return undefined;

  return {
    ...(startDate ? { gte: startDate } : {}),
    ...(endDate ? { lte: endDate } : {}),
  };
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// ======================================================
// REPORTS SERVICE
// ======================================================

export class ReportsService {
  private readonly prisma: PrismaClient;

  /*
   * The generated Prisma client is kept as the application's
   * configured client. The local db alias is used in query
   * construction to keep complex report query shapes flexible.
   */
  private get db(): any {
    return this.prisma;
  }

  constructor(options: ReportsServiceOptions) {
    this.prisma = options.prisma;
  }

  // ====================================================
  // 1. ADMIN DASHBOARD SUMMARY
  // ====================================================

  async getDashboardSummary(
    currentUser: AuthenticatedUser,
    period: ReportPeriod,
  ) {
    requireAdmin(currentUser);

    const startDate = getPeriodStart(period);
    const itemWhere = startDate ? { dateReported: { gte: startDate } } : {};
    const claimWhere = startDate ? { createdAt: { gte: startDate } } : {};

    const [
      totalUsers,
      activeUsers,
      totalItems,
      lostItems,
      foundItems,
      openItems,
      claimedItems,
      resolvedItems,
      archivedItems,
      pendingApproval,
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      completedClaims,
      totalCategories,
      totalLocations,
      recentItems,
      recentClaims,
    ] = await Promise.all([
      this.db.user.count(),
      this.db.user.count({ where: { isActive: true } }),
      this.db.item.count({ where: itemWhere }),
      this.db.item.count({ where: { ...itemWhere, type: "LOST" } }),
      this.db.item.count({ where: { ...itemWhere, type: "FOUND" } }),
      this.db.item.count({ where: { ...itemWhere, status: "OPEN" } }),
      this.db.item.count({ where: { ...itemWhere, status: "CLAIMED" } }),
      this.db.item.count({ where: { ...itemWhere, status: "RESOLVED" } }),
      this.db.item.count({ where: { ...itemWhere, status: "ARCHIVED" } }),
      this.db.item.count({
        where: { ...itemWhere, isApproved: false },
      }),
      this.db.claim.count({ where: claimWhere }),
      this.db.claim.count({ where: { ...claimWhere, status: "PENDING" } }),
      this.db.claim.count({ where: { ...claimWhere, status: "APPROVED" } }),
      this.db.claim.count({ where: { ...claimWhere, status: "REJECTED" } }),
      this.db.claim.count({ where: { ...claimWhere, status: "COMPLETED" } }),
      this.db.category.count({ where: { isActive: true } }),
      this.db.location.count({ where: { isActive: true } }),
      this.db.item.findMany({
        where: itemWhere,
        take: 5,
        orderBy: { dateReported: "desc" },
        include: {
          reporter: {
            select: { id: true, fullName: true },
          },
          category: true,
          location: true,
        },
      }),
      this.db.claim.findMany({
        where: claimWhere,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          claimant: {
            select: { id: true, fullName: true },
          },
          item: {
            select: { id: true, title: true, type: true },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        period,
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
        },
        items: {
          total: totalItems,
          lost: lostItems,
          found: foundItems,
          open: openItems,
          claimed: claimedItems,
          resolved: resolvedItems,
          archived: archivedItems,
          pendingApproval,
        },
        claims: {
          total: totalClaims,
          pending: pendingClaims,
          approved: approvedClaims,
          rejected: rejectedClaims,
          completed: completedClaims,
        },
        campus: {
          categories: totalCategories,
          locations: totalLocations,
        },
        recentItems,
        recentClaims,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  // ====================================================
  // 2. ITEM TYPE STATISTICS
  // ====================================================

  async getItemTypeStatistics(
    currentUser: AuthenticatedUser,
    period: ReportPeriod,
  ) {
    requireAdmin(currentUser);

    const startDate = getPeriodStart(period);
    const where = startDate ? { dateReported: { gte: startDate } } : {};

    const [lost, found] = await Promise.all([
      this.db.item.count({ where: { ...where, type: "LOST" } }),
      this.db.item.count({ where: { ...where, type: "FOUND" } }),
    ]);

    const total = lost + found;

    return {
      success: true,
      data: {
        period,
        total,
        lost,
        found,
        lostPercentage: total ? Number(((lost / total) * 100).toFixed(2)) : 0,
        foundPercentage: total ? Number(((found / total) * 100).toFixed(2)) : 0,
      },
    };
  }

  // ====================================================
  // 3. ITEM STATUS STATISTICS
  // ====================================================

  async getItemStatusStatistics(currentUser: AuthenticatedUser) {
    requireAdmin(currentUser);

    const statuses = ["OPEN", "CLAIMED", "RESOLVED", "ARCHIVED"] as const;

    const counts = await Promise.all(
      statuses.map((status) => this.db.item.count({ where: { status } })),
    );

    return {
      success: true,
      data: {
        total: counts.reduce((sum: number, count: number) => sum + count, 0),
        statuses: statuses.map((status, index) => ({
          status,
          count: counts[index],
        })),
      },
    };
  }

  // ====================================================
  // 4. CLAIM STATUS STATISTICS
  // ====================================================

  async getClaimStatusStatistics(currentUser: AuthenticatedUser) {
    requireAdmin(currentUser);

    const statuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "CANCELLED",
      "COMPLETED",
    ] as const;

    const counts = await Promise.all(
      statuses.map((status) => this.db.claim.count({ where: { status } })),
    );

    return {
      success: true,
      data: {
        total: counts.reduce((sum: number, count: number) => sum + count, 0),
        statuses: statuses.map((status, index) => ({
          status,
          count: counts[index],
        })),
      },
    };
  }

  // ====================================================
  // 5. MONTHLY ITEM ACTIVITY
  // ====================================================

  async getMonthlyItemActivity(currentUser: AuthenticatedUser, months: number) {
    requireAdmin(currentUser);

    const safeMonths = Math.min(36, Math.max(1, months));
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth() - safeMonths + 1,
      1,
    );

    const items = await this.db.item.findMany({
      where: { dateReported: { gte: start } },
      select: { dateReported: true, type: true },
      orderBy: { dateReported: "asc" },
    });

    const buckets = new Map<string, { lost: number; found: number }>();

    for (let offset = 0; offset < safeMonths; offset += 1) {
      const date = new Date(start.getFullYear(), start.getMonth() + offset, 1);
      buckets.set(monthKey(date), { lost: 0, found: 0 });
    }

    for (const item of items) {
      const key = monthKey(new Date(item.dateReported));
      const bucket = buckets.get(key);

      if (bucket) {
        if (item.type === "LOST") bucket.lost += 1;
        if (item.type === "FOUND") bucket.found += 1;
      }
    }

    return {
      success: true,
      data: Array.from(buckets.entries()).map(([month, values]) => ({
        month,
        ...values,
        total: values.lost + values.found,
      })),
    };
  }

  // ====================================================
  // 6. TOP CATEGORIES
  // ====================================================

  async getTopCategories(currentUser: AuthenticatedUser, limit: number) {
    requireAdmin(currentUser);

    const categories = await this.db.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        icon: true,
        _count: { select: { items: true } },
      },
    });

    const data = categories
      .map((category: any) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        itemCount: category._count.items,
      }))
      .sort((a: any, b: any) => b.itemCount - a.itemCount)
      .slice(0, Math.min(50, Math.max(1, limit)));

    return { success: true, data };
  }

  // ====================================================
  // 7. TOP LOCATIONS
  // ====================================================

  async getTopLocations(currentUser: AuthenticatedUser, limit: number) {
    requireAdmin(currentUser);

    const locations = await this.db.location.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        building: true,
        _count: { select: { items: true } },
      },
    });

    const data = locations
      .map((location: any) => ({
        id: location.id,
        name: location.name,
        building: location.building,
        itemCount: location._count.items,
      }))
      .sort((a: any, b: any) => b.itemCount - a.itemCount)
      .slice(0, Math.min(50, Math.max(1, limit)));

    return { success: true, data };
  }

  // ====================================================
  // 8. ADMIN ITEM REPORTS
  // ====================================================

  async getItemReports(
    filters: ItemReportFilters,
    currentUser: AuthenticatedUser,
  ) {
    requireAdmin(currentUser);

    const page = Math.max(1, filters.page);
    const limit = Math.min(100, Math.max(1, filters.limit));

    const where: any = {
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.startDate || filters.endDate
        ? { dateReported: dateRange(filters.startDate, filters.endDate) }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              {
                description: { contains: filters.search, mode: "insensitive" },
              },
              { brand: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.db.item.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { dateReported: filters.sortOrder },
        include: {
          reporter: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          category: true,
          location: true,
          _count: { select: { claims: true } },
        },
      }),
      this.db.item.count({ where }),
    ]);

    return {
      success: true,
      data: items,
      pagination: pagination(page, limit, total),
    };
  }

  // ====================================================
  // 9. ADMIN CLAIM REPORTS
  // ====================================================

  async getClaimReports(
    currentUser: AuthenticatedUser,
    startDate?: Date,
    endDate?: Date,
  ) {
    requireAdmin(currentUser);

    const where =
      startDate || endDate ? { createdAt: dateRange(startDate, endDate) } : {};

    const claims = await this.db.claim.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        claimant: {
          select: { id: true, fullName: true, email: true },
        },
        item: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
          },
        },
        reviewedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    return {
      success: true,
      data: claims,
      total: claims.length,
    };
  }

  // ====================================================
  // 10. PENDING ITEM APPROVALS
  // ====================================================

  async getPendingItemApprovals(
    currentUser: AuthenticatedUser,
    page: number,
    limit: number,
  ) {
    requireAdmin(currentUser);

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const where = { isApproved: false };

    const [items, total] = await Promise.all([
      this.db.item.findMany({
        where,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: { dateReported: "desc" },
        include: {
          reporter: {
            select: { id: true, fullName: true, email: true },
          },
          category: true,
          location: true,
        },
      }),
      this.db.item.count({ where }),
    ]);

    return {
      success: true,
      data: items,
      pagination: pagination(safePage, safeLimit, total),
    };
  }

  // ====================================================
  // 11. PERSONAL ITEM REPORTS
  // ====================================================

  async getMyItemReports(
    currentUser: AuthenticatedUser,
    page: number,
    limit: number,
    type?: "LOST" | "FOUND",
  ) {
    requireAuthenticated(currentUser);

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    const where = {
      reporterId: currentUser.id,
      ...(type ? { type } : {}),
    };

    const [items, total] = await Promise.all([
      this.db.item.findMany({
        where,
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: { dateReported: "desc" },
        include: {
          category: true,
          location: true,
          _count: { select: { claims: true } },
        },
      }),
      this.db.item.count({ where }),
    ]);

    return {
      success: true,
      data: items,
      pagination: pagination(safePage, safeLimit, total),
    };
  }

  // ====================================================
  // 12. PERSONAL ITEM SUMMARY
  // ====================================================

  async getMyItemReportSummary(currentUser: AuthenticatedUser) {
    requireAuthenticated(currentUser);

    const where = { reporterId: currentUser.id };

    const [
      total,
      lost,
      found,
      open,
      claimed,
      resolved,
      archived,
      pendingApproval,
    ] = await Promise.all([
      this.db.item.count({ where }),
      this.db.item.count({ where: { ...where, type: "LOST" } }),
      this.db.item.count({ where: { ...where, type: "FOUND" } }),
      this.db.item.count({ where: { ...where, status: "OPEN" } }),
      this.db.item.count({ where: { ...where, status: "CLAIMED" } }),
      this.db.item.count({ where: { ...where, status: "RESOLVED" } }),
      this.db.item.count({ where: { ...where, status: "ARCHIVED" } }),
      this.db.item.count({
        where: { ...where, isApproved: false },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        lost,
        found,
        open,
        claimed,
        resolved,
        archived,
        pendingApproval,
      },
    };
  }

  // ====================================================
  // 13. PERSONAL CLAIM SUMMARY
  // ====================================================

  async getMyClaimReportSummary(currentUser: AuthenticatedUser) {
    requireAuthenticated(currentUser);

    const where = { claimantId: currentUser.id };

    const [total, pending, approved, rejected, cancelled, completed] =
      await Promise.all([
        this.db.claim.count({ where }),
        this.db.claim.count({ where: { ...where, status: "PENDING" } }),
        this.db.claim.count({ where: { ...where, status: "APPROVED" } }),
        this.db.claim.count({ where: { ...where, status: "REJECTED" } }),
        this.db.claim.count({ where: { ...where, status: "CANCELLED" } }),
        this.db.claim.count({ where: { ...where, status: "COMPLETED" } }),
      ]);

    return {
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected,
        cancelled,
        completed,
      },
    };
  }

  // ====================================================
  // 14. PERSONAL ACTIVITY REPORT
  // ====================================================

  async getMyActivityReport(currentUser: AuthenticatedUser) {
    requireAuthenticated(currentUser);

    const [items, claims, itemCount, claimCount] = await Promise.all([
      this.db.item.findMany({
        where: { reporterId: currentUser.id },
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          createdAt: true,
        },
      }),
      this.db.claim.findMany({
        where: { claimantId: currentUser.id },
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          createdAt: true,
          item: {
            select: { id: true, title: true, type: true },
          },
        },
      }),
      this.db.item.count({ where: { reporterId: currentUser.id } }),
      this.db.claim.count({ where: { claimantId: currentUser.id } }),
    ]);

    const activity = [
      ...items.map((item: any) => ({
        activityType: "ITEM_REPORTED",
        id: item.id,
        title: item.title,
        status: item.status,
        itemType: item.type,
        createdAt: item.createdAt,
      })),
      ...claims.map((claim: any) => ({
        activityType: "CLAIM_SUBMITTED",
        id: claim.id,
        title: claim.item.title,
        status: claim.status,
        itemType: claim.item.type,
        createdAt: claim.createdAt,
      })),
    ].sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      success: true,
      data: {
        totalItemsReported: itemCount,
        totalClaimsSubmitted: claimCount,
        recentActivity: activity.slice(0, 15),
      },
    };
  }

  // ====================================================
  // 15. ADMIN USER STATISTICS
  // ====================================================

  async getUserStatistics(currentUser: AuthenticatedUser) {
    requireAdmin(currentUser);

    const roles = ["STUDENT", "STAFF", "SECURITY", "ADMIN"] as const;

    const [total, active, inactive, roleCounts, recentUsers] =
      await Promise.all([
        this.db.user.count(),
        this.db.user.count({ where: { isActive: true } }),
        this.db.user.count({ where: { isActive: false } }),
        Promise.all(
          roles.map((role) => this.db.user.count({ where: { role } })),
        ),
        this.db.user.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        }),
      ]);

    return {
      success: true,
      data: {
        total,
        active,
        inactive,
        roles: roles.map((role, index) => ({
          role,
          count: roleCounts[index],
        })),
        recentUsers,
      },
    };
  }

  // ====================================================
  // 16. ITEM REPORT DETAILS
  // ====================================================

  async getItemReportById(itemId: string, currentUser: AuthenticatedUser) {
    requireAuthenticated(currentUser);

    const item = await this.db.item.findUnique({
      where: { id: itemId },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        category: true,
        location: true,
        claims: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            claimant: {
              select: { id: true, fullName: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { claims: true } },
      },
    });

    if (!item) {
      throw new NotFoundException("Item report not found.");
    }

    const isAdmin = currentUser.role === "ADMIN";
    const isOwner = item.reporterId === currentUser.id;

    if (!isAdmin && !isOwner && !item.isApproved) {
      throw new NotFoundException("Item report not found.");
    }

    return {
      success: true,
      data: item,
    };
  }

  // ====================================================
  // 17. REPORT METADATA
  // ====================================================

  async getReportMetadata(currentUser: AuthenticatedUser) {
    requireAdmin(currentUser);

    const [categories, locations] = await Promise.all([
      this.db.category.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      this.db.location.findMany({
        where: { isActive: true },
        select: { id: true, name: true, building: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      success: true,
      data: {
        itemTypes: ["LOST", "FOUND"],
        itemStatuses: ["OPEN", "CLAIMED", "RESOLVED", "ARCHIVED"],
        claimStatuses: [
          "PENDING",
          "APPROVED",
          "REJECTED",
          "CANCELLED",
          "COMPLETED",
        ],
        reportPeriods: ["7d", "30d", "90d", "365d", "all"],
        categories,
        locations,
      },
    };
  }
}

export default ReportsService;
