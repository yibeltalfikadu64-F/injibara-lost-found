/**
 * Injibara Campus Lost & Found
 *
 * Notifications Service
 *
 * Persistent notification management using Prisma.
 *
 * Supported features:
 * - Create notifications
 * - Notify one user
 * - Notify multiple users
 * - Notify users by role
 * - Get current user's notifications
 * - Get unread notifications
 * - Mark notification as read
 * - Mark all notifications as read
 * - Delete notifications
 * - Count unread notifications
 * - Notification statistics
 */

import type { PrismaClient, Prisma } from "../../generated/prisma/client.js";

import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "../common/filters/http-exception.filter.js";

import type { AuthenticatedUser } from "../common/decorators/current-user.decorator.js";

// ======================================================
// 1. SERVICE OPTIONS
// ======================================================

export interface NotificationsServiceOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. NOTIFICATION TYPES
// ======================================================

export type NotificationType =
  | "CLAIM_UPDATE"
  | "ITEM_MATCH"
  | "ITEM_UPDATE"
  | "ANNOUNCEMENT"
  | "SYSTEM";

// ======================================================
// 3. CREATE NOTIFICATION INPUT
// ======================================================

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: Prisma.InputJsonValue;
}

// ======================================================
// 4. BROADCAST INPUT
// ======================================================

export interface BroadcastNotificationInput {
  title: string;
  message: string;
  type: NotificationType;
  data?: Prisma.InputJsonValue;
  userIds?: string[];
  roles?: Array<"STUDENT" | "STAFF" | "SECURITY" | "ADMIN">;
}

// ======================================================
// 5. LIST OPTIONS
// ======================================================

export interface NotificationListOptions {
  page: number;
  limit: number;
  type?: NotificationType;
  isRead?: boolean;
  search?: string;
  sortOrder: "asc" | "desc";
}

// ======================================================
// 6. PAGINATION
// ======================================================

