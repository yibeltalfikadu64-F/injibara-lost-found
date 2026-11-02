/**
 * Forgot Password DTO
 *
 * Validates password recovery requests.
 */

import { z } from "zod";

// ======================================================
// 1. FORGOT PASSWORD SCHEMA
// ======================================================

export const forgotPasswordDtoSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(254),
});

// ======================================================
// 2. DTO TYPE
// ======================================================

export type ForgotPasswordDto = z.infer<typeof forgotPasswordDtoSchema>;

// ======================================================
// 3. VALIDATION HELPER
// ======================================================

export function validateForgotPasswordDto(data: unknown) {
  return forgotPasswordDtoSchema.safeParse(data);
}

// ======================================================
// 4. DEFAULT EXPORT
// ======================================================

export default forgotPasswordDtoSchema;
