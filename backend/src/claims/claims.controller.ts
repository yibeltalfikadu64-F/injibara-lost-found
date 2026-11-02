
/**
 * Injibara Campus Lost & Found
 *
 * Claims Controller
 *
 * Express 5 HTTP request handlers.
 */

import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';

import { z } from 'zod';

import {
  ClaimsService,
} from './claims.service.js';

import {
  createClaimDtoSchema,
} from './dto/create-claim.dto.js';

import {
  reviewClaimDtoSchema,
} from './dto/review-claim.dto.js';

import {
  verifyHandoverDtoSchema,
} from './dto/handover.dto.js';

import {
  getValidatedBody,
  getValidatedQuery,
} from '../common/pipes/validation.pipe.js';

import {
  BadRequestException,
  UnauthorizedException,
} from '../common/filters/http-exception.filter.js';

// ======================================================
// 1. CLAIM STATUS SCHEMA
// ======================================================

export const claimStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
]);

// ======================================================
// 2. CLAIM SEARCH QUERY SCHEMA
// ======================================================

export const claimSearchSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),

  status: claimStatusSchema.optional(),

  search: z
    .string()
    .trim()
    .max(150)
    .optional(),

  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc'),
});

// ======================================================
// 3. CLAIM ID PARAMETER SCHEMA
// ======================================================

const claimIdSchema = z.uuid();

// ======================================================
// 4. ITEM ID PARAMETER SCHEMA
// ======================================================

const itemIdSchema = z.uuid();

// ======================================================
// 5. ASYNC HANDLER
// ======================================================

function asyncHandler(
  handler: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<unknown>,
): RequestHandler {
  return (
    request,
    response,
    next,
  ) => {
    Promise.resolve(
      handler(request, response, next),
    ).catch(next);
  };
}

// ======================================================
// 6. CURRENT USER
// ======================================================

function getCurrentUser(request: Request) {
  if (!request.user) {
    throw new UnauthorizedException(
      'Authentication is required.',
    );
  }

  return request.user;
}

// ======================================================
// 7. CLAIM ID
// ======================================================

function getClaimId(
  request: Request,
): string {
  const result = claimIdSchema.safeParse(
    request.params.id,
  );

  if (!result.success) {
    throw new BadRequestException(
      'Invalid claim ID.',
    );
  }

  return result.data;
}

// ======================================================
// 8. ITEM ID
// ======================================================

function getItemId(
  request: Request,
): string {
  const result = itemIdSchema.safeParse(
    request.params.itemId,
  );

  if (!result.success) {
    throw new BadRequestException(
      'Invalid item ID.',
    );
  }

  return result.data;
}

// ======================================================
// 9. CLAIMS CONTROLLER
// ======================================================

export class ClaimsController {
  constructor(
    private readonly claimsService: ClaimsService,
  ) {}

  // ====================================================
  // 10. CREATE CLAIM
  // ====================================================

  createClaim: RequestHandler =
    asyncHandler(
      async (request, response) => {
        const currentUser =
          getCurrentUser(request);

        const input =
          getValidatedBody<
            z.infer<typeof createClaimDtoSchema>
          >(request);

        const result =
          await this.claimsService.createClaim(
            input,
            currentUser,
          );

        response.status(201).json(result);
      },
    );

  // ====================================================
  // 11. GET MY CLAIMS
  // ====================================================

  getMyClaims: RequestHandler =
    asyncHandler(
      async (request, response) => {
        const currentUser =
          getCurrentUser(request);

        const input =
          getValidatedQuery<{
            page: number;
            limit: number;
            status:
              | 'PENDING'
              | 'APPROVED'
              | 'REJECTED'
              | 'CANCELLED'
              | 'COMPLETED'
              | undefined;
            search?: string;
            sortOrder: 'asc' | 'desc';
          }>(request);

        const result =
          await this.claimsService.getMyClaims(
            input,
            currentUser,
          );

        response.status(200).json(result);
      },
    );

  // ====================================================
  // 12. GET MY CLAIM BY ID
  // ====================================================

  getClaimById: RequestHandler =
    asyncHandler(
      async (request, response) => {
        const currentUser =
          getCurrentUser(request);

        const claimId =
          getClaimId(request);

        const result =
          await this.claimsService.getClaimById(
            claimId,
            currentUser,
          );

        response.status(200).json(result);
      },
    );

  // ====================================================
  // 13. CANCEL MY CLAIM
  // ====================================================

