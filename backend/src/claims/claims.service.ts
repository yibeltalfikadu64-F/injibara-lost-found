
/**
 * Injibara Campus Lost & Found
 *
 * Claims Service
 *
 * Business logic for claiming lost and found items.
 *
 * Security:
 * - Users can only access their own claims.
 * - Only administrators can review claims.
 * - Administrators and security staff can verify handovers.
 * - Handover codes are stored as Argon2 hashes.
 * - Items are never physically deleted by this service.
 */

import argon2 from 'argon2';
import { randomInt } from 'node:crypto';

import type {
  PrismaClient,
  Prisma,
} from '../../generated/prisma/client.js';

import {
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '../common/filters/http-exception.filter.js';

import type {
  AuthenticatedUser,
} from '../common/decorators/current-user.decorator.js';

import type {
  CreateClaimDto,
} from './dto/create-claim.dto.js';

import type {
  ReviewClaimDto,
} from './dto/review-claim.dto.js';

// ======================================================
// 1. SERVICE OPTIONS
// ======================================================

export interface ClaimsServiceOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. CLAIM SELECT
// ======================================================

const claimSelect = {
  id: true,
  description: true,
  proofAnswers: true,
  status: true,
  reviewNote: true,
  reviewedAt: true,
  handoverVerifiedAt: true,
  createdAt: true,
  updatedAt: true,

  item: {
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      status: true,
      dateOccurred: true,
      color: true,
      brand: true,
      imageUrls: true,
      isApproved: true,

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
    },
  },

  claimant: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      studentId: true,
      department: true,
    },
  },

  reviewedBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },

  handoverVerifiedBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
} satisfies Prisma.ClaimSelect;

// ======================================================
// 3. CLAIM STATUS TYPES
// ======================================================

export type ClaimStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

// ======================================================
// 4. CLAIM LIST OPTIONS
// ======================================================

export interface ClaimListOptions {
  page: number;
  limit: number;
  status?: ClaimStatus;
  search?: string;
  sortOrder: 'asc' | 'desc';
}

// ======================================================
// 5. PAGINATION RESPONSE
// ======================================================

export interface ClaimPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ======================================================
// 6. PAGINATION HELPER
// ======================================================

