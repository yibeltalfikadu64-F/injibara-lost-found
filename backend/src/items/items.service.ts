/**
 * Injibara Campus Lost & Found
 *
 * Items Service
 *
 * Express 5 + Prisma 7 + PostgreSQL.
 */

import type { PrismaClient, Prisma } from "../../generated/prisma/client.js";

import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "../common/filters/http-exception.filter.js";

import type { AuthenticatedUser } from "../common/decorators/current-user.decorator.js";

import type { CreateItemDto } from "./dto/create-item.dto.js";

import type { UpdateItemDto } from "./dto/update-item.dto.js";

import type { SearchItemDto } from "./dto/search-item.dto.js";

// ======================================================
// 1. ITEM STATUS AND TYPE
// ======================================================

export const ITEM_TYPES = ["LOST", "FOUND"] as const;

export const ITEM_STATUSES = [
  "OPEN",
  "CLAIMED",
  "RESOLVED",
  "ARCHIVED",
] as const;

export type ItemTypeValue = (typeof ITEM_TYPES)[number];

export type ItemStatusValue = (typeof ITEM_STATUSES)[number];

// ======================================================
// 2. SERVICE OPTIONS
// ======================================================

export interface ItemsServiceOptions {
  prisma: PrismaClient;
}

// ======================================================
// 3. ITEM RELATION SELECTION
// ======================================================

