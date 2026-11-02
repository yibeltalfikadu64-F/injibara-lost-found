/**
 * Injibara Campus Lost & Found
 *
 * Users Controller
 *
 * Express 5 controller.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

import { z } from "zod";

import {
  UsersService,
  isManagedUserRole,
  USER_ROLES,
} from "./users.service.js";

import {
  getValidatedBody,
  getValidatedQuery,
} from "../common/pipes/validation.pipe.js";

import {
  BadRequestException,
  UnauthorizedException,
} from "../common/filters/http-exception.filter.js";

import type { UpdateUserDto } from "./dto/update-user.dto.js";

import type { ChangePasswordDto } from "./dto/change-password.dto.js";

// ======================================================
// 1. REQUEST VALIDATION SCHEMAS
// ======================================================

export const updateRoleSchema = z.object({
  role: z.enum(USER_ROLES),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().max(100).optional(),

  role: z.enum(USER_ROLES).optional(),

  department: z.string().trim().max(100).optional(),

  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  sortBy: z.enum(["createdAt", "fullName", "email"]).default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
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
// 3. GET AUTHENTICATED USER ID
// ======================================================

function getCurrentUserId(request: Request): string {
  if (!request.user) {
    throw new UnauthorizedException("Authentication is required.");
  }

  return request.user.id;
}

// ======================================================
// 4. VALIDATE USER ID PARAMETER
// ======================================================

function getTargetUserId(request: Request): string {
  const result = z.uuid().safeParse(request.params.id);

  if (!result.success) {
    throw new BadRequestException("Invalid user ID.");
  }

  return result.data;
}

// ======================================================
// 5. USERS CONTROLLER
// ======================================================

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ====================================================
  // 6. GET MY PROFILE
  // ====================================================

  getMe: RequestHandler = asyncHandler(async (request, response) => {
    const userId = getCurrentUserId(request);

    const result = await this.usersService.getMyProfile(userId);

    response.status(200).json(result);
  });

  // ====================================================
  // 7. UPDATE MY PROFILE
  // ====================================================

  updateMe: RequestHandler = asyncHandler(async (request, response) => {
    const userId = getCurrentUserId(request);

    const input = getValidatedBody<UpdateUserDto>(request);

    const result = await this.usersService.updateMyProfile(userId, input);

    response.status(200).json(result);
  });

  // ====================================================
  // 8. CHANGE MY PASSWORD
  // ====================================================

  changeMyPassword: RequestHandler = asyncHandler(async (request, response) => {
    const userId = getCurrentUserId(request);

    const input = getValidatedBody<ChangePasswordDto>(request);

    const result = await this.usersService.changePassword(userId, input);

    response.status(200).json(result);
  });

  // ====================================================
  // 9. GET ALL USERS
  // ====================================================

  getAllUsers: RequestHandler = asyncHandler(async (request, response) => {
    const input =
      getValidatedQuery<z.infer<typeof userListQuerySchema>>(request);

    const result = await this.usersService.getUsers({
      page: input.page,

      limit: input.limit,

      search: input.search,

      role: input.role,

      department: input.department,

      isActive: input.isActive,

      sortBy: input.sortBy,

      sortOrder: input.sortOrder,
    });

    response.status(200).json(result);
  });

  // ====================================================
  // 10. GET USER BY ID
  // ====================================================

  getUserById: RequestHandler = asyncHandler(async (request, response) => {
    const userId = getTargetUserId(request);

    const result = await this.usersService.getUserById(userId);

    response.status(200).json(result);
  });

  // ====================================================
  // 11. UPDATE USER BY ADMIN
  // ====================================================

  updateUser: RequestHandler = asyncHandler(async (request, response) => {
    const userId = getTargetUserId(request);

    const input = getValidatedBody<UpdateUserDto>(request);

    const result = await this.usersService.updateUserByAdmin(userId, input);

    response.status(200).json(result);
  });

  // ====================================================
  // 12. CHANGE USER ROLE
  // ====================================================

  changeUserRole: RequestHandler = asyncHandler(async (request, response) => {
    const targetUserId = getTargetUserId(request);

    const actingAdminId = getCurrentUserId(request);

    const input = getValidatedBody<{
      role: (typeof USER_ROLES)[number];
    }>(request);

    if (!isManagedUserRole(input.role)) {
      throw new BadRequestException("Invalid user role.");
    }

    const result = await this.usersService.changeUserRole(
      targetUserId,
      input.role,
      actingAdminId,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 13. DEACTIVATE USER
  // ====================================================

  deactivateUser: RequestHandler = asyncHandler(async (request, response) => {
    const targetUserId = getTargetUserId(request);

    const actingAdminId = getCurrentUserId(request);

    const result = await this.usersService.deactivateUser(
      targetUserId,
      actingAdminId,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 14. ACTIVATE USER
  // ====================================================

  activateUser: RequestHandler = asyncHandler(async (request, response) => {
    const targetUserId = getTargetUserId(request);

    const result = await this.usersService.activateUser(targetUserId);

    response.status(200).json(result);
  });

  // ====================================================
  // 15. DELETE USER
  // ====================================================

  /**
   * This endpoint performs soft deactivation.
   * It never permanently deletes a user record.
   */

  deleteUser: RequestHandler = asyncHandler(async (request, response) => {
    const targetUserId = getTargetUserId(request);

    const actingAdminId = getCurrentUserId(request);

    const result = await this.usersService.removeUser(
      targetUserId,
      actingAdminId,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 16. GET USER STATISTICS
  // ====================================================

  getStatistics: RequestHandler = asyncHandler(async (_request, response) => {
    const result = await this.usersService.getUserStatistics();

    response.status(200).json(result);
  });

  // ====================================================
  // 17. GET USERS BY ROLE
  // ====================================================

  getUsersByRole: RequestHandler = asyncHandler(async (request, response) => {
    const roleResult = z.enum(USER_ROLES).safeParse(request.params.role);

    if (!roleResult.success) {
      throw new BadRequestException("Invalid user role.");
    }

    const page = Math.max(1, Number(request.query.page) || 1);

    const limit = Math.min(100, Math.max(1, Number(request.query.limit) || 20));

    const result = await this.usersService.getUsersByRole(
      roleResult.data,
      page,
      limit,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 18. GET USERS BY DEPARTMENT
  // ====================================================

  getUsersByDepartment: RequestHandler = asyncHandler(
    async (request, response) => {
      const department = request.params.department;

      if (typeof department !== "string" || department.trim().length < 2) {
        throw new BadRequestException("A valid department is required.");
      }

      const page = Math.max(1, Number(request.query.page) || 1);

      const limit = Math.min(
        100,
        Math.max(1, Number(request.query.limit) || 20),
      );

      const result = await this.usersService.getUsersByDepartment(
        department,
        page,
        limit,
      );

      response.status(200).json(result);
    },
  );
}

// ======================================================
// 19. DEFAULT EXPORT
// ======================================================

export default UsersController;
