/**
 * Injibara Campus Lost & Found
 *
 * ADMIN SERVICE
 *
 * Central administration service.
 *
 * Responsibilities:
 * - Dashboard analytics
 * - User management
 * - User role management
 * - Account activation and deactivation
 * - Lost and found item moderation
 * - Item approval and rejection
 * - Claim monitoring
 * - Announcement management
 * - Audit log management
 *
 * Database:
 * - User
 * - Item
 * - Claim
 * - Category
 * - Location
 * - Announcement
 * - AuditLog
 */

import type { PrismaClient, Prisma } from "../../generated/prisma/client.js";

import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from "../common/filters/http-exception.filter.js";

import type { AuthenticatedUser } from "../common/decorators/current-user.decorator.js";

// ======================================================
// 1. SERVICE CONFIGURATION
// ======================================================

export interface AdminServiceOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. USER ROLE TYPES
// ======================================================

export type AdminManagedRole = "STUDENT" | "STAFF" | "SECURITY" | "ADMIN";

// ======================================================
// 3. ITEM STATUS TYPES
// ======================================================

export type AdminItemStatus = "OPEN" | "CLAIMED" | "RESOLVED" | "ARCHIVED";

// ======================================================
// 4. CLAIM STATUS TYPES
// ======================================================

export type AdminClaimStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

// ======================================================
// 5. PAGINATION OPTIONS
// ======================================================

export interface AdminPaginationOptions {
  page: number;
  limit: number;
  search?: string;
  sortOrder?: "asc" | "desc";
}

// ======================================================
// 6. USER FILTER OPTIONS
// ======================================================

export interface AdminUserFilterOptions extends AdminPaginationOptions {
  role?: AdminManagedRole;
  isActive?: boolean;
  department?: string;
}

// ======================================================
// 7. ITEM FILTER OPTIONS
// ======================================================

export interface AdminItemFilterOptions extends AdminPaginationOptions {
  type?: "LOST" | "FOUND";
  status?: AdminItemStatus;
  isApproved?: boolean;
  categoryId?: string;
  locationId?: string;
}

// ======================================================
// 8. CLAIM FILTER OPTIONS
// ======================================================

export interface AdminClaimFilterOptions extends AdminPaginationOptions {
  status?: AdminClaimStatus;
}

// ======================================================
// 9. ANNOUNCEMENT INPUT
// ======================================================

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  isPublished?: boolean;
}

// ======================================================
// 10. ANNOUNCEMENT UPDATE INPUT
// ======================================================

export interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  isPublished?: boolean;
}

// ======================================================
// 11. PAGINATION RESULT
// ======================================================

export interface AdminPaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function createPagination(
  page: number,
  limit: number,
  total: number,
): AdminPaginationResult {
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
// 12. NORMALIZE PAGINATION
// ======================================================

function normalizePagination(options: AdminPaginationOptions) {
  const page = Math.max(1, Math.floor(options.page || 1));

  const limit = Math.min(100, Math.max(1, Math.floor(options.limit || 20)));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sortOrder: options.sortOrder ?? "desc",
  };
}

// ======================================================
// 13. AUTHENTICATION CHECK
// ======================================================

function ensureAuthenticated(user: AuthenticatedUser): void {
  if (!user?.id) {
    throw new ForbiddenException("Authentication is required.");
  }
}

// ======================================================
// 14. ADMIN AUTHORIZATION
// ======================================================

function ensureAdmin(user: AuthenticatedUser): void {
  ensureAuthenticated(user);

  if (user.role !== "ADMIN") {
    throw new ForbiddenException(
      "Only administrators can perform this operation.",
    );
  }
}

// ======================================================
// 15. PUBLIC USER SELECT
// ======================================================

const adminUserSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  studentId: true,
  department: true,
  phone: true,
  avatarUrl: true,
  isActive: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

// ======================================================
// 16. ADMIN ITEM SELECT
// ======================================================

const adminItemSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  status: true,
  dateOccurred: true,
  dateReported: true,
  color: true,
  brand: true,
  identifyingFeatures: true,
  imageUrls: true,
  isApproved: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,

  reporter: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  },

  category: {
    select: {
      id: true,
      name: true,
      icon: true,
    },
  },

  location: {
    select: {
      id: true,
      name: true,
      building: true,
    },
  },

  _count: {
    select: {
      claims: true,
    },
  },
} satisfies Prisma.ItemSelect;

// ======================================================
// 17. ADMIN SERVICE
// ======================================================

export class AdminService {
  private readonly prisma: PrismaClient;

  constructor(options: AdminServiceOptions) {
    this.prisma = options.prisma;
  }

  // ====================================================
  // 18. DASHBOARD SUMMARY
  // ====================================================

  async getDashboardSummary(currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalStudents,
      totalStaff,
      totalSecurity,
      totalAdmins,

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
      totalAnnouncements,
      publishedAnnouncements,
    ] = await Promise.all([
      this.prisma.user.count(),

      this.prisma.user.count({
        where: {
          isActive: true,
        },
      }),

      this.prisma.user.count({
        where: {
          isActive: false,
        },
      }),

      this.prisma.user.count({
        where: {
          role: "STUDENT",
        },
      }),

      this.prisma.user.count({
        where: {
          role: "STAFF",
        },
      }),

      this.prisma.user.count({
        where: {
          role: "SECURITY",
        },
      }),

      this.prisma.user.count({
        where: {
          role: "ADMIN",
        },
      }),

      this.prisma.item.count(),

      this.prisma.item.count({
        where: {
          type: "LOST",
        },
      }),

      this.prisma.item.count({
        where: {
          type: "FOUND",
        },
      }),

      this.prisma.item.count({
        where: {
          status: "OPEN",
        },
      }),

      this.prisma.item.count({
        where: {
          status: "CLAIMED",
        },
      }),

      this.prisma.item.count({
        where: {
          status: "RESOLVED",
        },
      }),

      this.prisma.item.count({
        where: {
          status: "ARCHIVED",
        },
      }),

      this.prisma.item.count({
        where: {
          isApproved: false,
        },
      }),

      this.prisma.claim.count(),

      this.prisma.claim.count({
        where: {
          status: "PENDING",
        },
      }),

      this.prisma.claim.count({
        where: {
          status: "APPROVED",
        },
      }),

      this.prisma.claim.count({
        where: {
          status: "REJECTED",
        },
      }),

      this.prisma.claim.count({
        where: {
          status: "COMPLETED",
        },
      }),

      this.prisma.category.count(),

      this.prisma.location.count(),

      this.prisma.announcement.count(),

      this.prisma.announcement.count({
        where: {
          isPublished: true,
        },
      }),
    ]);

