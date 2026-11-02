/**
 * Verify Email DTO
 *
 * Validates email verification requests.
 */

import { z } from "zod";

// ======================================================
// 1. VERIFY EMAIL SCHEMA
// ======================================================

export const verifyEmailDtoSchema = z.object({
  token: z
    .string()
    .trim()
    .min(20, "Verification token is required.")
    .max(4096, "Invalid verification token."),
});

// ======================================================
// 2. DTO TYPE
// ======================================================

export type VerifyEmailDto = z.infer<typeof verifyEmailDtoSchema>;

// ======================================================
// 3. VALIDATION HELPER
// ======================================================

export function validateVerifyEmailDto(data: unknown) {
  return verifyEmailDtoSchema.safeParse(data);
}

// ======================================================
// 4. DEFAULT EXPORT
// ======================================================

export default verifyEmailDtoSchema;
