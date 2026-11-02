/**
 * Injibara Campus Lost & Found
 *
 * Search Item DTO
 *
 * Validates item search and pagination queries.
 */

import { z } from "zod";

// ======================================================
// 1. ALLOWED FILTER VALUES
// ======================================================

export const SEARCH_ITEM_TYPES = ["LOST", "FOUND"] as const;

export const SEARCH_ITEM_STATUSES = [
  "OPEN",
  "CLAIMED",
  "RESOLVED",
  "ARCHIVED",
] as const;

// ======================================================
// 2. SEARCH ITEM SCHEMA
// ======================================================

export const searchItemDtoSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    search: z.string().trim().max(150).optional(),

    type: z.enum(SEARCH_ITEM_TYPES).optional(),

    status: z.enum(SEARCH_ITEM_STATUSES).optional(),

    categoryId: z.uuid().optional(),

    locationId: z.uuid().optional(),

    color: z.string().trim().max(60).optional(),

    brand: z.string().trim().max(100).optional(),

    dateFrom: z.coerce.date().optional(),

    dateTo: z.coerce.date().optional(),

    sortBy: z
      .enum(["dateReported", "dateOccurred", "createdAt", "title"])
      .default("dateReported"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return data.dateFrom <= data.dateTo;
      }

      return true;
    },
    {
      message: "Start date cannot be after end date.",
      path: ["dateFrom"],
    },
  );

// ======================================================
// 3. DTO TYPE
// ======================================================

export type SearchItemDto = z.infer<typeof searchItemDtoSchema>;

// ======================================================
// 4. VALIDATION HELPER
// ======================================================

export function validateSearchItemDto(data: unknown) {
  return searchItemDtoSchema.safeParse(data);
}

// ======================================================
// 5. DEFAULT SEARCH OPTIONS
// ======================================================

export const DEFAULT_SEARCH_OPTIONS = {
  page: 1,

  limit: 20,

  sortBy: "dateReported" as const,

  sortOrder: "desc" as const,
};

// ======================================================
// 6. NORMALIZE SEARCH
// ======================================================

export function normalizeSearchItemDto(data: SearchItemDto): SearchItemDto {
  return {
    ...DEFAULT_SEARCH_OPTIONS,

    ...data,

    search: data.search?.trim() || undefined,

    color: data.color?.trim() || undefined,

    brand: data.brand?.trim() || undefined,
  };
}

// ======================================================
// 7. DEFAULT EXPORT
// ======================================================

export default searchItemDtoSchema;