    return {
      success: true as const,

      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          students: totalStudents,
          staff: totalStaff,
          security: totalSecurity,
          admins: totalAdmins,
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

        announcements: {
          total: totalAnnouncements,
          published: publishedAnnouncements,
        },

        generatedAt: new Date().toISOString(),
      },
    };
  }

  // ====================================================
  // 19. RECENT USERS
  // ====================================================

  async getRecentUsers(currentUser: AuthenticatedUser, limit = 10) {
    ensureAdmin(currentUser);

    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const users = await this.prisma.user.findMany({
      select: adminUserSelect,

      take: safeLimit,

      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true as const,
      data: users,
    };
  }

  // ====================================================
  // 20. RECENT ITEMS
  // ====================================================

  async getRecentItems(currentUser: AuthenticatedUser, limit = 10) {
    ensureAdmin(currentUser);

    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const items = await this.prisma.item.findMany({
      select: adminItemSelect,

      take: safeLimit,

      orderBy: {
        dateReported: "desc",
      },
    });

    return {
      success: true as const,
      data: items,
    };
  }

  // ====================================================
  // 21. RECENT CLAIMS
  // ====================================================

  async getRecentClaims(currentUser: AuthenticatedUser, limit = 10) {
    ensureAdmin(currentUser);

    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const claims = await this.prisma.claim.findMany({
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        handoverVerifiedAt: true,

        claimant: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },

        item: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
          },
        },
      },

      take: safeLimit,

      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true as const,
      data: claims,
    };
  }

  // ====================================================
  // 22. LIST USERS
  // ====================================================

  async getUsers(
    options: AdminUserFilterOptions,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const pagination = normalizePagination(options);

    const where: Prisma.UserWhereInput = {
      ...(options.role
        ? {
            role: options.role,
          }
        : {}),

      ...(options.isActive !== undefined
        ? {
            isActive: options.isActive,
          }
        : {}),

      ...(options.department
        ? {
            department: {
              contains: options.department,
              mode: "insensitive",
            },
          }
        : {}),

      ...(options.search
        ? {
            OR: [
              {
                fullName: {
                  contains: options.search,
                  mode: "insensitive",
                },
              },

              {
                email: {
                  contains: options.search,
                  mode: "insensitive",
                },
              },

              {
                studentId: {
                  contains: options.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: adminUserSelect,
        skip: pagination.skip,
        take: pagination.limit,

        orderBy: {
          createdAt: pagination.sortOrder,
        },
      }),

      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      success: true as const,
      data: users,

      pagination: createPagination(pagination.page, pagination.limit, total),
    };
  }

  // ====================================================
  // 23. GET USER DETAILS
  // ====================================================

  async getUserDetails(userId: string, currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        ...adminUserSelect,

        _count: {
          select: {
            reportedItems: true,
            claims: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found.");
    }

    return {
      success: true as const,
      data: user,
    };
  }

  // ====================================================
  // 24. CHANGE USER ROLE
  // ====================================================

  async changeUserRole(
    userId: string,
    newRole: AdminManagedRole,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    if (userId === currentUser.id) {
      throw new ForbiddenException(
        "You cannot change your own administrator role.",
      );
    }

    const targetUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException("User not found.");
    }

    if (targetUser.role === newRole) {
      throw new BadRequestException("The user already has this role.");
    }

    // Prevent removing the final active administrator.
    if (
      targetUser.role === "ADMIN" &&
      newRole !== "ADMIN" &&
      targetUser.isActive
    ) {
      const activeAdminCount = await this.prisma.user.count({
        where: {
          role: "ADMIN",
          isActive: true,
        },
      });

      if (activeAdminCount <= 1) {
        throw new ForbiddenException(
          "The final active administrator cannot be demoted.",
        );
      }
    }

    const updatedUser = await this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.user.update({
        where: {
          id: userId,
        },

        data: {
          role: newRole,
        },

        select: adminUserSelect,
      });

      await transaction.auditLog.create({
        data: {
          action: "ROLE_CHANGE",
          entity: "User",
          entityId: userId,
          actorId: currentUser.id,
          description: `User role changed from ${targetUser.role} to ${newRole}.`,
          metadata: {
            previousRole: targetUser.role,
            newRole,
          },
        },
      });

      return updated;
    });

    return {
      success: true as const,
      message: "User role updated successfully.",
      data: updatedUser,
    };
  }

  // ====================================================
  // 25. ACTIVATE USER
  // ====================================================

  async activateUser(userId: string, currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const target = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        isActive: true,
      },
    });

    if (!target) {
      throw new NotFoundException("User not found.");
    }

    if (target.isActive) {
      throw new BadRequestException("User account is already active.");
    }

    const updated = await this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.update({
        where: {
          id: userId,
        },

        data: {
          isActive: true,
        },

        select: adminUserSelect,
      });

      await transaction.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "User",
          entityId: userId,
          actorId: currentUser.id,
          description: "Administrator activated a user account.",
        },
      });

      return user;
    });

    return {
      success: true as const,
      message: "User account activated.",
      data: updated,
    };
  }

  // ====================================================
  // 26. DEACTIVATE USER
  // ====================================================

  async deactivateUser(userId: string, currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    if (userId === currentUser.id) {
      throw new ForbiddenException("You cannot deactivate your own account.");
    }

    const target = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!target) {
      throw new NotFoundException("User not found.");
    }

    if (!target.isActive) {
      throw new BadRequestException("User account is already inactive.");
    }

    if (target.role === "ADMIN") {
      const activeAdminCount = await this.prisma.user.count({
        where: {
          role: "ADMIN",
          isActive: true,
        },
      });

      if (activeAdminCount <= 1) {
        throw new ForbiddenException(
          "The final active administrator cannot be deactivated.",
        );
      }
    }

    const updated = await this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.update({
        where: {
          id: userId,
        },

        data: {
          isActive: false,
        },

        select: adminUserSelect,
      });

      await transaction.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "User",
          entityId: userId,
          actorId: currentUser.id,
          description: "Administrator deactivated a user account.",
        },
      });

      return user;
    });

    return {
      success: true as const,
      message: "User account deactivated.",
      data: updated,
    };
  }

  // ====================================================
  // 27. ITEM MODERATION LIST
  // ====================================================

  async getItems(
    options: AdminItemFilterOptions,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const pagination = normalizePagination(options);

    const where: Prisma.ItemWhereInput = {
      ...(options.type
        ? {
            type: options.type,
          }
        : {}),

      ...(options.status
        ? {
            status: options.status,
          }
        : {}),

      ...(options.isApproved !== undefined
        ? {
            isApproved: options.isApproved,
          }
        : {}),

      ...(options.categoryId
        ? {
            categoryId: options.categoryId,
          }
        : {}),

      ...(options.locationId
        ? {
            locationId: options.locationId,
          }
        : {}),

      ...(options.search
        ? {
            OR: [
              {
                title: {
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

              {
                brand: {
                  contains: options.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.item.findMany({
        where,
        select: adminItemSelect,
        skip: pagination.skip,
        take: pagination.limit,

        orderBy: {
          dateReported: pagination.sortOrder,
        },
      }),

      this.prisma.item.count({
        where,
      }),
    ]);

    return {
      success: true as const,
      data: items,

      pagination: createPagination(pagination.page, pagination.limit, total),
    };
  }

  // ====================================================
  // 28. GET ITEM DETAILS
  // ====================================================

  async getItemDetails(itemId: string, currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: {
        ...adminItemSelect,

        claims: {
          select: {
            id: true,
            description: true,
            status: true,
            createdAt: true,

            claimant: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException("Item not found.");
    }

    return {
      success: true as const,
      data: item,
    };
  }

  // ====================================================
  // 29. APPROVE ITEM
  // ====================================================

  async approveItem(itemId: string, currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: {
        id: true,
        title: true,
        isApproved: true,
        reporterId: true,
      },
    });

    if (!item) {
      throw new NotFoundException("Item not found.");
    }

    if (item.isApproved) {
      throw new BadRequestException("Item is already approved.");
    }

    const updated = await this.prisma.$transaction(async (transaction) => {
      const result = await transaction.item.updateMany({
        where: {
          id: itemId,
          isApproved: false,
        },

        data: {
          isApproved: true,
          approvedAt: new Date(),
        },
      });

      if (result.count !== 1) {
        throw new ConflictException(
          "Item approval state changed. Refresh and try again.",
        );
      }

      const notification = await transaction.notification.create({
        data: {
          userId: item.reporterId,
          title: "Item report approved",
          message: `Your item report "${item.title}" has been approved.`,
          type: "ITEM_UPDATE",
          data: {
            itemId,
          },
        },
      });

      await transaction.auditLog.create({
        data: {
          action: "APPROVE",
          entity: "Item",
          entityId: itemId,
          actorId: currentUser.id,
          description: "Administrator approved an item report.",
          metadata: {
            notificationId: notification.id,
          },
        },
      });

      return transaction.item.findUnique({
        where: {
          id: itemId,
        },

        select: adminItemSelect,
      });
    });

    return {
      success: true as const,
      message: "Item approved successfully.",
      data: updated,
    };
  }

  // ====================================================
  // 30. REJECT ITEM REPORT
  // ====================================================

  /**
   * Your current Item schema does not have a dedicated
   * rejected status or rejection-note field.
   *
   * Therefore rejection is represented by leaving
   * isApproved=false and recording the decision in
   * AuditLog. This does not delete the item.
   */

  async rejectItem(
    itemId: string,
    reason: string,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: {
        id: true,
        title: true,
        isApproved: true,
        reporterId: true,
      },
    });

    if (!item) {
      throw new NotFoundException("Item not found.");
    }

    if (item.isApproved) {
      throw new BadRequestException(
        "An approved item cannot be rejected through this operation.",
      );
    }

    const updated = await this.prisma.$transaction(async (transaction) => {
      await transaction.auditLog.create({
        data: {
          action: "REJECT",
          entity: "Item",
          entityId: itemId,
          actorId: currentUser.id,
          description: "Administrator rejected an item report.",
          metadata: {
            reason,
          },
        },
      });

      await transaction.notification.create({
        data: {
          userId: item.reporterId,
          title: "Item report needs attention",
          message: `Your report "${item.title}" was not approved. Reason: ${reason}`,
          type: "ITEM_UPDATE",
          data: {
            itemId,
          },
        },
      });

      return transaction.item.findUnique({
        where: {
          id: itemId,
        },

        select: adminItemSelect,
      });
    });

    return {
      success: true as const,
      message: "Item rejection recorded.",
      data: updated,
    };
  }

  // ====================================================
  // 31. ARCHIVE ITEM
  // ====================================================

  async archiveItem(itemId: string, currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: {
        id: true,
        status: true,
      },
    });

    if (!item) {
      throw new NotFoundException("Item not found.");
    }

    if (item.status === "ARCHIVED") {
      throw new BadRequestException("Item is already archived.");
    }

    const updated = await this.prisma.$transaction(async (transaction) => {
      const result = await transaction.item.updateMany({
        where: {
          id: itemId,
          status: item.status,
        },

        data: {
          status: "ARCHIVED",
        },
      });

      if (result.count !== 1) {
        throw new ConflictException(
          "Item status changed. Refresh and try again.",
        );
      }

      await transaction.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "Item",
          entityId: itemId,
          actorId: currentUser.id,
          description: "Administrator archived an item.",
          metadata: {
            previousStatus: item.status,
            newStatus: "ARCHIVED",
          },
        },
      });

      return transaction.item.findUnique({
        where: {
          id: itemId,
        },

        select: adminItemSelect,
      });
    });

    return {
      success: true as const,
      message: "Item archived successfully.",
      data: updated,
    };
  }

  // ====================================================
  // 32. RESTORE ARCHIVED ITEM
  // ====================================================

  async restoreItem(itemId: string, currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: {
        id: true,
        status: true,
        isApproved: true,
      },
    });

    if (!item) {
      throw new NotFoundException("Item not found.");
    }

    if (item.status !== "ARCHIVED") {
      throw new BadRequestException("Only archived items can be restored.");
    }

    const newStatus = item.isApproved ? "OPEN" : "OPEN";

    const updated = await this.prisma.$transaction(async (transaction) => {
      const result = await transaction.item.updateMany({
        where: {
          id: itemId,
          status: "ARCHIVED",
        },

        data: {
          status: newStatus,
        },
      });

      if (result.count !== 1) {
        throw new ConflictException(
          "Item status changed. Refresh and try again.",
        );
      }

      await transaction.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "Item",
          entityId: itemId,
          actorId: currentUser.id,
          description: "Administrator restored an archived item.",
          metadata: {
            previousStatus: "ARCHIVED",
            newStatus,
          },
        },
      });

      return transaction.item.findUnique({
        where: {
          id: itemId,
        },

        select: adminItemSelect,
      });
    });

    return {
      success: true as const,
      message: "Item restored successfully.",
      data: updated,
    };
  }

  // ====================================================
  // 33. CLAIM MONITORING
  // ====================================================

  async getClaims(
    options: AdminClaimFilterOptions,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const pagination = normalizePagination(options);

    const where: Prisma.ClaimWhereInput = {
      ...(options.status
        ? {
            status: options.status,
          }
        : {}),

      ...(options.search
        ? {
            OR: [
              {
                description: {
                  contains: options.search,
                  mode: "insensitive",
                },
              },

              {
                claimant: {
                  is: {
                    fullName: {
                      contains: options.search,
                      mode: "insensitive",
                    },
                  },
                },
              },

              {
                item: {
                  is: {
                    title: {
                      contains: options.search,
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [claims, total] = await this.prisma.$transaction([
      this.prisma.claim.findMany({
        where,

        select: {
          id: true,
          description: true,
          proofAnswers: true,
          status: true,
          reviewNote: true,
          reviewedAt: true,
          handoverVerifiedAt: true,
          createdAt: true,
          updatedAt: true,

          claimant: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },

          item: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
            },
          },
        },

        skip: pagination.skip,
        take: pagination.limit,

        orderBy: {
          createdAt: pagination.sortOrder,
        },
      }),

      this.prisma.claim.count({
        where,
      }),
    ]);

    return {
      success: true as const,
      data: claims,

      pagination: createPagination(pagination.page, pagination.limit, total),
    };
  }

  // ====================================================
  // 34. CLAIM DETAILS
  // ====================================================

  async getClaimDetails(claimId: string, currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const claim = await this.prisma.claim.findUnique({
      where: {
        id: claimId,
      },

      select: {
        id: true,
        description: true,
        proofAnswers: true,
        status: true,
        reviewNote: true,
        reviewedAt: true,
        handoverVerifiedAt: true,
        createdAt: true,
        updatedAt: true,

        claimant: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
            department: true,
          },
        },

        item: {
          select: adminItemSelect,
        },
      },
    });

    if (!claim) {
      throw new NotFoundException("Claim not found.");
    }

    return {
      success: true as const,
      data: claim,
    };
  }

  // ====================================================
  // 35. ANNOUNCEMENT LIST
  // ====================================================

  async getAnnouncements(currentUser: AuthenticatedUser, page = 1, limit = 20) {
    ensureAdmin(currentUser);

    const safePage = Math.max(1, Math.floor(page));

    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const where: Prisma.AnnouncementWhereInput = {};

    const [announcements, total] = await this.prisma.$transaction([
      this.prisma.announcement.findMany({
        where,

        select: {
          id: true,
          title: true,
          content: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,

          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },

        skip: (safePage - 1) * safeLimit,
        take: safeLimit,

        orderBy: {
          createdAt: "desc",
        },
      }),

      this.prisma.announcement.count({
        where,
      }),
    ]);

    return {
      success: true as const,
      data: announcements,

      pagination: createPagination(safePage, safeLimit, total),
    };
  }

  // ====================================================
  // 36. CREATE ANNOUNCEMENT
  // ====================================================

  async createAnnouncement(
    input: CreateAnnouncementInput,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const title = input.title.trim();
    const content = input.content.trim();

    if (title.length < 2) {
      throw new BadRequestException("Announcement title is too short.");
    }

    if (content.length < 5) {
      throw new BadRequestException("Announcement content is too short.");
    }

    const isPublished = input.isPublished ?? false;

    const announcement = await this.prisma.$transaction(async (transaction) => {
      const created = await transaction.announcement.create({
        data: {
          title,
          content,
          authorId: currentUser.id,
          isPublished,
          publishedAt: isPublished ? new Date() : null,
        },

        select: {
          id: true,
          title: true,
          content: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
        },
      });

      await transaction.auditLog.create({
        data: {
          action: "CREATE",
          entity: "Announcement",
          entityId: created.id,
          actorId: currentUser.id,
          description: "Administrator created an announcement.",
        },
      });

      if (isPublished) {
        const users = await transaction.user.findMany({
          where: {
            isActive: true,
          },

          select: {
            id: true,
          },
        });

        if (users.length > 0) {
          await transaction.notification.createMany({
            data: users.map((user) => ({
              userId: user.id,
              title,
              message: content,
              type: "ANNOUNCEMENT" as const,
              data: {
                announcementId: created.id,
              },
            })),
          });
        }
      }

      return created;
    });

    return {
      success: true as const,
      message: "Announcement created successfully.",
      data: announcement,
    };
  }

  // ====================================================
  // 37. UPDATE ANNOUNCEMENT
  // ====================================================

  async updateAnnouncement(
    announcementId: string,
    input: UpdateAnnouncementInput,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const existing = await this.prisma.announcement.findUnique({
      where: {
        id: announcementId,
      },

      select: {
        id: true,
        isPublished: true,
      },
    });

    if (!existing) {
      throw new NotFoundException("Announcement not found.");
    }

    const data: Prisma.AnnouncementUpdateInput = {
      ...(input.title !== undefined
        ? {
            title: input.title.trim(),
          }
        : {}),

      ...(input.content !== undefined
        ? {
            content: input.content.trim(),
          }
        : {}),

      ...(input.isPublished !== undefined
        ? {
            isPublished: input.isPublished,
            publishedAt: input.isPublished ? new Date() : null,
          }
        : {}),
    };

    const updated = await this.prisma.$transaction(async (transaction) => {
      const announcement = await transaction.announcement.update({
        where: {
          id: announcementId,
        },

        data,

        select: {
          id: true,
          title: true,
          content: true,
          isPublished: true,
          publishedAt: true,
          updatedAt: true,
        },
      });

      await transaction.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "Announcement",
          entityId: announcementId,
          actorId: currentUser.id,
          description: "Administrator updated an announcement.",
        },
      });

      return announcement;
    });

    return {
      success: true as const,
      message: "Announcement updated successfully.",
      data: updated,
    };
  }

  // ====================================================
  // 38. DELETE ANNOUNCEMENT
  // ====================================================

  async deleteAnnouncement(
    announcementId: string,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const announcement = await this.prisma.announcement.findUnique({
      where: {
        id: announcementId,
      },

      select: {
        id: true,
        title: true,
      },
    });

    if (!announcement) {
      throw new NotFoundException("Announcement not found.");
    }

    await this.prisma.$transaction(async (transaction) => {
      await transaction.announcement.delete({
        where: {
          id: announcementId,
        },
      });

      await transaction.auditLog.create({
        data: {
          action: "DELETE",
          entity: "Announcement",
          entityId: announcementId,
          actorId: currentUser.id,
          description: `Administrator deleted announcement "${announcement.title}".`,
        },
      });
    });

    return {
      success: true as const,
      message: "Announcement deleted successfully.",
    };
  }

  // ====================================================
  // 39. AUDIT LOG LIST
  // ====================================================

  async getAuditLogs(
    options: AdminPaginationOptions,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const pagination = normalizePagination(options);

    const where: Prisma.AuditLogWhereInput = {
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

        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          description: true,
          metadata: true,
          ipAddress: true,
          createdAt: true,
          actorId: true,
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

      pagination: createPagination(pagination.page, pagination.limit, total),
    };
  }

  // ====================================================
  // 40. ADMIN ACTIVITY SUMMARY
  // ====================================================

  async getAdminActivitySummary(currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const [
      created,
      updated,
      deleted,
      approved,
      rejected,
      roleChanges,
      handovers,
      logins,
    ] = await Promise.all([
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
          action: "ROLE_CHANGE",
        },
      }),

      this.prisma.auditLog.count({
        where: {
          action: "HANDOVER",
        },
      }),

      this.prisma.auditLog.count({
        where: {
          action: "LOGIN",
        },
      }),
    ]);

    return {
      success: true as const,

      data: {
        created,
        updated,
        deleted,
        approved,
        rejected,
        roleChanges,
        handovers,
        logins,
      },
    };
  }
}

// ======================================================
// 41. DEFAULT EXPORT
// ======================================================

export default AdminService;
