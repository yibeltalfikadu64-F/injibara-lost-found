/**
 * Injibara Campus Lost & Found
 *
 * AUDIT SERVICE
 *
 * Responsibilities:
 * - Record user and administrator activities.
 * - Record authentication events.
 * - Record item and claim activities.
 * - Record administrative changes.
 * - Retrieve audit history.
 * - Search and filter audit records.
 * - Provide audit statistics.
 *
 * Uses the existing Prisma AuditLog model.
 */

import type { Prisma, PrismaClient } from "../../generated/prisma/client.js";

import { BadRequestException } from "../common/filters/http-exception.filter.js";

// ======================================================
// 1. AUDIT ACTION TYPES
// ======================================================

export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "APPROVE"
  | "REJECT"
  | "HANDOVER"
  | "ROLE_CHANGE";

// ======================================================
// 2. AUDIT ENTITY TYPES
// ======================================================

export type AuditEntityType =
  | "User"
  | "Item"
  | "Claim"
  | "Category"
  | "Location"
  | "Announcement"
  | "Notification"
  | "Upload"
  | "Authentication"
  | "System"
  | "Other";

// ======================================================
// 3. CREATE AUDIT INPUT
// ======================================================

export interface CreateAuditLogInput {
  action: AuditActionType;
  entity: string;
  entityId?: string | null;
  actorId?: string | null;
  description?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}

// ======================================================
// 4. AUDIT SEARCH OPTIONS
// ======================================================

export interface AuditSearchOptions {
  page?: number;
  limit?: number;
  action?: AuditActionType;
  entity?: string;
  entityId?: string;
  actorId?: string;
  search?: string;
  from?: Date;
  to?: Date;
  sortOrder?: "asc" | "desc";
}

// ======================================================
// 5. PAGINATION RESPONSE
// ======================================================

export interface AuditPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ======================================================
// 6. NORMALIZE PAGINATION
// ======================================================

function normalizePagination(options: AuditSearchOptions) {
  const page = Math.max(1, Math.floor(options.page ?? 1));

  const limit = Math.min(100, Math.max(1, Math.floor(options.limit ?? 20)));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sortOrder: options.sortOrder ?? "desc",
  };
}

// ======================================================
// 7. BUILD PAGINATION
// ======================================================

