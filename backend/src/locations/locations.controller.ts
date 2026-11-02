/**
 * Injibara Campus Lost & Found
 *
 * Locations Controller
 *
 * Express 5 HTTP controller.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

import { z } from "zod";

import { LocationsService } from "./locations.service.js";

import {
  getValidatedBody,
  getValidatedQuery,
} from "../common/pipes/validation.pipe.js";

import {
  BadRequestException,
  UnauthorizedException,
} from "../common/filters/http-exception.filter.js";

// ======================================================
// 1. CREATE LOCATION SCHEMA
// ======================================================

export const createLocationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Location name must contain at least 2 characters.")
    .max(150),

  description: z.string().trim().max(1000).nullable().optional(),

  building: z.string().trim().max(150).nullable().optional(),
});

// ======================================================
// 2. UPDATE LOCATION SCHEMA
// ======================================================

export const updateLocationSchema = z
  .object({
    name: z.string().trim().min(2).max(150).optional(),

    description: z.string().trim().max(1000).nullable().optional(),

    building: z.string().trim().max(150).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });

// ======================================================
// 3. LOCATION SEARCH SCHEMA
// ======================================================

export const locationSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().max(150).optional(),

  building: z.string().trim().max(150).optional(),

  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  sortBy: z
    .enum(["name", "building", "createdAt", "updatedAt"])
    .default("name"),

  sortOrder: z.enum(["asc", "desc"]).default("asc"),
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
// 6. LOCATION ID
// ======================================================

function getLocationId(request: Request): string {
  const result = z.uuid().safeParse(request.params.id);

  if (!result.success) {
    throw new BadRequestException("Invalid location ID.");
  }

  return result.data;
}

// ======================================================
// 7. LOCATIONS CONTROLLER
// ======================================================

export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // ====================================================
  // 8. GET ACTIVE LOCATIONS
  // ====================================================

  getActiveLocations: RequestHandler = asyncHandler(
    async (_request, response) => {
      const result = await this.locationsService.getActiveLocations();

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 9. GET LOCATION BY ID
  // ====================================================

  getLocationById: RequestHandler = asyncHandler(async (request, response) => {
    const locationId = getLocationId(request);

    const result = await this.locationsService.getLocationById(locationId);

    response.status(200).json(result);
  });

  // ====================================================
  // 10. CREATE LOCATION
  // ====================================================

  createLocation: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const input = getValidatedBody<{
      name: string;
      description?: string | null;
      building?: string | null;
    }>(request);

    const result = await this.locationsService.createLocation(
      input,
      currentUser,
    );

    response.status(201).json(result);
  });

  // ====================================================
  // 11. SEARCH LOCATIONS
  // ====================================================

  searchLocations: RequestHandler = asyncHandler(async (request, response) => {
    const input = getValidatedQuery<{
      page: number;
      limit: number;
      search?: string;
      building?: string;
      isActive?: boolean;
      sortBy: "name" | "building" | "createdAt" | "updatedAt";
      sortOrder: "asc" | "desc";
    }>(request);

    const result = await this.locationsService.searchLocations(input);

    response.status(200).json(result);
  });

  // ====================================================
  // 12. ADMIN: GET ALL LOCATIONS
  // ====================================================

  getAllLocationsForAdmin: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const input = getValidatedQuery<{
        page: number;
        limit: number;
        search?: string;
        building?: string;
        isActive?: boolean;
        sortBy: "name" | "building" | "createdAt" | "updatedAt";
        sortOrder: "asc" | "desc";
      }>(request);

      const result = await this.locationsService.getAllLocationsForAdmin(
        input,
        currentUser,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 13. UPDATE LOCATION
  // ====================================================

  updateLocation: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const locationId = getLocationId(request);

    const input = getValidatedBody<{
      name?: string;
      description?: string | null;
      building?: string | null;
    }>(request);

    const result = await this.locationsService.updateLocation(
      locationId,
      input,
      currentUser,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 14. DEACTIVATE LOCATION
  // ====================================================

  deactivateLocation: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const locationId = getLocationId(request);

      const result = await this.locationsService.deactivateLocation(
        locationId,
        currentUser,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 15. ACTIVATE LOCATION
  // ====================================================

  activateLocation: RequestHandler = asyncHandler(async (request, response) => {
    const currentUser = getCurrentUser(request);

    const locationId = getLocationId(request);

    const result = await this.locationsService.activateLocation(
      locationId,
      currentUser,
    );

    response.status(200).json(result);
  });

  // ====================================================
  // 16. LOCATION STATISTICS
  // ====================================================

  getLocationStatistics: RequestHandler = asyncHandler(
    async (request, response) => {
      const currentUser = getCurrentUser(request);

      const result =
        await this.locationsService.getLocationStatistics(currentUser);

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 17. GET LOCATIONS BY BUILDING
  // ====================================================

  getLocationsByBuilding: RequestHandler = asyncHandler(
    async (request, response) => {
      const buildingResult = z
        .string()
        .trim()
        .min(1)
        .max(150)
        .safeParse(request.params.building);

      if (!buildingResult.success) {
        throw new BadRequestException("A valid building name is required.");
      }

      const result = await this.locationsService.getLocationsByBuilding(
        buildingResult.data,
      );

      response.status(200).json(result);
    },
  );

  // ====================================================
  // 18. LOCATION ITEM COUNT
  // ====================================================

  getLocationItemCount: RequestHandler = asyncHandler(
    async (request, response) => {
      const locationId = getLocationId(request);

      const total =
        await this.locationsService.getLocationItemCount(locationId);

      response.status(200).json({
        success: true,

        data: {
          locationId,
          totalItems: total,
        },
      });
    },
  );
}

// ======================================================
// 19. DEFAULT EXPORT
// ======================================================

export default LocationsController;