const itemRelationsSelection = {
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

  reporterId: true,

  categoryId: true,

  locationId: true,

  reporter: {
    select: {
      id: true,

      fullName: true,

      role: true,

      department: true,

      avatarUrl: true,
    },
  },

  category: {
    select: {
      id: true,

      name: true,

      description: true,

      icon: true,
    },
  },

  location: {
    select: {
      id: true,

      name: true,

      description: true,

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
// 4. PAGINATION RESPONSE
// ======================================================

export interface ItemPagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
}

// ======================================================
// 5. ITEM LIST RESPONSE
// ======================================================

export interface ItemListResponse {
  success: true;

  data: unknown[];

  pagination: ItemPagination;
}

// ======================================================
// 6. HELPER: CHECK ITEM TYPE
// ======================================================

export function isItemType(value: unknown): value is ItemTypeValue {
  return (
    typeof value === "string" && ITEM_TYPES.includes(value as ItemTypeValue)
  );
}

// ======================================================
// 7. HELPER: CHECK ITEM STATUS
// ======================================================

export function isItemStatus(value: unknown): value is ItemStatusValue {
  return (
    typeof value === "string" &&
    ITEM_STATUSES.includes(value as ItemStatusValue)
  );
}

// ======================================================
// 8. HELPER: CHECK ADMIN
// ======================================================

function isAdmin(user: AuthenticatedUser): boolean {
  return user.role === "ADMIN";
}

// ======================================================
// 9. HELPER: PAGINATION
// ======================================================

function createPagination(
  page: number,
  limit: number,
  total: number,
): ItemPagination {
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
// 10. ITEMS SERVICE
// ======================================================

export class ItemsService {
  private readonly prisma: PrismaClient;

  constructor(options: ItemsServiceOptions) {
    this.prisma = options.prisma;
  }

  // ====================================================
  // 11. CHECK CATEGORY
  // ====================================================

  private async ensureCategoryExists(
    categoryId?: string | null,
  ): Promise<void> {
    if (!categoryId) {
      return;
    }

    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,

        isActive: true,
      },

      select: {
        id: true,
      },
    });

    if (!category) {
      throw new BadRequestException(
        "The selected category does not exist or is inactive.",
      );
    }
  }

  // ====================================================
  // 12. CHECK LOCATION
  // ====================================================

  private async ensureLocationExists(
    locationId?: string | null,
  ): Promise<void> {
    if (!locationId) {
      return;
    }

    const location = await this.prisma.location.findFirst({
      where: {
        id: locationId,

        isActive: true,
      },

      select: {
        id: true,
      },
    });

    if (!location) {
      throw new BadRequestException(
        "The selected location does not exist or is inactive.",
      );
    }
  }

  // ====================================================
  // 13. CHECK USER ACCOUNT
  // ====================================================

  private async ensureActiveUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,

        isActive: true,
      },

      select: {
        id: true,
      },
    });

    if (!user) {
      throw new ForbiddenException(
        "An active account is required to report an item.",
      );
    }
  }

  // ====================================================
  // 14. CREATE ITEM
  // ====================================================

  async createItem(input: CreateItemDto, currentUser: AuthenticatedUser) {
    await this.ensureActiveUser(currentUser.id);

    await this.ensureCategoryExists(input.categoryId);

    await this.ensureLocationExists(input.locationId);

    // ----------------------------------------------
    // Create item
    // ----------------------------------------------

    const item = await this.prisma.item.create({
      data: {
        title: input.title,

        description: input.description,

        type: input.type,

        dateOccurred: input.dateOccurred,

        color: input.color ?? null,

        brand: input.brand ?? null,

        identifyingFeatures: input.identifyingFeatures ?? null,

        imageUrls: input.imageUrls,

        isApproved: false,

        reporterId: currentUser.id,

        categoryId: input.categoryId ?? null,

        locationId: input.locationId ?? null,
      },

      select: itemRelationsSelection,
    });

    return {
      success: true as const,

      message:
        "Your item report was submitted successfully and is awaiting administrator approval.",

      data: item,
    };
  }

  // ====================================================
  // 15. SEARCH PUBLIC ITEMS
  // ====================================================

  async searchItems(options: SearchItemDto): Promise<ItemListResponse> {
    const page = Math.max(1, Math.floor(options.page));

    const limit = Math.min(100, Math.max(1, Math.floor(options.limit)));

    const skip = (page - 1) * limit;

    // ----------------------------------------------
    // Build database filter
    // ----------------------------------------------

    const where: Prisma.ItemWhereInput = {
      isApproved: true,

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

      ...(options.color
        ? {
            color: {
              contains: options.color,
              mode: "insensitive",
            },
          }
        : {}),

      ...(options.brand
        ? {
            brand: {
              contains: options.brand,
              mode: "insensitive",
            },
          }
        : {}),

      ...(options.dateFrom || options.dateTo
        ? {
            dateOccurred: {
              ...(options.dateFrom
                ? {
                    gte: options.dateFrom,
                  }
                : {}),

              ...(options.dateTo
                ? {
                    lte: options.dateTo,
                  }
                : {}),
            },
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
                color: {
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

              {
                identifyingFeatures: {
                  contains: options.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    // ----------------------------------------------
    // Sorting
    // ----------------------------------------------

    const orderBy: Prisma.ItemOrderByWithRelationInput = {
      [options.sortBy]: options.sortOrder,
    };

    // ----------------------------------------------
    // Query items and count
    // ----------------------------------------------

    const [items, total] = await this.prisma.$transaction([
      this.prisma.item.findMany({
        where,

        select: itemRelationsSelection,

        skip,

        take: limit,

        orderBy,
      }),

      this.prisma.item.count({
        where,
      }),
    ]);

    return {
      success: true,

      data: items,

      pagination: createPagination(page, limit, total),
    };
  }

  // ====================================================
  // 16. GET ITEM DETAILS
  // ====================================================

  async getItemById(itemId: string, currentUser?: AuthenticatedUser) {
    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: itemRelationsSelection,
    });

    if (!item) {
      throw new NotFoundException("Item not found.");
    }

    // ----------------------------------------------
    // Public visibility
    // ----------------------------------------------

    const isOwner = currentUser?.id === item.reporterId;

    const isAdministrator = currentUser ? isAdmin(currentUser) : false;

    if (!item.isApproved && !isOwner && !isAdministrator) {
      throw new NotFoundException("Item not found.");
    }

    return {
      success: true as const,

      data: item,
    };
  }

  // ====================================================
  // 17. GET MY ITEMS
  // ====================================================

  async getMyItems(
    currentUser: AuthenticatedUser,
    options: SearchItemDto,
  ): Promise<ItemListResponse> {
    const page = Math.max(1, Math.floor(options.page));

    const limit = Math.min(100, Math.max(1, Math.floor(options.limit)));

    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {
      reporterId: currentUser.id,

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
            ],
          }
        : {}),
    };

    const orderBy: Prisma.ItemOrderByWithRelationInput = {
      [options.sortBy]: options.sortOrder,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.item.findMany({
        where,

        select: itemRelationsSelection,

        skip,

        take: limit,

        orderBy,
      }),

      this.prisma.item.count({
        where,
      }),
    ]);

    return {
      success: true,

      data: items,

      pagination: createPagination(page, limit, total),
    };
  }

  // ====================================================
  // 18. UPDATE MY ITEM
  // ====================================================

  async updateMyItem(
    itemId: string,
    input: UpdateItemDto,
    currentUser: AuthenticatedUser,
  ) {
    const existingItem = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: {
        id: true,

        reporterId: true,

        status: true,

        isApproved: true,
      },
    });

    if (!existingItem) {
      throw new NotFoundException("Item not found.");
    }

    // ----------------------------------------------
    // Check item ownership
    // ----------------------------------------------

    if (existingItem.reporterId !== currentUser.id && !isAdmin(currentUser)) {
      throw new ForbiddenException("You are not allowed to update this item.");
    }

    // ----------------------------------------------
    // Do not edit resolved or archived items
    // ----------------------------------------------

    if (
      existingItem.status === "RESOLVED" ||
      existingItem.status === "ARCHIVED"
    ) {
      throw new BadRequestException(
        "Resolved or archived items cannot be edited.",
      );
    }

    await this.ensureCategoryExists(input.categoryId);

    await this.ensureLocationExists(input.locationId);

    // ----------------------------------------------
    // Update item
    // ----------------------------------------------

    const item = await this.prisma.item.update({
      where: {
        id: itemId,
      },

      data: {
        ...(input.title !== undefined
          ? {
              title: input.title,
            }
          : {}),

        ...(input.description !== undefined
          ? {
              description: input.description,
            }
          : {}),

        ...(input.dateOccurred !== undefined
          ? {
              dateOccurred: input.dateOccurred,
            }
          : {}),

        ...(input.color !== undefined
          ? {
              color: input.color,
            }
          : {}),

        ...(input.brand !== undefined
          ? {
              brand: input.brand,
            }
          : {}),

        ...(input.identifyingFeatures !== undefined
          ? {
              identifyingFeatures: input.identifyingFeatures,
            }
          : {}),

        ...(input.categoryId !== undefined
          ? {
              categoryId: input.categoryId,
            }
          : {}),

        ...(input.locationId !== undefined
          ? {
              locationId: input.locationId,
            }
          : {}),

        ...(input.imageUrls !== undefined
          ? {
              imageUrls: input.imageUrls,
            }
          : {}),

        // Require reapproval after an owner edits
        // a previously approved item.
        ...(existingItem.isApproved &&
        existingItem.reporterId === currentUser.id
          ? {
              isApproved: false,
              approvedAt: null,
            }
          : {}),
      },

      select: itemRelationsSelection,
    });

    return {
      success: true as const,

      message: "Item updated successfully.",

      data: item,
    };
  }

  // ====================================================
  // 19. DELETE MY ITEM
  // ====================================================

  /**
   * Soft archive rather than permanent deletion.
   *
   * This preserves claims and audit history.
   */

  async archiveMyItem(itemId: string, currentUser: AuthenticatedUser) {
    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: {
        id: true,

        reporterId: true,

        status: true,
      },
    });

    if (!item) {
      throw new NotFoundException("Item not found.");
    }

    if (item.reporterId !== currentUser.id && !isAdmin(currentUser)) {
      throw new ForbiddenException("You cannot archive another user's item.");
    }

    if (item.status === "ARCHIVED") {
      throw new BadRequestException("This item is already archived.");
    }

    await this.prisma.item.update({
      where: {
        id: itemId,
      },

      data: {
        status: "ARCHIVED",
      },
    });

    return {
      success: true as const,

      message: "Item archived successfully.",
    };
  }

  // ====================================================
  // 20. ADMIN: GET PENDING APPROVALS
  // ====================================================

  async getPendingApprovals(page = 1, limit = 20): Promise<ItemListResponse> {
    const safePage = Math.max(1, Math.floor(page));

    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const where: Prisma.ItemWhereInput = {
      isApproved: false,

      status: {
        not: "ARCHIVED",
      },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.item.findMany({
        where,

        select: itemRelationsSelection,

        skip: (safePage - 1) * safeLimit,

        take: safeLimit,

        orderBy: {
          dateReported: "desc",
        },
      }),

      this.prisma.item.count({
        where,
      }),
    ]);

    return {
      success: true,

      data: items,

      pagination: createPagination(safePage, safeLimit, total),
    };
  }

  // ====================================================
  // 21. ADMIN: APPROVE ITEM
  // ====================================================

  async approveItem(itemId: string, administrator: AuthenticatedUser) {
    if (!isAdmin(administrator)) {
      throw new ForbiddenException("Administrator permission is required.");
    }

    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },

      select: {
        id: true,

        isApproved: true,

        status: true,
      },
    });

    if (!item) {
      throw new NotFoundException("Item not found.");
    }

    if (item.status === "ARCHIVED") {
      throw new BadRequestException("An archived item cannot be approved.");
    }

    if (item.isApproved) {
      throw new BadRequestException("This item is already approved.");
    }

    const updatedItem = await this.prisma.item.update({
      where: {
        id: itemId,
      },

      data: {
        isApproved: true,

        approvedAt: new Date(),
      },

      select: itemRelationsSelection,
    });

    return {
      success: true as const,

      message: "Item approved successfully.",

      data: updatedItem,
    };
  }

  // ====================================================
  // 22. ADMIN: CHANGE ITEM STATUS
  // ====================================================

  async changeItemStatus(
    itemId: string,
    status: ItemStatusValue,
    administrator: AuthenticatedUser,
  ) {
    if (!isAdmin(administrator)) {
      throw new ForbiddenException("Administrator permission is required.");
    }

    if (!isItemStatus(status)) {
      throw new BadRequestException("Invalid item status.");
    }

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

    if (status !== "ARCHIVED" && !item.isApproved) {
      throw new BadRequestException(
        "Approve the item before changing its status.",
      );
    }

    const updatedItem = await this.prisma.item.update({
      where: {
        id: itemId,
      },

      data: {
        status,
      },

      select: itemRelationsSelection,
    });

    return {
      success: true as const,

      message: "Item status updated successfully.",

      data: updatedItem,
    };
  }

  // ====================================================
  // 23. ADMIN: GET ALL ITEMS
  // ====================================================

  async getAllItemsForAdmin(options: SearchItemDto): Promise<ItemListResponse> {
    const page = Math.max(1, Math.floor(options.page));

    const limit = Math.min(100, Math.max(1, Math.floor(options.limit)));

    const skip = (page - 1) * limit;

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

    const orderBy: Prisma.ItemOrderByWithRelationInput = {
      [options.sortBy]: options.sortOrder,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.item.findMany({
        where,

        select: itemRelationsSelection,

        skip,

        take: limit,

        orderBy,
      }),

      this.prisma.item.count({
        where,
      }),
    ]);

    return {
      success: true,

      data: items,

      pagination: createPagination(page, limit, total),
    };
  }

  // ====================================================
  // 24. GET ITEM STATISTICS
  // ====================================================

  async getItemStatistics() {
    const [
      total,
      lost,
      found,
      open,
      claimed,
      resolved,
      archived,
      pendingApproval,
      approved,
    ] = await Promise.all([
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

          status: {
            not: "ARCHIVED",
          },
        },
      }),

      this.prisma.item.count({
        where: {
          isApproved: true,
        },
      }),
    ]);

    return {
      success: true as const,

      data: {
        total,

        byType: {
          lost,

          found,
        },

        byStatus: {
          open,

          claimed,

          resolved,

          archived,
        },

        approval: {
          pending: pendingApproval,

          approved,
        },
      },
    };
  }
}

// ======================================================
// 25. DEFAULT EXPORT
// ======================================================

export default ItemsService;