function createPagination(
  page: number,
  limit: number,
  total: number,
): ClaimPagination {
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
// 7. ROLE HELPERS
// ======================================================

function ensureAuthenticated(
  user: AuthenticatedUser,
): void {
  if (!user?.id) {
    throw new UnauthorizedException(
      'Authentication is required.',
    );
  }
}

function ensureAdmin(
  user: AuthenticatedUser,
): void {
  ensureAuthenticated(user);

  if (user.role !== 'ADMIN') {
    throw new ForbiddenException(
      'Administrator permission is required.',
    );
  }
}

function ensureHandoverOfficer(
  user: AuthenticatedUser,
): void {
  ensureAuthenticated(user);

  if (
    user.role !== 'ADMIN' &&
    user.role !== 'SECURITY'
  ) {
    throw new ForbiddenException(
      'Only administrators or security staff can verify handovers.',
    );
  }
}

function ensureCanSubmitClaim(
  user: AuthenticatedUser,
): void {
  ensureAuthenticated(user);

  if (
    user.role !== 'STUDENT' &&
    user.role !== 'STAFF'
  ) {
    throw new ForbiddenException(
      'Only students and staff can submit item claims.',
    );
  }
}

// ======================================================
// 8. CLAIM SERVICE
// ======================================================

export class ClaimsService {
  private readonly prisma: PrismaClient;

  constructor(options: ClaimsServiceOptions) {
    this.prisma = options.prisma;
  }

  // ====================================================
  // 9. GENERATE RANDOM HANDOVER CODE
  // ====================================================

  private createRandomHandoverCode(): string {
    return randomInt(100000, 1000000).toString();
  }

  // ====================================================
  // 10. GET CLAIM BY ID
  // ====================================================

  async getClaimById(
    claimId: string,
    currentUser: AuthenticatedUser,
  ) {
    ensureAuthenticated(currentUser);

    const claim =
      await this.prisma.claim.findUnique({
        where: {
          id: claimId,
        },

        select: claimSelect,
      });

    if (!claim) {
      throw new NotFoundException(
        'Claim not found.',
      );
    }

    const isOwner =
      claim.claimant.id === currentUser.id;

    const isAdmin =
      currentUser.role === 'ADMIN';

    const isSecurity =
      currentUser.role === 'SECURITY';

    if (!isOwner && !isAdmin && !isSecurity) {
      throw new ForbiddenException(
        'You cannot access this claim.',
      );
    }

    return {
      success: true as const,
      data: claim,
    };
  }

  // ====================================================
  // 11. CREATE CLAIM
  // ====================================================

  async createClaim(
    input: CreateClaimDto,
    currentUser: AuthenticatedUser,
  ) {
    ensureCanSubmitClaim(currentUser);

    // Check that the item exists.
    const item =
      await this.prisma.item.findUnique({
        where: {
          id: input.itemId,
        },

        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          isApproved: true,
          reporterId: true,
        },
      });

    if (!item) {
      throw new NotFoundException(
        'The item you are trying to claim was not found.',
      );
    }

    // Only found items can be claimed.
    if (item.type !== 'FOUND') {
      throw new BadRequestException(
        'You can only submit a claim for a found item.',
      );
    }

    // The item must be publicly approved.
    if (!item.isApproved) {
      throw new BadRequestException(
        'This item is not available for claiming yet.',
      );
    }

    // Only open items can receive claims.
    if (item.status !== 'OPEN') {
      throw new ConflictException(
        'This item is no longer available for claiming.',
      );
    }

    // A reporter cannot claim their own found-item report.
    if (item.reporterId === currentUser.id) {
      throw new ForbiddenException(
        'You cannot claim an item that you reported as found.',
      );
    }

    // Check for an existing claim.
    const existingClaim =
      await this.prisma.claim.findUnique({
        where: {
          itemId_claimantId: {
            itemId: input.itemId,
            claimantId: currentUser.id,
          },
        },

        select: {
          id: true,
          status: true,
        },
      });

    if (existingClaim) {
      throw new ConflictException(
        'You have already submitted a claim for this item.',
      );
    }

    try {
      const claim =
        await this.prisma.claim.create({
          data: {
            itemId: input.itemId,
            claimantId: currentUser.id,

            description:
              input.description.trim(),

            ...(input.proofAnswers
              ? {
                  proofAnswers:
                    input.proofAnswers as Prisma.InputJsonValue,
                }
              : {}),

            status: 'PENDING',
          },

          select: claimSelect,
        });

      return {
        success: true as const,
        message:
          'Your claim has been submitted successfully.',
        data: claim,
      };
    } catch (error) {
      // The unique constraint protects against
      // simultaneous duplicate submissions.
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'You have already submitted a claim for this item.',
        );
      }

      throw error;
    }
  }

  // ====================================================
  // 12. GET MY CLAIMS
  // ====================================================

  async getMyClaims(
    options: ClaimListOptions,
    currentUser: AuthenticatedUser,
  ) {
    ensureAuthenticated(currentUser);

    const page = Math.max(
      1,
      Math.floor(options.page),
    );

    const limit = Math.min(
      100,
      Math.max(1, Math.floor(options.limit)),
    );

    const skip = (page - 1) * limit;

    const where: Prisma.ClaimWhereInput = {
      claimantId: currentUser.id,

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
                  mode: 'insensitive',
                },
              },

              {
                item: {
                  title: {
                    contains: options.search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [
      claims,
      total,
    ] = await this.prisma.$transaction([
      this.prisma.claim.findMany({
        where,
        select: claimSelect,
        skip,
        take: limit,

        orderBy: {
          createdAt: options.sortOrder,
        },
      }),

      this.prisma.claim.count({
        where,
      }),
    ]);

    return {
      success: true as const,
      data: claims,
      pagination: createPagination(
        page,
        limit,
        total,
      ),
    };
  }

  // ====================================================
  // 13. GET ALL CLAIMS FOR ADMIN
  // ====================================================

  async getAllClaims(
    options: ClaimListOptions,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const page = Math.max(
      1,
      Math.floor(options.page),
    );

    const limit = Math.min(
      100,
      Math.max(1, Math.floor(options.limit)),
    );

    const skip = (page - 1) * limit;

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
                  mode: 'insensitive',
                },
              },

              {
                item: {
                  title: {
                    contains: options.search,
                    mode: 'insensitive',
                  },
                },
              },

              {
                claimant: {
                  fullName: {
                    contains: options.search,
                    mode: 'insensitive',
                  },
                },
              },

              {
                claimant: {
                  email: {
                    contains: options.search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [
      claims,
      total,
    ] = await this.prisma.$transaction([
      this.prisma.claim.findMany({
        where,
        select: claimSelect,
        skip,
        take: limit,

        orderBy: {
          createdAt: options.sortOrder,
        },
      }),

      this.prisma.claim.count({
        where,
      }),
    ]);

    return {
      success: true as const,
      data: claims,
      pagination: createPagination(
        page,
        limit,
        total,
      ),
    };
  }

  // ====================================================
  // 14. CANCEL MY CLAIM
  // ====================================================

  async cancelMyClaim(
    claimId: string,
    currentUser: AuthenticatedUser,
  ) {
    ensureAuthenticated(currentUser);

    const claim =
      await this.prisma.claim.findUnique({
        where: {
          id: claimId,
        },

        select: {
          id: true,
          claimantId: true,
          status: true,
        },
      });

    if (!claim) {
      throw new NotFoundException(
        'Claim not found.',
      );
    }

    if (claim.claimantId !== currentUser.id) {
      throw new ForbiddenException(
        'You can only cancel your own claims.',
      );
    }

    if (claim.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending claims can be cancelled.',
      );
    }

    const updated =
      await this.prisma.claim.update({
        where: {
          id: claimId,
        },

        data: {
          status: 'CANCELLED',
        },

        select: claimSelect,
      });

    return {
      success: true as const,
      message: 'Claim cancelled successfully.',
      data: updated,
    };
  }

  // ====================================================
  // 15. REVIEW CLAIM
  // ====================================================

  async reviewClaim(
    claimId: string,
    input: ReviewClaimDto,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    return this.prisma.$transaction(
      async (transaction) => {
        const claim =
          await transaction.claim.findUnique({
            where: {
              id: claimId,
            },

            include: {
              item: true,
            },
          });

        if (!claim) {
          throw new NotFoundException(
            'Claim not found.',
          );
        }

        if (claim.status !== 'PENDING') {
          throw new ConflictException(
            'Only pending claims can be reviewed.',
          );
        }

        if (input.decision === 'REJECT') {
          const updated =
            await transaction.claim.update({
              where: {
                id: claimId,
              },

              data: {
                status: 'REJECTED',
                reviewNote:
                  input.reviewNote?.trim() ?? null,
                reviewedAt: new Date(),
                reviewedById: currentUser.id,
              },

              select: claimSelect,
            });

          return {
            success: true as const,
            message: 'Claim rejected successfully.',
            data: updated,
          };
        }

        // Approval requires the item to still be available.
        if (claim.item.type !== 'FOUND') {
          throw new BadRequestException(
            'Only found items can have approved claims.',
          );
        }

        if (
          !claim.item.isApproved ||
          claim.item.status !== 'OPEN'
        ) {
          throw new ConflictException(
            'This item is no longer available for approval.',
          );
        }

        // Prevent a reporter from claiming their own item.
        if (claim.item.reporterId === claim.claimantId) {
          throw new ForbiddenException(
            'The item reporter cannot be approved as its claimant.',
          );
        }

        // Conditional update prevents two claims from
        // successfully reserving the same open item.
        const itemUpdate =
          await transaction.item.updateMany({
            where: {
              id: claim.itemId,
              type: 'FOUND',
              status: 'OPEN',
              isApproved: true,
            },

            data: {
              status: 'CLAIMED',
            },
          });

        if (itemUpdate.count !== 1) {
          throw new ConflictException(
            'Another claim may already have reserved this item.',
          );
        }

        const updated =
          await transaction.claim.update({
            where: {
              id: claimId,
            },

            data: {
              status: 'APPROVED',
              reviewNote:
                input.reviewNote?.trim() ?? null,
              reviewedAt: new Date(),
              reviewedById: currentUser.id,
            },

            select: claimSelect,
          });

        // Other pending claims can no longer be approved
        // for this item after it has been reserved.
        await transaction.claim.updateMany({
          where: {
            itemId: claim.itemId,
            id: {
              not: claimId,
            },
            status: 'PENDING',
          },

          data: {
            status: 'REJECTED',
            reviewNote:
              'This item has already been approved for another claimant.',
            reviewedAt: new Date(),
            reviewedById: currentUser.id,
          },
        });

        return {
          success: true as const,
          message:
            'Claim approved successfully. The item is now reserved for handover.',
          data: updated,
        };
      },
    );
  }

  // ====================================================
  // 16. GENERATE HANDOVER CODE
  // ====================================================

  async generateHandoverCode(
    claimId: string,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const claim =
      await this.prisma.claim.findUnique({
        where: {
          id: claimId,
        },

        select: {
          id: true,
          status: true,
          handoverVerifiedAt: true,
        },
      });

    if (!claim) {
      throw new NotFoundException(
        'Claim not found.',
      );
    }

    if (claim.status !== 'APPROVED') {
      throw new BadRequestException(
        'A handover code can only be generated for an approved claim.',
      );
    }

    if (claim.handoverVerifiedAt) {
      throw new ConflictException(
        'This item has already been handed over.',
      );
    }

    const plainCode =
      this.createRandomHandoverCode();

    const codeHash =
      await argon2.hash(plainCode);

    await this.prisma.claim.update({
      where: {
        id: claimId,
      },

      data: {
        handoverCodeHash: codeHash,
      },
    });

    // This is the only time the plain code is returned.
    // Store it securely and provide it to the claimant
    // through an appropriate private channel.
    return {
      success: true as const,
      message: 'Handover code generated successfully.',

      data: {
        claimId,
        handoverCode: plainCode,
        instruction:
          'Keep this code private and present it to security staff during handover.',
      },
    };
  }

  // ====================================================
  // 17. VERIFY HANDOVER
  // ====================================================

  async verifyHandover(
    claimId: string,
    handoverCode: string,
    currentUser: AuthenticatedUser,
  ) {
    ensureHandoverOfficer(currentUser);

    const claim =
      await this.prisma.claim.findUnique({
        where: {
          id: claimId,
        },

        select: {
          id: true,
          itemId: true,
          status: true,
          handoverCodeHash: true,
          handoverVerifiedAt: true,
        },
      });

    if (!claim) {
      throw new NotFoundException(
        'Claim not found.',
      );
    }

    if (claim.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved claims can be handed over.',
      );
    }

    if (claim.handoverVerifiedAt) {
      throw new ConflictException(
        'This handover has already been completed.',
      );
    }

    if (!claim.handoverCodeHash) {
      throw new BadRequestException(
        'No handover code has been generated for this claim.',
      );
    }

    const isValid =
      await argon2.verify(
        claim.handoverCodeHash,
        handoverCode,
      );

    if (!isValid) {
      throw new ForbiddenException(
        'Invalid handover code.',
      );
    }

    return this.prisma.$transaction(
      async (transaction) => {
        // Check the claim again inside the transaction
        // to prevent duplicate handover completion.
        const currentClaim =
          await transaction.claim.findUnique({
            where: {
              id: claimId,
            },

            select: {
              id: true,
              itemId: true,
              status: true,
              handoverVerifiedAt: true,
              handoverCodeHash: true,
            },
          });

        if (
          !currentClaim ||
          currentClaim.status !== 'APPROVED' ||
          currentClaim.handoverVerifiedAt
        ) {
          throw new ConflictException(
            'The claim is no longer eligible for handover.',
          );
        }

        if (
          currentClaim.handoverCodeHash !==
          claim.handoverCodeHash
        ) {
          throw new ConflictException(
            'The handover code has changed. Please generate a new code.',
          );
        }

        const updated =
          await transaction.claim.update({
            where: {
              id: claimId,
            },

            data: {
              status: 'COMPLETED',
              handoverVerifiedAt: new Date(),
              handoverVerifiedById: currentUser.id,

              // Clear the hash after successful verification.
              handoverCodeHash: null,
            },

            select: claimSelect,
          });

        await transaction.item.update({
          where: {
            id: currentClaim.itemId,
          },

          data: {
            status: 'RESOLVED',
          },
        });

        return {
          success: true as const,
          message:
            'Handover verified successfully. The item has been marked as resolved.',
          data: updated,
        };
      },
    );
  }

  // ====================================================
  // 18. ADMIN CLAIM STATISTICS
  // ====================================================

  async getClaimStatistics(
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const [
      total,
      pending,
      approved,
      rejected,
      cancelled,
      completed,
    ] = await Promise.all([
      this.prisma.claim.count(),

      this.prisma.claim.count({
        where: {
          status: 'PENDING',
        },
      }),

      this.prisma.claim.count({
        where: {
          status: 'APPROVED',
        },
      }),

      this.prisma.claim.count({
        where: {
          status: 'REJECTED',
        },
      }),

      this.prisma.claim.count({
        where: {
          status: 'CANCELLED',
        },
      }),

      this.prisma.claim.count({
        where: {
          status: 'COMPLETED',
        },
      }),
    ]);

    return {
      success: true as const,

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
  // 19. GET PENDING CLAIMS
  // ====================================================

  async getPendingClaims(
    options: ClaimListOptions,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    return this.getAllClaims(
      {
        ...options,
        status: 'PENDING',
      },
      currentUser,
    );
  }

  // ====================================================
  // 20. GET CLAIMS FOR AN ITEM
  // ====================================================

  async getClaimsForItem(
    itemId: string,
    currentUser: AuthenticatedUser,
  ) {
    ensureAuthenticated(currentUser);

    const item =
      await this.prisma.item.findUnique({
        where: {
          id: itemId,
        },

        select: {
          id: true,
          reporterId: true,
        },
      });

    if (!item) {
      throw new NotFoundException(
        'Item not found.',
      );
    }

    const canView =
      currentUser.role === 'ADMIN' ||
      currentUser.role === 'SECURITY' ||
      item.reporterId === currentUser.id;

    if (!canView) {
      throw new ForbiddenException(
        'You cannot view claims for this item.',
      );
    }

    const claims =
      await this.prisma.claim.findMany({
        where: {
          itemId,
        },

        select: claimSelect,

        orderBy: {
          createdAt: 'desc',
        },
      });

    return {
      success: true as const,
      data: claims,
      total: claims.length,
    };
  }

  // ====================================================
  // 21. GET CLAIM STATUS
  // ====================================================

  async getClaimStatus(
    claimId: string,
    currentUser: AuthenticatedUser,
  ) {
    ensureAuthenticated(currentUser);

    const claim =
      await this.prisma.claim.findUnique({
        where: {
          id: claimId,
        },

        select: {
          id: true,
          claimantId: true,
          status: true,
          reviewNote: true,
          reviewedAt: true,
          handoverVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    if (!claim) {
      throw new NotFoundException(
        'Claim not found.',
      );
    }

    if (
      claim.claimantId !== currentUser.id &&
      currentUser.role !== 'ADMIN' &&
      currentUser.role !== 'SECURITY'
    ) {
      throw new ForbiddenException(
        'You cannot view this claim status.',
      );
    }

    return {
      success: true as const,
      data: {
        id: claim.id,
        status: claim.status,
        reviewNote: claim.reviewNote,
        reviewedAt: claim.reviewedAt,
        handoverVerifiedAt:
          claim.handoverVerifiedAt,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
      },
    };
  }

  // ====================================================
  // 22. GET CLAIMS BY STATUS
  // ====================================================

  async getClaimsByStatus(
    status: ClaimStatus,
    options: ClaimListOptions,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    return this.getAllClaims(
      {
        ...options,
        status,
      },
      currentUser,
    );
  }
}

// ======================================================
// 23. DEFAULT EXPORT
// ======================================================

export default ClaimsService;
