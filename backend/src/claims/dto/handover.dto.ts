/**
 * Injibara Campus Lost & Found
 *
 * Handover DTO
 *
 * Validates physical item handover operations.
 */

import { z } from "zod";

// ======================================================
// 1. GENERATE HANDOVER CODE SCHEMA
// ======================================================

export const generateHandoverDtoSchema = z.object({
  claimId: z.uuid({
    error: "A valid claim ID is required.",
  }),
});

// ======================================================
// 2. VERIFY HANDOVER SCHEMA
// ======================================================

export const verifyHandoverDtoSchema = z.object({
  claimId: z.uuid({
    error: "A valid claim ID is required.",
  }),

  handoverCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Handover code must contain exactly 6 digits."),
});

// ======================================================
// 3. CANCEL HANDOVER CODE SCHEMA
// ======================================================

export const cancelHandoverDtoSchema = z.object({
  claimId: z.uuid({
    error: "A valid claim ID is required.",
  }),

  reason: z.string().trim().min(5).max(500),
});

// ======================================================
// 4. DTO TYPES
// ======================================================

export type GenerateHandoverDto = z.infer<typeof generateHandoverDtoSchema>;

export type VerifyHandoverDto = z.infer<typeof verifyHandoverDtoSchema>;

export type CancelHandoverDto = z.infer<typeof cancelHandoverDtoSchema>;

// ======================================================
// 5. VALIDATION HELPERS
// ======================================================

export function validateGenerateHandoverDto(
  input: unknown,
): GenerateHandoverDto {
  return generateHandoverDtoSchema.parse(input);
}

export function validateVerifyHandoverDto(input: unknown): VerifyHandoverDto {
  return verifyHandoverDtoSchema.parse(input);
}

export function validateCancelHandoverDto(input: unknown): CancelHandoverDto {
  return cancelHandoverDtoSchema.parse(input);
}

// ======================================================
// 6. DEFAULT EXPORT
// ======================================================

export default verifyHandoverDtoSchema;