export interface NotificationPagination {
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
): NotificationPagination {
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
// 7. PUBLIC NOTIFICATION SELECT
// ======================================================

const notificationSelect = {
  id: true,
  title: true,
  message: true,
  type: true,
  isRead: true,
  data: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

// ======================================================
// 8. AUTHENTICATION CHECK
// ======================================================

function ensureAuthenticated(user: AuthenticatedUser): void {
  if (!user?.id) {
    throw new BadRequestException("An authenticated user is required.");
  }
}

// ======================================================
// 9. ADMIN CHECK
// ======================================================

function ensureAdmin(user: AuthenticatedUser): void {
  ensureAuthenticated(user);

  if (user.role !== "ADMIN") {
    throw new ForbiddenException("Administrator permission is required.");
  }
}

// ======================================================
// 10. NOTIFICATIONS SERVICE
// ======================================================

export class NotificationsService {
  private readonly prisma: PrismaClient;

  constructor(options: NotificationsServiceOptions) {
    this.prisma = options.prisma;
  }

  // ====================================================
  // 11. CREATE ONE NOTIFICATION
  // ====================================================

  async createNotification(input: CreateNotificationInput) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: input.userId,
      },

      select: {
        id: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException("Active notification recipient not found.");
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title.trim(),
        message: input.message.trim(),
        type: input.type,
        data: input.data,
      },

      select: notificationSelect,
    });

    return {
      success: true as const,
      message: "Notification created successfully.",
      data: notification,
    };
  }

  // ====================================================
  // 12. CREATE NOTIFICATION SAFELY
  // ====================================================

  /**
   * Internal helper for other services.
   *
   * Returns null instead of interrupting an item or claim
   * operation if notification delivery fails.
   *
   * Use this for best-effort notification creation.
   */

  async createNotificationSafely(input: CreateNotificationInput) {
    try {
      return await this.createNotification(input);
    } catch (error) {
      console.error("[NOTIFICATIONS] Could not create notification:", error);

      return null;
    }
  }

  // ====================================================
  // 13. NOTIFY MULTIPLE USERS
  // ====================================================

  async notifyUsers(
    input: Omit<CreateNotificationInput, "userId"> & {
      userIds: string[];
    },
  ) {
    const uniqueUserIds = [...new Set(input.userIds)];

    if (uniqueUserIds.length === 0) {
      throw new BadRequestException("At least one recipient is required.");
    }

    if (uniqueUserIds.length > 1000) {
      throw new BadRequestException(
        "A single notification batch cannot exceed 1000 recipients.",
      );
    }

    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: uniqueUserIds,
        },
        isActive: true,
      },

      select: {
        id: true,
      },
    });

    if (users.length === 0) {
      throw new NotFoundException("No active recipients were found.");
    }

    const result = await this.prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        title: input.title.trim(),
        message: input.message.trim(),
        type: input.type,
        data: input.data,
      })),
    });

    return {
      success: true as const,
      message: "Notifications sent successfully.",
      data: {
        requestedRecipients: uniqueUserIds.length,
        activeRecipients: users.length,
        created: result.count,
      },
    };
  }

  // ====================================================
  // 14. NOTIFY USERS BY ROLE
  // ====================================================

  async notifyUsersByRole(
    input: Omit<BroadcastNotificationInput, "userIds">,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    if (!input.roles || input.roles.length === 0) {
      throw new BadRequestException("At least one user role is required.");
    }

    const users = await this.prisma.user.findMany({
      where: {
        role: {
          in: input.roles,
        },
        isActive: true,
      },

      select: {
        id: true,
      },
    });

    if (users.length === 0) {
      return {
        success: true as const,
        message: "No active users matched the selected roles.",
        data: {
          created: 0,
        },
      };
    }

    return this.notifyUsers({
      title: input.title,
      message: input.message,
      type: input.type,
      data: input.data,
      userIds: users.map((user) => user.id),
    });
  }

  // ====================================================
  // 15. ADMIN BROADCAST
  // ====================================================

  async broadcastNotification(
    input: BroadcastNotificationInput,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    if (
      (!input.userIds || input.userIds.length === 0) &&
      (!input.roles || input.roles.length === 0)
    ) {
      throw new BadRequestException(
        "Provide user IDs or user roles for the broadcast.",
      );
    }

    const userIds = new Set(input.userIds ?? []);

    if (input.roles?.length) {
      const users = await this.prisma.user.findMany({
        where: {
          role: {
            in: input.roles,
          },
          isActive: true,
        },

        select: {
          id: true,
        },
      });

      for (const user of users) {
        userIds.add(user.id);
      }
    }

    return this.notifyUsers({
      title: input.title,
      message: input.message,
      type: input.type,
      data: input.data,
      userIds: [...userIds],
    });
  }

  // ====================================================
  // 16. GET MY NOTIFICATIONS
  // ====================================================

  async getMyNotifications(
    options: NotificationListOptions,
    currentUser: AuthenticatedUser,
  ) {
    ensureAuthenticated(currentUser);

    const page = Math.max(1, Math.floor(options.page));

    const limit = Math.min(100, Math.max(1, Math.floor(options.limit)));

    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId: currentUser.id,

      ...(options.type
        ? {
            type: options.type,
          }
        : {}),

      ...(options.isRead !== undefined
        ? {
            isRead: options.isRead,
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
                message: {
                  contains: options.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [notifications, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        select: notificationSelect,
        skip,
        take: limit,

        orderBy: {
          createdAt: options.sortOrder,
        },
      }),

      this.prisma.notification.count({
        where,
      }),
    ]);

    return {
      success: true as const,
      data: notifications,
      pagination: createPagination(page, limit, total),
    };
  }

  // ====================================================
  // 17. GET UNREAD NOTIFICATIONS
  // ====================================================

  async getUnreadNotifications(currentUser: AuthenticatedUser, limit = 20) {
    ensureAuthenticated(currentUser);

    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const notifications = await this.prisma.notification.findMany({
      where: {
        userId: currentUser.id,
        isRead: false,
      },

      select: notificationSelect,

      take: safeLimit,

      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true as const,
      data: notifications,
      total: notifications.length,
    };
  }

  // ====================================================
  // 18. GET ONE NOTIFICATION
  // ====================================================

  async getNotificationById(
    notificationId: string,
    currentUser: AuthenticatedUser,
  ) {
    ensureAuthenticated(currentUser);

    const notification = await this.prisma.notification.findUnique({
      where: {
        id: notificationId,
      },

      select: {
        ...notificationSelect,
        userId: true,
      },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found.");
    }

    if (notification.userId !== currentUser.id) {
      throw new ForbiddenException(
        "You cannot access another user notification.",
      );
    }

    const { userId: _userId, ...publicNotification } = notification;

    return {
      success: true as const,
      data: publicNotification,
    };
  }

  // ====================================================
  // 19. MARK ONE AS READ
  // ====================================================

  async markAsRead(notificationId: string, currentUser: AuthenticatedUser) {
    ensureAuthenticated(currentUser);

    const result = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: currentUser.id,
        isRead: false,
      },

      data: {
        isRead: true,
      },
    });

    if (result.count === 0) {
      const notification = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: currentUser.id,
        },

        select: {
          id: true,
          isRead: true,
        },
      });

      if (!notification) {
        throw new NotFoundException("Notification not found.");
      }
    }

    return {
      success: true as const,
      message: "Notification marked as read.",
    };
  }

  // ====================================================
  // 20. MARK ALL AS READ
  // ====================================================

  async markAllAsRead(currentUser: AuthenticatedUser) {
    ensureAuthenticated(currentUser);

    const result = await this.prisma.notification.updateMany({
      where: {
        userId: currentUser.id,
        isRead: false,
      },

      data: {
        isRead: true,
      },
    });

    return {
      success: true as const,
      message: "All notifications marked as read.",
      data: {
        updated: result.count,
      },
    };
  }

  // ====================================================
  // 21. DELETE ONE NOTIFICATION
  // ====================================================

  async deleteNotification(
    notificationId: string,
    currentUser: AuthenticatedUser,
  ) {
    ensureAuthenticated(currentUser);

    const result = await this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId: currentUser.id,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException("Notification not found.");
    }

    return {
      success: true as const,
      message: "Notification deleted successfully.",
    };
  }

  // ====================================================
  // 22. DELETE ALL READ NOTIFICATIONS
  // ====================================================

  async deleteAllReadNotifications(currentUser: AuthenticatedUser) {
    ensureAuthenticated(currentUser);

    const result = await this.prisma.notification.deleteMany({
      where: {
        userId: currentUser.id,
        isRead: true,
      },
    });

    return {
      success: true as const,
      message: "Read notifications deleted.",
      data: {
        deleted: result.count,
      },
    };
  }

  // ====================================================
  // 23. UNREAD COUNT
  // ====================================================

  async getUnreadCount(currentUser: AuthenticatedUser) {
    ensureAuthenticated(currentUser);

    const count = await this.prisma.notification.count({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
    });

    return {
      success: true as const,
      data: {
        unreadCount: count,
      },
    };
  }

  // ====================================================
  // 24. NOTIFICATION STATISTICS
  // ====================================================

  async getNotificationStatistics(currentUser: AuthenticatedUser) {
    ensureAuthenticated(currentUser);

    const [total, unread, read] = await Promise.all([
      this.prisma.notification.count({
        where: {
          userId: currentUser.id,
        },
      }),

      this.prisma.notification.count({
        where: {
          userId: currentUser.id,
          isRead: false,
        },
      }),

      this.prisma.notification.count({
        where: {
          userId: currentUser.id,
          isRead: true,
        },
      }),
    ]);

    return {
      success: true as const,

      data: {
        total,
        unread,
        read,
      },
    };
  }

  // ====================================================
  // 25. ADMIN: GET NOTIFICATION COUNTS
  // ====================================================

  async getSystemNotificationStatistics(currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const [total, unread, read, byType] = await Promise.all([
      this.prisma.notification.count(),

      this.prisma.notification.count({
        where: {
          isRead: false,
        },
      }),

      this.prisma.notification.count({
        where: {
          isRead: true,
        },
      }),

      this.prisma.notification.groupBy({
        by: ["type"],
        _count: {
          _all: true,
        },
      }),
    ]);

    return {
      success: true as const,

      data: {
        total,
        unread,
        read,

        byType: byType.map((entry) => ({
          type: entry.type,
          count: entry._count._all,
        })),
      },
    };
  }
}

// ======================================================
// 26. DEFAULT EXPORT
// ======================================================

export default NotificationsService;
