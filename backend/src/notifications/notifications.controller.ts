/**
 * Injibara Campus Lost & Found
 *
 * Notifications Controller
 *
 * Handles notification HTTP requests.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

import { z } from "zod";

import { NotificationsService } from "./notifications.service.js";

import {
  getValidatedBody,
  getValidatedQuery,
} from "../common/pipes/validation.pipe.js";

import {
  BadRequestException,
  UnauthorizedException,
} from "../common/filters/http-exception.filter.js";

// ======================================================
// 1. NOTIFICATION TYPE SCHEMA
// ======================================================

const notificationTypeSchema = z.enum([
  "CLAIM_UPDATE",
  "ITEM_MATCH",
  "ITEM_UPDATE",
  "ANNOUNCEMENT",
  "SYSTEM",
]);

// ======================================================
// 2. NOTIFICATION SEARCH SCHEMA
// ======================================================

export const notificationSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  type: notificationTypeSchema.optional(),

  isRead: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  search: z.string().trim().max(150).optional(),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ======================================================
// 3. ADMIN BROADCAST SCHEMA
// ======================================================

export const broadcastNotificationSchema = z
  .object({
    title: z.string().trim().min(2).max(150),

    message: z.string().trim().min(2).max(3000),

    type: notificationTypeSchema,

    userIds: z.array(z.uuid()).max(1000).optional(),

    roles: z
      .array(z.enum(["STUDENT", "STAFF", "SECURITY", "ADMIN"]))
      .max(4)
      .optional(),

    data: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((input) => Boolean(input.userIds?.length || input.roles?.length), {
    message: "Select at least one recipient or role.",
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
// 6. NOTIFICATION ID
// ======================================================

function getNotificationId(request: Request): string {
  const result = z.uuid().safeParse(request.params.id);

  if (!result.success) {
    throw new BadRequestException("Invalid notification ID.");
  }

  return result.data;
}

// ======================================================
// 7. CONTROLLER
// ======================================================

export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ====================================================
  // 8. GET MY NOTIFICATIONS
  // ====================================================

  getMyNotifications: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const input = getValidatedQuery<{
        page: number;
        limit: number;
        type:
          | "CLAIM_UPDATE"
          | "ITEM_MATCH"
          | "ITEM_UPDATE"
          | "ANNOUNCEMENT"
          | "SYSTEM"
          | undefined;
        isRead?: boolean;
        search?: string;
        sortOrder: "asc" | "desc";
      }>(request);

      const result = await this.notificationsService.getMyNotifications(
        input,
        currentUser,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 9. GET UNREAD NOTIFICATIONS
  // ====================================================

  getUnreadNotifications: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const limitResult = z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20)
        .safeParse(request.query.limit);

      if (!limitResult.success) {
        throw new BadRequestException("Invalid notification limit.");
      }

      const result = await this.notificationsService.getUnreadNotifications(
        currentUser,
        limitResult.data,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 10. GET NOTIFICATION BY ID
  // ====================================================

  getNotificationById: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const notificationId = getNotificationId(request);

      const result = await this.notificationsService.getNotificationById(
        notificationId,
        currentUser,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 11. MARK ONE AS READ
  // ====================================================

  markAsRead: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const notificationId = getNotificationId(request);

    const result = await this.notificationsService.markAsRead(
      notificationId,
      currentUser,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 12. MARK ALL AS READ
  // ====================================================

  markAllAsRead: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const result = await this.notificationsService.markAllAsRead(currentUser);

    response.status(200).json(result);
  });

  // ====================================================
  // 13. DELETE ONE NOTIFICATION
  // ====================================================

  deleteNotification: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const notificationId = getNotificationId(request);

      const result = await this.notificationsService.deleteNotification(
        notificationId,
        currentUser,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 14. DELETE ALL READ NOTIFICATIONS
  // ====================================================

  deleteAllReadNotifications: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const result =
        await this.notificationsService.deleteAllReadNotifications(currentUser);

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 15. GET UNREAD COUNT
  // ====================================================

  getUnreadCount: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const result = await this.notificationsService.getUnreadCount(currentUser);

    response.status(200).json(result);
  });

  // ====================================================
  // 16. GET PERSONAL STATISTICS
  // ====================================================

  getMyStatistics: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const result =
      await this.notificationsService.getNotificationStatistics(currentUser);

    response.status(200).json(result);
  });

  // ====================================================
  // 17. ADMIN BROADCAST
  // ====================================================

  broadcastNotification: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const input =
        getValidatedBody<z.infer<typeof broadcastNotificationSchema>>(request);

      const result = await this.notificationsService.broadcastNotification(
        input,
        currentUser,
      );

      response.status(201).json(result);
    },
  );

  // ====================================================
  // 18. ADMIN SYSTEM STATISTICS
  // ====================================================

  getSystemStatistics: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const result =
        await this.notificationsService.getSystemNotificationStatistics(
          currentUser,
        );

      response.status(200).json(result);
    },
  );
}

// ======================================================
// 19. DEFAULT EXPORT
// ======================================================

export default NotificationsController;
