/**
 * Injibara Campus Lost & Found
 *
 * Change Password DTO
 *
 * Validates password change requests.
 */

import { z } from "zod";

// ======================================================
// 1. PASSWORD RULES
// ======================================================

const passwordSchema = z
  .string()
  .min(12, "Password must contain at least 12 characters.")
  .max(128, "Password cannot exceed 128 characters.")
  .refine(
    (value) => /[a-z]/.test(value),
    "Password must contain a lowercase letter.",
  )
  .refine(
    (value) => /[A-Z]/.test(value),
    "Password must contain an uppercase letter.",
  )
  .refine((value) => /\d/.test(value), "Password must contain a number.");

// ======================================================
// 2. CHANGE PASSWORD SCHEMA
// ======================================================

export const changePasswordDtoSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required.")
      .max(128),

    newPassword: passwordSchema,

    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password.")
      .max(128),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",

    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Your new password must be different from your current password.",

    path: ["newPassword"],
  });

// ======================================================
// 3. DTO TYPE
// ======================================================

export type ChangePasswordDto = z.infer<typeof changePasswordDtoSchema>;

// ======================================================
// 4. VALIDATION HELPER
// ======================================================

export function validateChangePasswordDto(data: unknown) {
  return changePasswordDtoSchema.safeParse(data);
}

// ======================================================
// 5. PASSWORD NORMALIZATION
// ======================================================

/**
 * Do not trim passwords.
 *
 * Whitespace can be a legitimate part of a password.
 */

export function normalizeChangePasswordDto(
  data: ChangePasswordDto,
): ChangePasswordDto {
  return {
    currentPassword: data.currentPassword,

    newPassword: data.newPassword,

    confirmPassword: data.confirmPassword,
  };
}

// ======================================================
// 6. DEFAULT EXPORT
// ======================================================

export default changePasswordDtoSchema;
