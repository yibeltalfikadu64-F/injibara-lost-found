/**
 * Reset Password DTO
 *
 * Validates password reset information.
 */

import { z } from "zod";

// ======================================================
// 1. RESET PASSWORD SCHEMA
// ======================================================

export const resetPasswordDtoSchema = z
  .object({
    token: z.string().trim().min(20).max(4096),

    newPassword: z
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
      .refine((value) => /\d/.test(value), "Password must contain a number."),

    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",

    path: ["confirmPassword"],
  });

// ======================================================
// 2. DTO TYPE
// ======================================================

export type ResetPasswordDto = z.infer<typeof resetPasswordDtoSchema>;

// ======================================================
// 3. VALIDATION HELPER
// ======================================================

export function validateResetPasswordDto(data: unknown) {
  return resetPasswordDtoSchema.safeParse(data);
}

// ======================================================
// 4. DEFAULT EXPORT
// ======================================================

export default resetPasswordDtoSchema;
