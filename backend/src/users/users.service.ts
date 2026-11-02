
/**
 * Injibara Campus Lost & Found
 *
 * Users Service
 *
 * Express 5 + Prisma 7 + PostgreSQL + Argon2.
 */

import argon2 from 'argon2';

import type {
  PrismaClient,
} from '../../generated/prisma/client.js';

import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '../common/filters/http-exception.filter.js';

import type {
  AuthenticatedUser,
  UserRole,
} from '../common/decorators/current-user.decorator.js';

import type {
  UpdateUserDto,
} from './dto/update-user.dto.js';

import type {
  ChangePasswordDto,
} from './dto/change-password.dto.js';

// ======================================================
// 1. USER ROLE TYPE
// ======================================================

export const USER_ROLES = [
  'STUDENT',
  'STAFF',
  'SECURITY',
  'ADMIN',
] as const;

export type ManagedUserRole =
  (typeof USER_ROLES)[number];

// ======================================================
// 2. USER FILTER OPTIONS
// ======================================================

export interface UserListOptions {
  page?: number;

  limit?: number;

  search?: string;

  role?: ManagedUserRole;

  department?: string;

  isActive?: boolean;

  sortBy?: 'createdAt' | 'fullName' | 'email';

  sortOrder?: 'asc' | 'desc';
}

// ======================================================
// 3. PAGINATION RESPONSE
// ======================================================

export interface PaginationMetadata {
  page: number;

  limit: number;

  total: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
}

// ======================================================
// 4. USER LIST RESPONSE
// ======================================================

export interface UserListResponse {
  success: true;

  data: AuthenticatedUser[];

  pagination: PaginationMetadata;
}

// ======================================================
// 5. USER SERVICE OPTIONS
// ======================================================

export interface UsersServiceOptions {
  prisma: PrismaClient;
}

// ======================================================
// 6. PUBLIC USER SELECT
// ======================================================

/**
 * Never include passwordHash or authentication
 * secrets in public user responses.
 */

const publicUserSelection = {
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
} as const;

// ======================================================
// 7. USER CONVERTER
// ======================================================

function toAuthenticatedUser(
  user: {
    id: string;

    fullName: string;

    email: string;

    role: string;

    studentId: string | null;

    department: string | null;

    phone: string | null;

    avatarUrl: string | null;

    isActive: boolean;
  },
): AuthenticatedUser {
  return {
    id: user.id,

    fullName: user.fullName,

    email: user.email,

    role: user.role as UserRole,

    studentId: user.studentId,

    department: user.department,

    phone: user.phone,

    avatarUrl: user.avatarUrl,

    isActive: user.isActive,
  };
}

// ======================================================
// 8. VALIDATE ROLE
// ======================================================

export function isManagedUserRole(
  role: unknown,
): role is ManagedUserRole {
  return (
    typeof role === 'string' &&
    USER_ROLES.includes(
      role as ManagedUserRole,
    )
  );
}

// ======================================================
// 9. USERS SERVICE
// ======================================================

export class UsersService {
  private readonly prisma: PrismaClient;

  constructor(options: UsersServiceOptions) {
    this.prisma = options.prisma;
  }

  // ====================================================
  // 10. GET CURRENT USER PROFILE
  // ====================================================

  async getMyProfile(
    userId: string,
  ) {
    const user =
      await this.prisma.user.findFirst({
        where: {
          id: userId,

          isActive: true,
        },

        select: publicUserSelection,
      });

    if (!user) {
      throw new NotFoundException(
        'Your user account could not be found.',
      );
    }

    return {
      success: true as const,

      data: user,
    };
  }

  // ====================================================
  // 11. GET USER BY ID
  // ====================================================

