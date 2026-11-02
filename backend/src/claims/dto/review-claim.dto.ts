/**
 * Injibara Campus Lost & Found
 *
 * Review Claim DTO
 *
 * Used by administrators to approve or reject claims.
 */

import { z } from "zod";

// ======================================================
// 1. REVIEW DECISION
// ======================================================

export const claimReviewDecisionSchema = z.enum(["APPROVE", "REJECT"]);

export type ClaimReviewDecision = z.infer<typeof claimReviewDecisionSchema>;

// ======================================================
// 2. REVIEW CLAIM SCHEMA
// ======================================================

export const reviewClaimDtoSchema = z
  .object({
    decision: claimReviewDecisionSchema,

    reviewNote: z
      .string()
      .trim()
      .max(2000, "Review note cannot exceed 2000 characters.")
      .optional(),
  })
  .superRefine((data, context) => {
    if (
      data.decision === "REJECT" &&
      (!data.reviewNote || data.reviewNote.length < 5)
    ) {
      context.addIssue({
        code: "custom",
        path: ["reviewNote"],
        message: "A rejection reason of at least 5 characters is required.",
      });
    }
  });

// ======================================================
// 3. REVIEW CLAIM TYPE
// ======================================================

export type ReviewClaimDto = z.infer<typeof reviewClaimDtoSchema>;

// ======================================================
// 4. VALIDATION HELPER
// ======================================================

export function validateReviewClaimDto(input: unknown): ReviewClaimDto {
  return reviewClaimDtoSchema.parse(input);
}

// ======================================================
// 5. NORMALIZATION
// ======================================================

export function normalizeReviewClaimDto(input: ReviewClaimDto): ReviewClaimDto {
  return {
    decision: input.decision,
    ...(input.reviewNote
      ? {
          reviewNote: input.reviewNote.trim(),
        }
      : {}),
  };
}

// ======================================================
// 6. DEFAULT EXPORT
// ======================================================

export default reviewClaimDtoSchema;