  cancelMyClaim: RequestHandler =
    asyncHandler(
      async (request, response) => {
        const currentUser =
          getCurrentUser(request);

        const claimId =
          getClaimId(request);

        const result =
          await this.claimsService.cancelMyClaim(
            claimId,
            currentUser,
          );

        response.status(200).json(result);
      },
    );

  // ====================================================
  // 14. ADMIN GET ALL CLAIMS
  // ====================================================

  getAllClaims: RequestHandler =
    asyncHandler(
      async (request, response) => {
        const currentUser =
          getCurrentUser(request);

        const input =
          getValidatedQuery<{
            page: number;
            limit: number;
            status:
              | 'PENDING'
              | 'APPROVED'
              | 'REJECTED'
              | 'CANCELLED'
              | 'COMPLETED'
              | undefined;
            search?: string;
            sortOrder: 'asc' | 'desc';
          }>(request);

        const result =
          await this.claimsService.getAllClaims(
            input,
            currentUser,
          );

        response.status(200).json(result);
      },
    );

  // ====================================================
  // 15. ADMIN GET PENDING CLAIMS
  // ====================================================

  getPendingClaims: RequestHandler =
    asyncHandler(
      async (request, response) => {
        const currentUser =
          getCurrentUser(request);

        const input =
          getValidatedQuery<{
            page: number;
            limit: number;
            status:
              | 'PENDING'
              | 'APPROVED'
              | 'REJECTED'
              | 'CANCELLED'
              | 'COMPLETED'
              | undefined;
            search?: string;
            sortOrder: 'asc' | 'desc';
          }>(request);

        const result =
          await this.claimsService.getPendingClaims(
            input,
            currentUser,
          );

        response.status(200).json(result);
      },
    );

  // ====================================================
  // 16. ADMIN REVIEW CLAIM
  // ====================================================

  reviewClaim: RequestHandler =
    asyncHandler(
      async (request, response) => {
        const currentUser =
          getCurrentUser(request);

        const claimId =
          getClaimId(request);

        const input =
          getValidatedBody<
            z.infer<typeof reviewClaimDtoSchema>
          >(request);

        const result =
          await this.claimsService.reviewClaim(
            claimId,
            input,
            currentUser,
          );

        response.status(200).json(result);
      },
    );

  // ====================================================
  // 17. GENERATE HANDOVER CODE
  // ====================================================

  generateHandoverCode: RequestHandler =
    asyncHandler(
      async (request, response) => {
        const currentUser =
          getCurrentUser(request);

        const claimId =
          getClaimId(request);

        const result =
          await this.claimsService.generateHandoverCode(
            claimId,
            currentUser,
          );

        response.status(200).json(result);
      },
    );

  // ====================================================
  // 18. VERIFY HANDOVER
  // ====================================================

  verifyHandover: RequestHandler =
    asyncHandler(
      async (request, response) => {
        const currentUser =
          getCurrentUser(request);

        const input =
          getValidatedBody<
            z.infer<typeof verifyHandoverDtoSchema>
          >(request);

        const result =
          await this.claimsService.verifyHandover(
            input.claimId,
            input.handoverCode,
            currentUser,
          );

        response.status(200).json(result);
      },
    );

  // ====================================================
  // 19. ADMIN CLAIM STATISTICS
  // ====================================================

  getClaimStatistics: RequestHandler =
    asyncHandler(
      async (request, response) => {
        const currentUser =
          getCurrentUser(request);

        const result =
          await this.claimsService.getClaimStatistics(
            currentUser,
          );

        response.status(200).json(result);
      },
    );

  // ====================================================
  // 20. GET CLAIMS FOR AN ITEM
  // ====================================================

  getClaimsForItem: RequestHandler =
    asyncHandler(
      async (request, response) => {
        const currentUser =
          getCurrentUser(request);

        const itemId =
          getItemId(request);

        const result =
          await this.claimsService.getClaimsForItem(
            itemId,
            currentUser,
          );

        response.status(200).json(result);
      },
    );

  // ====================================================
  // 21. GET CLAIM STATUS
  // ====================================================

  getClaimStatus: RequestHandler =
    asyncHandler(
      async (request, response) => {
        const currentUser =
          getCurrentUser(request);

        const claimId =
          getClaimId(request);

        const result =
          await this.claimsService.getClaimStatus(
            claimId,
            currentUser,
          );

        response.status(200).json(result);
      },
    );
}

// ======================================================
// 22. DEFAULT EXPORT
// ======================================================

export default ClaimsController;