function buildPagination(
  page: number,
  limit: number,
  total: number,
): AuditPagination {
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

// ======================================================
// 8. AUDIT SERVICE OPTIONS
// ======================================================

export interface AuditServiceOptions {
  prisma: PrismaClient;
}

// ======================================================
// 9. AUDIT SERVICE
// ======================================================

export class AuditService {
  private readonly prisma: PrismaClient;

  constructor(options: AuditServiceOptions) {
    this.prisma = options.prisma;
  }

  // ====================================================
  // 10. CREATE AUDIT LOG
  // ====================================================

  async createLog(input: CreateAuditLogInput) {
    if (!input.action || !input.entity) {
      throw new BadRequestException("Audit action and entity are required.");
    }

    const entity = input.entity.trim();

    if (entity.length < 1 || entity.length > 100) {
      throw new BadRequestException("Invalid audit entity.");
    }

    const description = input.description?.trim() || null;

    if (description && description.length > 2000) {
      throw new BadRequestException("Audit description is too long.");
    }

    const record = await this.prisma.auditLog.create({
      data: {
        action: input.action,
        entity,
        entityId: input.entityId ?? null,
        actorId: input.actorId ?? null,
        description,
        metadata: input.metadata,
        ipAddress: input.ipAddress ?? null,
      },
    });

    return record;
  }

  // ====================================================
  // 11. RECORD LOGIN
  // ====================================================

  async recordLogin(
    userId: string,
    ipAddress?: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.createLog({
      action: "LOGIN",
      entity: "Authentication",
      entityId: userId,
      actorId: userId,
      description: "User logged in.",
      ipAddress,
      metadata,
    });
  }

  // ====================================================
  // 12. RECORD LOGOUT
  // ====================================================

  async recordLogout(userId: string, ipAddress?: string) {
    return this.createLog({
      action: "LOGOUT",
      entity: "Authentication",
      entityId: userId,
      actorId: userId,
      description: "User logged out.",
      ipAddress,
    });
  }

  // ====================================================
  // 13. RECORD ITEM CREATION
  // ====================================================

  async recordItemCreated(userId: string, itemId: string, ipAddress?: string) {
    return this.createLog({
      action: "CREATE",
      entity: "Item",
      entityId: itemId,
      actorId: userId,
      description: "A new item report was created.",
      ipAddress,
    });
  }

  // ====================================================
  // 14. RECORD ITEM UPDATE
  // ====================================================

  async recordItemUpdated(
    userId: string,
    itemId: string,
    changedFields: string[],
    ipAddress?: string,
  ) {
    return this.createLog({
      action: "UPDATE",
      entity: "Item",
      entityId: itemId,
      actorId: userId,
      description: "An item report was updated.",
      ipAddress,
      metadata: {
        changedFields,
      },
    });
  }

  // ====================================================
  // 15. RECORD ITEM DELETION
  // ====================================================

  async recordItemDeleted(userId: string, itemId: string, ipAddress?: string) {
    return this.createLog({
      action: "DELETE",
      entity: "Item",
      entityId: itemId,
      actorId: userId,
      description: "An item report was deleted.",
      ipAddress,
    });
  }

  // ====================================================
  // 16. RECORD ITEM APPROVAL
  // ====================================================

  async recordItemApproved(
    adminId: string,
    itemId: string,
    ipAddress?: string,
  ) {
    return this.createLog({
      action: "APPROVE",
      entity: "Item",
      entityId: itemId,
      actorId: adminId,
      description: "An administrator approved an item.",
      ipAddress,
    });
  }

  // ====================================================
  // 17. RECORD ITEM REJECTION
  // ====================================================

  async recordItemRejected(
    adminId: string,
    itemId: string,
    reason: string,
    ipAddress?: string,
  ) {
    return this.createLog({
      action: "REJECT",
      entity: "Item",
      entityId: itemId,
      actorId: adminId,
      description: "An administrator rejected an item.",
      ipAddress,
      metadata: {
        reason,
      },
    });
  }

  // ====================================================
  // 18. RECORD CLAIM CREATION
  // ====================================================

  async recordClaimCreated(
    userId: string,
    claimId: string,
    itemId: string,
    ipAddress?: string,
  ) {
    return this.createLog({
      action: "CREATE",
      entity: "Claim",
      entityId: claimId,
      actorId: userId,
      description: "A claim was submitted.",
      ipAddress,
      metadata: {
        itemId,
      },
    });
  }

  // ====================================================
  // 19. RECORD CLAIM APPROVAL
  // ====================================================

  async recordClaimApproved(
    adminId: string,
    claimId: string,
    ipAddress?: string,
  ) {
    return this.createLog({
      action: "APPROVE",
      entity: "Claim",
      entityId: claimId,
      actorId: adminId,
      description: "A claim was approved.",
      ipAddress,
    });
  }

  // ====================================================
  // 20. RECORD CLAIM REJECTION
  // ====================================================

  async recordClaimRejected(
    adminId: string,
    claimId: string,
    reason: string,
    ipAddress?: string,
  ) {
    return this.createLog({
      action: "REJECT",
      entity: "Claim",
      entityId: claimId,
      actorId: adminId,
      description: "A claim was rejected.",
      ipAddress,
      metadata: {
        reason,
      },
    });
  }

  // ====================================================
  // 21. RECORD HANDOVER
  // ====================================================

  async recordHandover(
    securityUserId: string,
    claimId: string,
    ipAddress?: string,
  ) {
    return this.createLog({
      action: "HANDOVER",
      entity: "Claim",
      entityId: claimId,
      actorId: securityUserId,
      description: "An item handover was verified.",
      ipAddress,
    });
  }

  // ====================================================
  // 22. RECORD ROLE CHANGE
  // ====================================================

  async recordRoleChange(
    adminId: string,
    targetUserId: string,
    previousRole: string,
    newRole: string,
    ipAddress?: string,
  ) {
    return this.createLog({
      action: "ROLE_CHANGE",
      entity: "User",
      entityId: targetUserId,
      actorId: adminId,
      description: "A user role was changed.",
      ipAddress,
      metadata: {
        previousRole,
        newRole,
      },
    });
  }

  // ====================================================
  // 23. RECORD ANNOUNCEMENT CREATION
  // ====================================================

  async recordAnnouncementCreated(
    adminId: string,
    announcementId: string,
    ipAddress?: string,
  ) {
    return this.createLog({
      action: "CREATE",
      entity: "Announcement",
      entityId: announcementId,
      actorId: adminId,
      description: "An announcement was created.",
      ipAddress,
    });
  }

  // ====================================================
  // 24. RECORD GENERIC UPDATE
  // ====================================================

  async recordUpdate(
    actorId: string | null,
    entity: string,
    entityId: string,
    description: string,
    metadata?: Prisma.InputJsonValue,
    ipAddress?: string,
  ) {
    return this.createLog({
      action: "UPDATE",
      entity,
      entityId,
      actorId,
      description,
      metadata,
      ipAddress,
    });
  }

  // ====================================================
  // 25. RECORD GENERIC DELETE
  // ====================================================

  async recordDelete(
    actorId: string | null,
    entity: string,
    entityId: string,
    description: string,
    ipAddress?: string,
  ) {
    return this.createLog({
      action: "DELETE",
      entity,
      entityId,
      actorId,
      description,
      ipAddress,
    });
  }

  // ====================================================
  // 26. GET AUDIT LOG BY ID
  // ====================================================

  async getLogById(logId: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: {
        id: logId,
      },

      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      return null;
    }

    return log;
  }

  // ====================================================
  // 27. SEARCH AUDIT LOGS
  // ====================================================

  async searchLogs(options: AuditSearchOptions = {}) {
    const pagination = normalizePagination(options);

    if (options.from && options.to && options.from > options.to) {
      throw new BadRequestException(
        "The start date must be before the end date.",
      );
    }

    const createdAt: Prisma.DateTimeFilter = {};

    if (options.from) {
      createdAt.gte = options.from;
    }

    if (options.to) {
      createdAt.lte = options.to;
    }

    const where: Prisma.AuditLogWhereInput = {
      ...(options.action
        ? {
            action: options.action,
          }
        : {}),

      ...(options.entity
        ? {
            entity: options.entity,
          }
        : {}),

      ...(options.entityId
        ? {
            entityId: options.entityId,
          }
        : {}),

      ...(options.actorId
        ? {
            actorId: options.actorId,
          }
        : {}),

      ...(options.from || options.to
        ? {
            createdAt,
          }
        : {}),

      ...(options.search
        ? {
            OR: [
              {
                entity: {
                  contains: options.search,
                  mode: "insensitive",
                },
              },

              {
                description: {
                  contains: options.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,

        include: {
          actor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },

        skip: pagination.skip,
        take: pagination.limit,

        orderBy: {
          createdAt: pagination.sortOrder,
        },
      }),

      this.prisma.auditLog.count({
        where,
      }),
    ]);

    return {
      success: true as const,
      data: logs,

      pagination: buildPagination(pagination.page, pagination.limit, total),
    };
  }

  // ====================================================
  // 28. GET LOGS FOR A USER
  // ====================================================

  async getUserActivity(userId: string, page = 1, limit = 20) {
    return this.searchLogs({
      actorId: userId,
      page,
      limit,
    });
  }

  // ====================================================
  // 29. GET LOGS FOR AN ENTITY
  // ====================================================

  async getEntityActivity(
    entity: string,
    entityId: string,
    page = 1,
    limit = 20,
  ) {
    return this.searchLogs({
      entity,
      entityId,
      page,
      limit,
    });
  }

  // ====================================================
  // 30. GET RECENT ACTIVITY
  // ====================================================

  async getRecentActivity(limit = 10) {
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const logs = await this.prisma.auditLog.findMany({
      take: safeLimit,

      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true as const,
      data: logs,
    };
  }

  // ====================================================
  // 31. GET AUDIT STATISTICS
  // ====================================================

  async getStatistics() {
    const [
      total,
      created,
      updated,
      deleted,
      logins,
      logouts,
      approvals,
      rejections,
      handovers,
      roleChanges,
    ] = await Promise.all([
      this.prisma.auditLog.count(),

      this.prisma.auditLog.count({
        where: {
          action: "CREATE",
        },
      }),

      this.prisma.auditLog.count({
        where: {
          action: "UPDATE",
        },
      }),

      this.prisma.auditLog.count({
        where: {
          action: "DELETE",
        },
      }),

      this.prisma.auditLog.count({
        where: {
          action: "LOGIN",
        },
      }),

      this.prisma.auditLog.count({
        where: {
          action: "LOGOUT",
        },
      }),

      this.prisma.auditLog.count({
        where: {
          action: "APPROVE",
        },
      }),

      this.prisma.auditLog.count({
        where: {
          action: "REJECT",
        },
      }),

      this.prisma.auditLog.count({
        where: {
          action: "HANDOVER",
        },
      }),

      this.prisma.auditLog.count({
        where: {
          action: "ROLE_CHANGE",
        },
      }),
    ]);

    return {
      success: true as const,

      data: {
        total,
        created,
        updated,
        deleted,
        logins,
        logouts,
        approvals,
        rejections,
        handovers,
        roleChanges,
      },
    };
  }

  // ====================================================
  // 32. GET DAILY ACTIVITY
  // ====================================================

  async getDailyActivity(days = 7) {
    const safeDays = Math.min(90, Math.max(1, Math.floor(days)));

    const startDate = new Date();

    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (safeDays - 1));

    const logs = await this.prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },

      select: {
        action: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

    const grouped = new Map<string, Record<string, number>>();

    for (let index = 0; index < safeDays; index++) {
      const date = new Date(startDate);

      date.setDate(startDate.getDate() + index);

      const key = date.toISOString().slice(0, 10);

      grouped.set(key, {
        CREATE: 0,
        UPDATE: 0,
        DELETE: 0,
        LOGIN: 0,
        LOGOUT: 0,
        APPROVE: 0,
        REJECT: 0,
        HANDOVER: 0,
        ROLE_CHANGE: 0,
      });
    }

    for (const log of logs) {
      const key = log.createdAt.toISOString().slice(0, 10);

      const day = grouped.get(key);

      if (day) {
        day[log.action] = (day[log.action] ?? 0) + 1;
      }
    }

    return {
      success: true as const,

      data: Array.from(grouped.entries()).map(([date, actions]) => ({
        date,
        ...actions,
      })),
    };
  }
}

// ======================================================
// 33. DEFAULT EXPORT
// ======================================================

export default AuditService;
