/**
 * Injibara Campus Lost & Found
 *
 * Create Claim DTO
 *
 * Validates a user's request to claim a found item.
 */

import { z } from "zod";

// ======================================================
// 1. PROOF ANSWER SCHEMA
// ======================================================

/**
 * Answers to ownership questions.
 *
 * Example:
 *
 * {
 *   "itemColor": "Black",
 *   "brand": "Samsung",
 *   "uniqueFeature": "Small scratch on the back"
 * }
 *
 * Do not ask users to submit passwords, PINs,
 * financial account details, or other secrets.
 */

export const proofAnswersSchema = z
  .record(z.string().trim().min(1).max(100), z.string().trim().min(1).max(1000))
  .refine((answers) => Object.keys(answers).length <= 20, {
    message: "You can provide a maximum of 20 proof answers.",
  });

// ======================================================
// 2. CREATE CLAIM SCHEMA
// ======================================================

export const createClaimDtoSchema = z.object({
  itemId: z.uuid({
    error: "A valid item ID is required.",
  }),

  description: z
    .string()
    .trim()
    .min(10, "Please explain why you believe this item belongs to you.")
    .max(3000, "Claim description cannot exceed 3000 characters."),

  proofAnswers: proofAnswersSchema.optional(),
});

// ======================================================
// 3. CREATE CLAIM TYPE
// ======================================================

export type CreateClaimDto = z.infer<typeof createClaimDtoSchema>;

// ======================================================
// 4. VALIDATION HELPER
// ======================================================

export function validateCreateClaimDto(input: unknown): CreateClaimDto {
  return createClaimDtoSchema.parse(input);
}

// ======================================================
// 5. SAFE NORMALIZATION
// ======================================================

export function normalizeCreateClaimDto(input: CreateClaimDto): CreateClaimDto {
  const normalizedAnswers = input.proofAnswers
    ? Object.fromEntries(
        Object.entries(input.proofAnswers).map(([key, value]) => [
          key.trim(),
          value.trim(),
        ]),
      )
    : undefined;

  return {
    itemId: input.itemId,
    description: input.description.trim(),
    ...(normalizedAnswers
      ? {
          proofAnswers: normalizedAnswers,
        }
      : {}),
  };
}

// ======================================================
// 6. DEFAULT EXPORT
// ======================================================

export default createClaimDtoSchema;
