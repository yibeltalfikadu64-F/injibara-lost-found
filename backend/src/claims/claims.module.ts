
/**
 * Injibara Campus Lost & Found
 *
 * Claims Module
 *
 * Express 5 Router composition.
 *
 * Base path:
 * /api/v1/claims
 */

import {
  Router,
} from 'express';

import type {
  PrismaClient,
} from '../../generated/prisma/client.js';

import {
  ClaimsService,
} from './claims.service.js';

import {
  ClaimsController,
  claimSearchSchema,
} from './claims.controller.js';

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
  validateBody,
  validateQuery,
} from '../common/pipes/validation.pipe.js';

import {
  createRequiredJwtGuard,
} from '../common/guards/jwt-auth.guard.js';

import {
  requireRoles,
} from '../common/guards/roles.guard.js';

import {
  createPrismaUserResolver,
} from '../auth/strategies/jwt.strategy.js';

import {
  configuration,
} from '../config/configuration.js';

// ======================================================
// 1. MODULE OPTIONS
// ======================================================

export interface ClaimsModuleOptions {
  prisma: PrismaClient;
}

// ======================================================
// 2. CREATE CLAIMS MODULE
// ======================================================

export function createClaimsModule(
  options: ClaimsModuleOptions,
): Router {
  const router = Router();

  // ====================================================
  // 3. INITIALIZE SERVICE
  // ====================================================

  const claimsService =
    new ClaimsService({
      prisma: options.prisma,
    });

  // ====================================================
  // 4. INITIALIZE CONTROLLER
  // ====================================================

  const controller =
    new ClaimsController(
      claimsService,
    );

  // ====================================================
  // 5. CREATE USER RESOLVER
  // ====================================================

  const userResolver =
    createPrismaUserResolver(
      options.prisma,
    );

  // ====================================================
  // 6. JWT CONFIGURATION
  // ====================================================

  const jwtOptions = {
    secret:
      configuration.jwt.accessSecret,

    algorithms: ['HS256'],

    issuer: 'injibara-lost-found',

    audience: 'injibara-lost-found-mobile',

    tokenType: 'access',
  } as const;

  // ====================================================
  // 7. AUTHENTICATION
  // ====================================================

  const authenticate =
    createRequiredJwtGuard(
      userResolver,
      jwtOptions,
    );

  // ====================================================
  // 8. ROLE PERMISSIONS
  // ====================================================

  const adminOnly =
    requireRoles('ADMIN');

  const handoverOfficers =
    requireRoles(
      'ADMIN',
      'SECURITY',
    );

  // ====================================================
  // 9. ALL CLAIM ROUTES REQUIRE AUTHENTICATION
  // ====================================================

  router.use(authenticate);

  // ====================================================
  // 10. USER CLAIM ROUTES
  // ====================================================

  /**
   * POST /api/v1/claims
   *
   * Submit a new claim.
   */

  router.post(
    '/',
    validateBody(createClaimDtoSchema),
    controller.createClaim,
  );

  /**
   * GET /api/v1/claims/my-claims
   *
   * Return the authenticated user's claims.
   */

  router.get(
    '/my-claims',
    validateQuery(claimSearchSchema),
    controller.getMyClaims,
  );

  /**
   * GET /api/v1/claims/item/:itemId
   *
   * View claims for an item.
   *
   * Service verifies that the requester is:
   * - The item reporter, or
   * - An administrator, or
   * - Security staff.
   */

  router.get(
    '/item/:itemId',
    controller.getClaimsForItem,
  );

  // ====================================================
  // 11. ADMIN CLAIM ROUTES
  // ====================================================

  /**
   * GET /api/v1/claims/admin/statistics
   */

  router.get(
    '/admin/statistics',
    adminOnly,
    controller.getClaimStatistics,
  );

  /**
   * GET /api/v1/claims/admin/all
   */

  router.get(
    '/admin/all',
    adminOnly,
    validateQuery(claimSearchSchema),
    controller.getAllClaims,
  );

  /**
   * GET /api/v1/claims/admin/pending
   */

  router.get(
    '/admin/pending',
    adminOnly,
    validateQuery(claimSearchSchema),
    controller.getPendingClaims,
  );

  /**
   * PATCH /api/v1/claims/:id/review
   *
   * Approve or reject a claim.
   */

  router.patch(
    '/:id/review',
    adminOnly,
    validateBody(reviewClaimDtoSchema),
    controller.reviewClaim,
  );

  // ====================================================
  // 12. HANDOVER ROUTES
  // ====================================================

  /**
   * POST /api/v1/claims/:id/handover-code
   *
   * Generate a code for an approved claim.
   *
   * Administrator only.
   */

  router.post(
    '/:id/handover-code',
    adminOnly,
    controller.generateHandoverCode,
  );

  /**
   * POST /api/v1/claims/verify-handover
   *
   * Security staff or administrators verify
   * the handover code.
   */

  router.post(
    '/verify-handover',
    handoverOfficers,
    validateBody(verifyHandoverDtoSchema),
    controller.verifyHandover,
  );

  // ====================================================
  // 13. USER CLAIM CANCELLATION
  // ====================================================

  /**
   * PATCH /api/v1/claims/:id/cancel
   *
   * The service checks claim ownership.
   */

  router.patch(
    '/:id/cancel',
    controller.cancelMyClaim,
  );

  // ====================================================
  // 14. CLAIM STATUS
  // ====================================================

  /**
   * GET /api/v1/claims/:id/status
   */

  router.get(
    '/:id/status',
    controller.getClaimStatus,
  );

  // ====================================================
  // 15. GET CLAIM DETAILS
  // ====================================================

  /**
   * GET /api/v1/claims/:id
   *
   * Keep this route after named routes.
   */

  router.get(
    '/:id',
    controller.getClaimById,
  );

  // ====================================================
  // 16. MODULE INITIALIZATION
  // ====================================================

  console.info(
    '[CLAIMS MODULE] Claims routes registered.',
  );

  return router;
}

// ======================================================
// 17. DEFAULT EXPORT
// ======================================================

export default createClaimsModule;