  async getUserById(
    userId: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: publicUserSelection,
      });

    if (!user) {
      throw new NotFoundException(
        'User account not found.',
      );
    }

    return {
      success: true as const,

      data: user,
    };
  }

  // ====================================================
  // 12. UPDATE MY PROFILE
  // ====================================================

  async updateMyProfile(
    userId: string,
    input: UpdateUserDto,
  ) {
    // ----------------------------------------------
    // Check existing account
    // ----------------------------------------------

    const existingUser =
      await this.prisma.user.findFirst({
        where: {
          id: userId,

          isActive: true,
        },

        select: {
          id: true,
        },
      });

    if (!existingUser) {
      throw new NotFoundException(
        'Your account could not be found.',
      );
    }

    // ----------------------------------------------
    // Check phone uniqueness
    // ----------------------------------------------

    if (
      input.phone !== undefined &&
      input.phone !== null
    ) {
      const existingPhone =
        await this.prisma.user.findFirst({
          where: {
            phone: input.phone,

            NOT: {
              id: userId,
            },
          },

          select: {
            id: true,
          },
        });

      if (existingPhone) {
        throw new ConflictException(
          'This phone number is already used by another account.',
        );
      }
    }

    // ----------------------------------------------
    // Update allowed profile fields only
    // ----------------------------------------------

    const user =
      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          ...(input.fullName !== undefined
            ? {
                fullName: input.fullName,
              }
            : {}),

          ...(input.department !== undefined
            ? {
                department: input.department,
              }
            : {}),

          ...(input.phone !== undefined
            ? {
                phone: input.phone,
              }
            : {}),

          ...(input.avatarUrl !== undefined
            ? {
                avatarUrl: input.avatarUrl,
              }
            : {}),
        },

        select: publicUserSelection,
      });

    return {
      success: true as const,

      message: 'Profile updated successfully.',

      data: user,
    };
  }

  // ====================================================
  // 13. UPDATE USER BY ADMIN
  // ====================================================

  async updateUserByAdmin(
    userId: string,
    input: UpdateUserDto,
  ) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
        },
      });

    if (!existingUser) {
      throw new NotFoundException(
        'User account not found.',
      );
    }

    if (
      input.phone !== undefined &&
      input.phone !== null
    ) {
      const existingPhone =
        await this.prisma.user.findFirst({
          where: {
            phone: input.phone,

            NOT: {
              id: userId,
            },
          },

          select: {
            id: true,
          },
        });

      if (existingPhone) {
        throw new ConflictException(
          'This phone number is already assigned to another user.',
        );
      }
    }

    const user =
      await this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          ...(input.fullName !== undefined
            ? {
                fullName: input.fullName,
              }
            : {}),

          ...(input.department !== undefined
            ? {
                department: input.department,
              }
            : {}),

          ...(input.phone !== undefined
            ? {
                phone: input.phone,
              }
            : {}),

          ...(input.avatarUrl !== undefined
            ? {
                avatarUrl: input.avatarUrl,
              }
            : {}),
        },

        select: publicUserSelection,
      });

    return {
      success: true as const,

      message: 'User profile updated successfully.',

      data: user,
    };
  }

  // ====================================================
  // 14. LIST USERS
  // ====================================================

  async getUsers(
    options: UserListOptions = {},
  ): Promise<UserListResponse> {
    const page = Math.max(
      1,
      Math.floor(options.page ?? 1),
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Math.floor(options.limit ?? 20),
      ),
    );

    const skip = (page - 1) * limit;

    // ----------------------------------------------
    // Build search conditions
    // ----------------------------------------------

    const where = {
      ...(options.role
        ? {
            role: options.role,
          }
        : {}),

      ...(options.department
        ? {
            department: {
              contains: options.department,
              mode: 'insensitive' as const,
            },
          }
        : {}),

      ...(options.isActive !== undefined
        ? {
            isActive: options.isActive,
          }
        : {}),

      ...(options.search
        ? {
            OR: [
              {
                fullName: {
                  contains: options.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                email: {
                  contains: options.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                studentId: {
                  contains: options.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                department: {
                  contains: options.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    // ----------------------------------------------
    // Sorting
    // ----------------------------------------------

    const sortBy =
      options.sortBy ?? 'createdAt';

    const sortOrder =
      options.sortOrder ?? 'desc';

    // ----------------------------------------------
    // Execute pagination queries
    // ----------------------------------------------

    const [
      users,
      total,
    ] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,

        select: publicUserSelection,

        skip,

        take: limit,

        orderBy: {
          [sortBy]: sortOrder,
        },
      }),

      this.prisma.user.count({
        where,
      }),
    ]);

    const totalPages =
      Math.ceil(total / limit);

    return {
      success: true,

      data: users.map(toAuthenticatedUser),

      pagination: {
        page,

        limit,

        total,

        totalPages,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1,
      },
    };
  }

  // ====================================================
  // 15. GET USER STATISTICS
  // ====================================================

  async getUserStatistics() {
    const [
      totalUsers,
      students,
      staff,
      securityUsers,
      administrators,
      activeUsers,
      inactiveUsers,
      verifiedUsers,
      unverifiedUsers,
    ] = await Promise.all([
      this.prisma.user.count(),

      this.prisma.user.count({
        where: {
          role: 'STUDENT',
        },
      }),

      this.prisma.user.count({
        where: {
          role: 'STAFF',
        },
      }),

      this.prisma.user.count({
        where: {
          role: 'SECURITY',
        },
      }),

      this.prisma.user.count({
        where: {
          role: 'ADMIN',
        },
      }),

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
          emailVerifiedAt: {
            not: null,
          },
        },
      }),

      this.prisma.user.count({
        where: {
          emailVerifiedAt: null,
        },
      }),
    ]);

    return {
      success: true as const,

      data: {
        totalUsers,

        byRole: {
          students,

          staff,

          security: securityUsers,

          administrators,
        },

        byStatus: {
          active: activeUsers,

          inactive: inactiveUsers,
        },

        emailVerification: {
          verified: verifiedUsers,

          unverified: unverifiedUsers,
        },
      },
    };
  }

  // ====================================================
  // 16. CHANGE USER ROLE
  // ====================================================

  async changeUserRole(
    targetUserId: string,
    newRole: ManagedUserRole,
    actingAdminId: string,
  ) {
    // ----------------------------------------------
    // Prevent changing your own role
    // ----------------------------------------------

    if (targetUserId === actingAdminId) {
      throw new ForbiddenException(
        'You cannot change your own administrator role.',
      );
    }

    if (!isManagedUserRole(newRole)) {
      throw new BadRequestException(
        'Invalid user role.',
      );
    }

    // ----------------------------------------------
    // Find target user
    // ----------------------------------------------

    const targetUser =
      await this.prisma.user.findUnique({
        where: {
          id: targetUserId,
        },

        select: {
          id: true,

          role: true,

          isActive: true,
        },
      });

    if (!targetUser) {
      throw new NotFoundException(
        'User account not found.',
      );
    }

    if (targetUser.role === newRole) {
      throw new BadRequestException(
        'The user already has this role.',
      );
    }

    // ----------------------------------------------
    // Prevent removing the last active administrator
    // ----------------------------------------------

    if (targetUser.role === 'ADMIN') {
      const activeAdminCount =
        await this.prisma.user.count({
          where: {
            role: 'ADMIN',

            isActive: true,
          },
        });

      if (activeAdminCount <= 1) {
        throw new ForbiddenException(
          'You cannot change the role of the last active administrator.',
        );
      }
    }

    // ----------------------------------------------
    // Change role and revoke old sessions
    // ----------------------------------------------

    const updatedUser =
      await this.prisma.$transaction(
        async (transaction) => {
          const user =
            await transaction.user.update({
              where: {
                id: targetUserId,
              },

              data: {
                role: newRole as never,
              },

              select: publicUserSelection,
            });

          await transaction.refreshToken.updateMany({
            where: {
              userId: targetUserId,

              revokedAt: null,
            },

            data: {
              revokedAt: new Date(),
            },
          });

          return user;
        },
      );

    return {
      success: true as const,

      message: 'User role updated successfully.',

      data: updatedUser,
    };
  }

  // ====================================================
  // 17. DEACTIVATE USER
  // ====================================================

  async deactivateUser(
    targetUserId: string,
    actingAdminId: string,
  ) {
    if (targetUserId === actingAdminId) {
      throw new ForbiddenException(
        'You cannot deactivate your own account using this endpoint.',
      );
    }

    const targetUser =
      await this.prisma.user.findUnique({
        where: {
          id: targetUserId,
        },

        select: {
          id: true,

          role: true,

          isActive: true,
        },
      });

    if (!targetUser) {
      throw new NotFoundException(
        'User account not found.',
      );
    }

    if (!targetUser.isActive) {
      throw new BadRequestException(
        'This account is already deactivated.',
      );
    }

    if (targetUser.role === 'ADMIN') {
      const activeAdminCount =
        await this.prisma.user.count({
          where: {
            role: 'ADMIN',

            isActive: true,
          },
        });

      if (activeAdminCount <= 1) {
        throw new ForbiddenException(
          'You cannot deactivate the last active administrator.',
        );
      }
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: targetUserId,
        },

        data: {
          isActive: false,
        },
      }),

      this.prisma.refreshToken.updateMany({
        where: {
          userId: targetUserId,

          revokedAt: null,
        },

        data: {
          revokedAt: new Date(),
        },
      }),
    ]);

    return {
      success: true as const,

      message: 'User account deactivated successfully.',
    };
  }

  // ====================================================
  // 18. ACTIVATE USER
  // ====================================================

  async activateUser(
    targetUserId: string,
  ) {
    const targetUser =
      await this.prisma.user.findUnique({
        where: {
          id: targetUserId,
        },

        select: {
          id: true,

          isActive: true,
        },
      });

    if (!targetUser) {
      throw new NotFoundException(
        'User account not found.',
      );
    }

    if (targetUser.isActive) {
      throw new BadRequestException(
        'This account is already active.',
      );
    }

    const user =
      await this.prisma.user.update({
        where: {
          id: targetUserId,
        },

        data: {
          isActive: true,
        },

        select: publicUserSelection,
      });

    return {
      success: true as const,

      message: 'User account activated successfully.',

      data: user,
    };
  }

  // ====================================================
  // 19. CHANGE PASSWORD
  // ====================================================

  async changePassword(
    userId: string,
    input: ChangePasswordDto,
  ) {
    const user =
      await this.prisma.user.findFirst({
        where: {
          id: userId,

          isActive: true,
        },

        select: {
          id: true,

          passwordHash: true,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User account not found.',
      );
    }

    // ----------------------------------------------
    // Verify current password
    // ----------------------------------------------

    const passwordIsValid =
      await argon2.verify(
        user.passwordHash,
        input.currentPassword,
      ).catch(() => false);

    if (!passwordIsValid) {
      throw new UnauthorizedException(
        'Current password is incorrect.',
      );
    }

    // ----------------------------------------------
    // Prevent reusing current password
    // ----------------------------------------------

    if (
      input.currentPassword ===
      input.newPassword
    ) {
      throw new BadRequestException(
        'New password must be different.',
      );
    }

    // ----------------------------------------------
    // Hash new password
    // ----------------------------------------------

    const newPasswordHash =
      await argon2.hash(
        input.newPassword,
        {
          type: argon2.argon2id,

          memoryCost: 19456,

          timeCost: 2,

          parallelism: 1,
        },
      );

    const now = new Date();

    // ----------------------------------------------
    // Update password and revoke all sessions
    // ----------------------------------------------

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          passwordHash: newPasswordHash,
        },
      }),

      this.prisma.refreshToken.updateMany({
        where: {
          userId,

          revokedAt: null,
        },

        data: {
          revokedAt: now,
        },
      }),
    ]);

    return {
      success: true as const,

      message:
        'Password changed successfully. Please sign in again.',
    };
  }

  // ====================================================
  // 20. DELETE USER ACCOUNT
  // ====================================================

  /**
   * This is deliberately a soft deactivation.
   *
   * It does not delete database records.
   */

  async removeUser(
    targetUserId: string,
    actingAdminId: string,
  ) {
    return this.deactivateUser(
      targetUserId,
      actingAdminId,
    );
  }

  // ====================================================
  // 21. GET USERS BY ROLE
  // ====================================================

  async getUsersByRole(
    role: ManagedUserRole,
    page = 1,
    limit = 20,
  ) {
    if (!isManagedUserRole(role)) {
      throw new BadRequestException(
        'Invalid user role.',
      );
    }

    return this.getUsers({
      role,

      page,

      limit,

      sortBy: 'createdAt',

      sortOrder: 'desc',
    });
  }

  // ====================================================
  // 22. GET USERS BY DEPARTMENT
  // ====================================================

  async getUsersByDepartment(
    department: string,
    page = 1,
    limit = 20,
  ) {
    if (!department.trim()) {
      throw new BadRequestException(
        'Department is required.',
      );
    }

    return this.getUsers({
      department: department.trim(),

      page,

      limit,
    });
  }

  // ====================================================
  // 23. FIND USER BY EMAIL
  // ====================================================

  async findUserByEmail(
    email: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: email.trim().toLowerCase(),
        },

        select: publicUserSelection,
      });

    if (!user) {
      return null;
    }

    return user;
  }

  // ====================================================
  // 24. FIND USER BY STUDENT ID
  // ====================================================

  async findUserByStudentId(
    studentId: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          studentId: studentId.trim(),
        },

        select: publicUserSelection,
      });

    if (!user) {
      return null;
    }

    return user;
  }

  // ====================================================
  // 25. CHECK USER EXISTS
  // ====================================================

  async userExists(
    userId: string,
  ): Promise<boolean> {
    const count =
      await this.prisma.user.count({
        where: {
          id: userId,
        },
      });

    return count > 0;
  }

  // ====================================================
  // 26. CHECK EMAIL EXISTS
  // ====================================================

  async emailExists(
    email: string,
  ): Promise<boolean> {
    const count =
      await this.prisma.user.count({
        where: {
          email: email.trim().toLowerCase(),
        },
      });

    return count > 0;
  }

  // ====================================================
  // 27. CHECK PHONE EXISTS
  // ====================================================

  async phoneExists(
    phone: string,
  ): Promise<boolean> {
    const count =
      await this.prisma.user.count({
        where: {
          phone: phone.trim(),
        },
      });

    return count > 0;
  }
}

// ======================================================
// 28. DEFAULT EXPORT
// ======================================================

export default UsersService;
