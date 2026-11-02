/**
 * Injibara Campus Lost & Found
 *
 * Locations Service
 *
 * Handles campus location business logic.
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

export interface LocationsServiceOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. LOCATION INPUT TYPES
// ======================================================

export interface CreateLocationInput {
  name: string;
  description?: string | null;
  building?: string | null;
}

export interface UpdateLocationInput {
  name?: string;
  description?: string | null;
  building?: string | null;
}

export interface LocationSearchOptions {
  page: number;
  limit: number;
  search?: string;
  building?: string;
  isActive?: boolean;
  sortBy: "name" | "building" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
}

// ======================================================
// 3. PAGINATION
// ======================================================

export interface LocationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ======================================================
// 4. LOCATION SELECT
// ======================================================

const locationSelect = {
  id: true,
  name: true,
  description: true,
  building: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,

  _count: {
    select: {
      items: true,
    },
  },
} satisfies Prisma.LocationSelect;

// ======================================================
// 5. PAGINATION HELPER
// ======================================================

function createPagination(
  page: number,
  limit: number,
  total: number,
): LocationPagination {
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
// 7. LOCATIONS SERVICE
// ======================================================

export class LocationsService {
  private readonly prisma: PrismaClient;

  constructor(options: LocationsServiceOptions) {
    this.prisma = options.prisma;
  }

  // ====================================================
  // 8. CHECK UNIQUE LOCATION NAME
  // ====================================================

  private async ensureUniqueName(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.prisma.location.findFirst({
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
        "A location with this name already exists.",
      );
    }
  }

  // ====================================================
  // 9. CREATE LOCATION
  // ====================================================

  async createLocation(
    input: CreateLocationInput,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const name = input.name.trim();

    await this.ensureUniqueName(name);

    const location = await this.prisma.location.create({
      data: {
        name,

        description: input.description?.trim() || null,

        building: input.building?.trim() || null,

        isActive: true,
      },

      select: locationSelect,
    });

    return {
      success: true as const,
      message: "Campus location created successfully.",
      data: location,
    };
  }

  // ====================================================
  // 10. GET ACTIVE LOCATIONS
  // ====================================================

  async getActiveLocations() {
    const locations = await this.prisma.location.findMany({
      where: {
        isActive: true,
      },

      select: locationSelect,

      orderBy: [
        {
          building: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    return {
      success: true as const,
      data: locations,
      total: locations.length,
    };
  }

  // ====================================================
  // 11. GET LOCATION BY ID
  // ====================================================

  async getLocationById(locationId: string, includeInactive = false) {
    const location = await this.prisma.location.findUnique({
      where: {
        id: locationId,
      },

      select: locationSelect,
    });

    if (!location || (!includeInactive && !location.isActive)) {
      throw new NotFoundException("Campus location not found.");
    }

    return {
      success: true as const,
      data: location,
    };
  }

  // ====================================================
  // 12. SEARCH LOCATIONS
  // ====================================================

  async searchLocations(options: LocationSearchOptions) {
    const page = Math.max(1, Math.floor(options.page));

    const limit = Math.min(100, Math.max(1, Math.floor(options.limit)));

    const skip = (page - 1) * limit;

    const where: Prisma.LocationWhereInput = {
      ...(options.isActive !== undefined
        ? {
            isActive: options.isActive,
          }
        : {
            isActive: true,
          }),

      ...(options.building
        ? {
            building: {
              contains: options.building,
              mode: "insensitive",
            },
          }
        : {}),

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

              {
                building: {
                  contains: options.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.LocationOrderByWithRelationInput = {
      [options.sortBy]: options.sortOrder,
    };

    const [locations, total] = await this.prisma.$transaction([
      this.prisma.location.findMany({
        where,
        select: locationSelect,
        skip,
        take: limit,
        orderBy,
      }),

      this.prisma.location.count({
        where,
      }),
    ]);

    return {
      success: true as const,
      data: locations,
      pagination: createPagination(page, limit, total),
    };
  }

  // ====================================================
  // 13. ADMIN: GET ALL LOCATIONS
  // ====================================================

  async getAllLocationsForAdmin(
    options: LocationSearchOptions,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    return this.searchLocations(options);
  }

  // ====================================================
  // 14. UPDATE LOCATION
  // ====================================================

  async updateLocation(
    locationId: string,
    input: UpdateLocationInput,
    currentUser: AuthenticatedUser,
  ) {
    ensureAdmin(currentUser);

    const existing = await this.prisma.location.findUnique({
      where: {
        id: locationId,
      },

      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!existing) {
      throw new NotFoundException("Campus location not found.");
    }

    if (input.name !== undefined) {
      await this.ensureUniqueName(input.name.trim(), locationId);
    }

    const location = await this.prisma.location.update({
      where: {
        id: locationId,
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

        ...(input.building !== undefined
          ? {
              building: input.building?.trim() || null,
            }
          : {}),
      },

      select: locationSelect,
    });

    return {
      success: true as const,
      message: "Campus location updated successfully.",
      data: location,
    };
  }

  // ====================================================
  // 15. DEACTIVATE LOCATION
  // ====================================================

  async deactivateLocation(locationId: string, currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const location = await this.prisma.location.findUnique({
      where: {
        id: locationId,
      },

      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    if (!location) {
      throw new NotFoundException("Campus location not found.");
    }

    if (!location.isActive) {
      throw new BadRequestException("Location is already inactive.");
    }

    await this.prisma.location.update({
      where: {
        id: locationId,
      },

      data: {
        isActive: false,
      },
    });

    return {
      success: true as const,
      message: "Location deactivated successfully.",
    };
  }

  // ====================================================
  // 16. ACTIVATE LOCATION
  // ====================================================

  async activateLocation(locationId: string, currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const location = await this.prisma.location.findUnique({
      where: {
        id: locationId,
      },

      select: {
        id: true,
        isActive: true,
      },
    });

    if (!location) {
      throw new NotFoundException("Campus location not found.");
    }

    if (location.isActive) {
      throw new BadRequestException("Location is already active.");
    }

    await this.prisma.location.update({
      where: {
        id: locationId,
      },

      data: {
        isActive: true,
      },
    });

    return {
      success: true as const,
      message: "Location activated successfully.",
    };
  }

  // ====================================================
  // 17. LOCATION STATISTICS
  // ====================================================

  async getLocationStatistics(currentUser: AuthenticatedUser) {
    ensureAdmin(currentUser);

    const [total, active, inactive, locationsWithItems] = await Promise.all([
      this.prisma.location.count(),

      this.prisma.location.count({
        where: {
          isActive: true,
        },
      }),

      this.prisma.location.count({
        where: {
          isActive: false,
        },
      }),

      this.prisma.location.findMany({
        select: {
          id: true,
          name: true,
          building: true,
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

        locations: locationsWithItems.map((location) => ({
          id: location.id,
          name: location.name,
          building: location.building,
          isActive: location.isActive,
          itemCount: location._count.items,
        })),
      },
    };
  }

  // ====================================================
  // 18. LOCATION EXISTS
  // ====================================================

  async locationExists(locationId: string): Promise<boolean> {
    const location = await this.prisma.location.findFirst({
      where: {
        id: locationId,
        isActive: true,
      },

      select: {
        id: true,
      },
    });

    return Boolean(location);
  }

  // ====================================================
  // 19. FIND LOCATION BY NAME
  // ====================================================

  async findLocationByName(name: string) {
    return this.prisma.location.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },

        isActive: true,
      },

      select: locationSelect,
    });
  }

  // ====================================================
  // 20. GET LOCATIONS BY BUILDING
  // ====================================================

  async getLocationsByBuilding(building: string) {
    const locations = await this.prisma.location.findMany({
      where: {
        isActive: true,

        building: {
          equals: building.trim(),
          mode: "insensitive",
        },
      },

      select: locationSelect,

      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true as const,
      data: locations,
      total: locations.length,
    };
  }

  // ====================================================
  // 21. GET LOCATION ITEM COUNT
  // ====================================================

  async getLocationItemCount(locationId: string): Promise<number> {
    const location = await this.prisma.location.findUnique({
      where: {
        id: locationId,
      },

      select: {
        id: true,
      },
    });

    if (!location) {
      throw new NotFoundException("Campus location not found.");
    }

    return this.prisma.item.count({
      where: {
        locationId,
      },
    });
  }

  // ====================================================
  // 22. RESTORE LOCATION
  // ====================================================

  async restoreLocation(locationId: string, currentUser: AuthenticatedUser) {
    return this.activateLocation(locationId, currentUser);
  }
}

// ======================================================
// 23. DEFAULT EXPORT
// ======================================================

export default LocationsService;
