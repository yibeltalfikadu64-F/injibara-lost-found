/**
 * Injibara Campus Lost & Found
 *
 * Update User DTO
 *
 * Validates user profile update requests.
 */

import { z } from "zod";

// ======================================================
// 1. UPDATE USER SCHEMA
// ======================================================

export const updateUserDtoSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must contain at least 2 characters.")
      .max(100, "Full name cannot exceed 100 characters.")
      .optional(),

    department: z
      .string()
      .trim()
      .min(2, "Department must contain at least 2 characters.")
      .max(100, "Department cannot exceed 100 characters.")
      .nullable()
      .optional(),

    phone: z
      .string()
      .trim()
      .min(7, "Phone number must contain at least 7 characters.")
      .max(30, "Phone number cannot exceed 30 characters.")
      .nullable()
      .optional(),

    avatarUrl: z
      .string()
      .trim()
      .url("Enter a valid avatar URL.")
      .max(2048)
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });

// ======================================================
// 2. UPDATE USER TYPE
// ======================================================

export type UpdateUserDto = z.infer<typeof updateUserDtoSchema>;

// ======================================================
// 3. VALIDATE UPDATE USER DATA
// ======================================================

export function validateUpdateUserDto(data: unknown) {
  return updateUserDtoSchema.safeParse(data);
}

// ======================================================
// 4. NORMALIZE UPDATE DATA
// ======================================================

export function normalizeUpdateUserDto(data: UpdateUserDto): UpdateUserDto {
  return {
    ...data,

    ...(data.fullName !== undefined
      ? {
          fullName: data.fullName.trim(),
        }
      : {}),

    ...(data.department !== undefined && data.department !== null
      ? {
          department: data.department.trim(),
        }
      : {}),

    ...(data.phone !== undefined && data.phone !== null
      ? {
          phone: data.phone.trim(),
        }
      : {}),

    ...(data.avatarUrl !== undefined && data.avatarUrl !== null
      ? {
          avatarUrl: data.avatarUrl.trim(),
        }
      : {}),
  };
}

// ======================================================
// 5. DEFAULT EXPORT
// ======================================================

export default updateUserDtoSchema;
