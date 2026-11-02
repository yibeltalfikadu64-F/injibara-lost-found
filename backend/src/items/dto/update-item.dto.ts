
/**
 * Injibara Campus Lost & Found
 *
 * Update Item DTO
 *
 * Validates updates to existing items.
 */

import { z } from 'zod';

// ======================================================
// 1. UPDATE ITEM SCHEMA
// ======================================================

export const updateItemDtoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3)
    .max(150)
    .optional(),

  description: z
    .string()
    .trim()
    .min(10)
    .max(5000)
    .optional(),

  dateOccurred: z
    .coerce
    .date()
    .refine(
      (date) => !Number.isNaN(date.getTime()),
      'Enter a valid date.',
    )
    .refine(
      (date) => date <= new Date(),
      'The occurrence date cannot be in the future.',
    )
    .optional(),

  color: z
    .string()
    .trim()
    .max(60)
    .nullable()
    .optional(),

  brand: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .optional(),

  identifyingFeatures: z
    .string()
    .trim()
    .max(2000)
    .nullable()
    .optional(),

  categoryId: z
    .uuid('Invalid category ID.')
    .nullable()
    .optional(),

  locationId: z
    .uuid('Invalid location ID.')
    .nullable()
    .optional(),

  imageUrls: z
    .array(
      z.string().trim().url('Invalid image URL.'),
    )
    .max(5)
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Provide at least one field to update.',
  },
);

// ======================================================
// 2. DTO TYPE
// ======================================================

export type UpdateItemDto = z.infer<
  typeof updateItemDtoSchema
>;

// ======================================================
// 3. VALIDATION HELPER
// ======================================================

export function validateUpdateItemDto(
  data: unknown,
) {
  return updateItemDtoSchema.safeParse(data);
}

// ======================================================
// 4. NORMALIZE INPUT
// ======================================================

export function normalizeUpdateItemDto(
  data: UpdateItemDto,
): UpdateItemDto {
  return {
    ...data,

    ...(data.title !== undefined
      ? { title: data.title.trim() }
      : {}),

    ...(data.description !== undefined
      ? { description: data.description.trim() }
      : {}),

    ...(data.color !== undefined &&
    data.color !== null
      ? { color: data.color.trim() }
      : {}),

    ...(data.brand !== undefined &&
    data.brand !== null
      ? { brand: data.brand.trim() }
      : {}),

    ...(data.identifyingFeatures !== undefined &&
    data.identifyingFeatures !== null
      ? {
          identifyingFeatures:
            data.identifyingFeatures.trim(),
        }
      : {}),

    ...(data.imageUrls !== undefined
      ? {
          imageUrls: [
            ...new Set(
              data.imageUrls.map((url) => url.trim()),
            ),
          ],
        }
      : {}),
  };
}

// ======================================================
// 5. DEFAULT EXPORT
// ======================================================

export default updateItemDtoSchema;
