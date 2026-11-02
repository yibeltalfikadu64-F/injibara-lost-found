/**
 * Injibara Campus Lost & Found
 *
 * Create Item DTO
 *
 * Validates new LOST and FOUND item submissions.
 */

import { z } from "zod";

// ======================================================
// 1. ITEM TYPE
// ======================================================

export const ITEM_TYPES = ["LOST", "FOUND"] as const;

// ======================================================
// 2. CREATE ITEM SCHEMA
// ======================================================

export const createItemDtoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Item title must contain at least 3 characters.")
    .max(150, "Item title cannot exceed 150 characters."),

  description: z
    .string()
    .trim()
    .min(10, "Please provide a more detailed description.")
    .max(5000, "Description cannot exceed 5000 characters."),

  type: z.enum(ITEM_TYPES),

  dateOccurred: z.coerce
    .date()
    .refine((date) => !Number.isNaN(date.getTime()), "Enter a valid date.")
    .refine(
      (date) => date <= new Date(),
      "The occurrence date cannot be in the future.",
    ),

  color: z.string().trim().max(60).nullable().optional(),

  brand: z.string().trim().max(100).nullable().optional(),

  identifyingFeatures: z.string().trim().max(2000).nullable().optional(),

  categoryId: z.uuid("Invalid category ID.").nullable().optional(),

  locationId: z.uuid("Invalid location ID.").nullable().optional(),

  imageUrls: z
    .array(z.string().trim().url("Each image must have a valid URL."))
    .max(5, "You can attach a maximum of 5 images.")
    .default([]),
});

// ======================================================
// 3. DTO TYPE
// ======================================================

export type CreateItemDto = z.infer<typeof createItemDtoSchema>;

// ======================================================
// 4. VALIDATION HELPER
// ======================================================

export function validateCreateItemDto(data: unknown) {
  return createItemDtoSchema.safeParse(data);
}

// ======================================================
// 5. NORMALIZE INPUT
// ======================================================

export function normalizeCreateItemDto(data: CreateItemDto): CreateItemDto {
  return {
    ...data,

    title: data.title.trim(),

    description: data.description.trim(),

    color: data.color?.trim() || null,

    brand: data.brand?.trim() || null,

    identifyingFeatures: data.identifyingFeatures?.trim() || null,

    imageUrls: [...new Set(data.imageUrls.map((url) => url.trim()))],
  };
}

// ======================================================
// 6. DEFAULT EXPORT
// ======================================================

export default createItemDtoSchema;
