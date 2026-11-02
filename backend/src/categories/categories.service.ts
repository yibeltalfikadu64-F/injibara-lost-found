/**
 * Injibara Campus Lost & Found
 *
 * Categories Service
 *
 * Handles category business logic using Prisma.
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

export interface CategoriesServiceOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. CATEGORY INPUT TYPES
// ======================================================

export interface CreateCategoryInput {
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string | null;
  icon?: string | null;
}

export interface CategorySearchOptions {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  sortBy: "name" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
}

// ======================================================
// 3. PAGINATION RESPONSE
// ======================================================

export interface CategoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ======================================================
// 4. CATEGORY SELECT
// ======================================================

const categorySelect = {
  id: true,
  name: true,
  description: true,
  icon: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,

  _count: {
    select: {
      items: true,
    },
  },
} satisfies Prisma.CategorySelect;

// ======================================================
// 5. PAGINATION HELPER
// ======================================================

function createPagination(
  page: number,
  limit: number,
  total: number,
): CategoryPagination {
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
// 6. ADMIN CHECK
// ======================================================

function ensureAdmin(user: AuthenticatedUser): void {
  if (user.role !== "ADMIN") {
    throw new ForbiddenException("Administrator permission is required.");
  }
}

// ======================================================
// 7. CATEGORY SERVICE
// ======================================================

export class CategoriesService {
  private readonly prisma: PrismaClient;

  constructor(options: CategoriesServiceOptions) {
    this.prisma = options.prisma;
  }

  // ====================================================
  // 8. CHECK CATEGORY NAME
  // ====================================================

  private async ensureUniqueName(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },

        ...(excludeId
          ? {
              id: {
                not: excludeId,
              },
            }
          : {}),
      },

      select: {
        id: true,
      },
    });

    if (existing) {
      throw new BadRequestException(
        "A category with this name already exists.",
      );
    }
  }

  // ====================================================
  // 9. CREATE CATEGORY
  // ====================================================

  async createCategory(
    input: CreateCategoryInput,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const name = input.name.trim();

    await this.ensureUniqueName(name);

    const category = await this.prisma.category.create({
      data: {
        name,

        description: input.description?.trim() || null,

        icon: input.icon?.trim() || null,

        isActive: true,
      },

      select: categorySelect,
    });

    return {
      success: true as const,
      message: "Category created successfully.",
      data: category,
    };
  }

  // ====================================================
  // 10. GET ALL ACTIVE CATEGORIES
  // ====================================================

  async getActiveCategories() {
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
      },

      select: categorySelect,

      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true as const,
      data: categories,
      total: categories.length,
    };
  }

  // ====================================================
  // 11. GET CATEGORY BY ID
  // ====================================================

  async getCategoryById(categoryId: string, includeInactive = false) {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },

      select: categorySelect,
    });

    if (!category || (!includeInactive && !category.isActive)) {
      throw new NotFoundException("Category not found.");
    }

    return {
      success: true as const,
      data: category,
    };
  }

  // ====================================================
  // 12. SEARCH CATEGORIES
  // ====================================================

  async searchCategories(options: CategorySearchOptions) {
    const page = Math.max(1, Math.floor(options.page));

    const limit = Math.min(100, Math.max(1, Math.floor(options.limit)));

    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      ...(options.isActive !== undefined
        ? {
            isActive: options.isActive,
          }
        : {
            isActive: true,
          }),

      ...(options.search
        ? {
            OR: [
              {
                name: {
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

    const orderBy: Prisma.CategoryOrderByWithRelationInput = {
      [options.sortBy]: options.sortOrder,
    };

    const [categories, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        select: categorySelect,
        skip,
        take: limit,
        orderBy,
      }),

      this.prisma.category.count({
        where,
      }),
    ]);

    return {
      success: true as const,
      data: categories,
      pagination: createPagination(page, limit, total),
    };
  }

  // ====================================================
  // 13. ADMIN: GET ALL CATEGORIES
  // ====================================================

  async getAllCategoriesForAdmin(
    options: CategorySearchOptions,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    return this.searchCategories({
      ...options,

      isActive: options.isActive,
    });
  }

  // ====================================================
  // 14. UPDATE CATEGORY
  // ====================================================

  async updateCategory(
    categoryId: string,
    input: UpdateCategoryInput,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const existing = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },

      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!existing) {
      throw new NotFoundException("Category not found.");
    }

    if (input.name !== undefined) {
      await this.ensureUniqueName(input.name.trim(), categoryId);
    }

    const category = await this.prisma.category.update({
      where: {
        id: categoryId,
      },

      data: {
        ...(input.name !== undefined
          ? {
              name: input.name.trim(),
            }
          : {}),

        ...(input.description !== undefined
          ? {
              description: input.description?.trim() || null,
            }
          : {}),

        ...(input.icon !== undefined
          ? {
              icon: input.icon?.trim() || null,
            }
          : {}),
      },

      select: categorySelect,
    });

    return {
      success: true as const,
      message: "Category updated successfully.",
      data: category,
    };
  }

  // ====================================================
  // 15. DEACTIVATE CATEGORY
  // ====================================================

  async deactivateCategory(categoryId: string, currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },

      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found.");
    }

    if (!category.isActive) {
      throw new BadRequestException("Category is already inactive.");
    }

    await this.prisma.category.update({
      where: {
        id: categoryId,
      },

      data: {
        isActive: false,
      },
    });

    return {
      success: true as const,
      message: "Category deactivated successfully.",
    };
  }

  // ====================================================
  // 16. ACTIVATE CATEGORY
  // ====================================================

  async activateCategory(categoryId: string, currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },

      select: {
        id: true,
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found.");
    }

    if (category.isActive) {
      throw new BadRequestException("Category is already active.");
    }

    await this.prisma.category.update({
      where: {
        id: categoryId,
      },

      data: {
        isActive: true,
      },
    });

    return {
      success: true as const,
      message: "Category activated successfully.",
    };
  }

  // ====================================================
  // 17. CATEGORY STATISTICS
  // ====================================================

  async getCategoryStatistics(currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const [total, active, inactive, categoriesWithItems] = await Promise.all([
      this.prisma.category.count(),

      this.prisma.category.count({
        where: {
          isActive: true,
        },
      }),

      this.prisma.category.count({
        where: {
          isActive: false,
        },
      }),

      this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
          isActive: true,

          _count: {
            select: {
              items: true,
            },
          },
        },

        orderBy: {
          name: "asc",
        },
      }),
    ]);

    return {
      success: true as const,

      data: {
        total,
        active,
        inactive,

        categories: categoriesWithItems.map((category) => ({
          id: category.id,
          name: category.name,
          isActive: category.isActive,
          itemCount: category._count.items,
        })),
      },
    };
  }

  // ====================================================
  // 18. CATEGORY EXISTS
  // ====================================================

  async categoryExists(categoryId: string): Promise<boolean> {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        isActive: true,
      },

      select: {
        id: true,
      },
    });

    return Boolean(category);
  }

  // ====================================================
  // 19. FIND CATEGORY BY NAME
  // ====================================================

  async findCategoryByName(name: string) {
    return this.prisma.category.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },

        isActive: true,
      },

      select: categorySelect,
    });
  }

  // ====================================================
  // 20. GET CATEGORY ITEM COUNT
  // ====================================================

  async getCategoryItemCount(categoryId: string): Promise<number> {
    const category = await this.prisma.category.findUnique({
      where: {
        id: categoryId,
      },

      select: {
        id: true,
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found.");
    }

    return this.prisma.item.count({
      where: {
        categoryId,
      },
    });
  }

  // ====================================================
  // 21. RESTORE CATEGORY
  // ====================================================

  async restoreCategory(categoryId: string, currentUser: AuthenticatedUser) {
    return this.activateCategory(categoryId, currentUser);
  }
}

// ======================================================
// 22. DEFAULT EXPORT
// ======================================================

export default CategoriesService;
