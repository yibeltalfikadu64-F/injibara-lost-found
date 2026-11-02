/**
 * Injibara Campus Lost & Found
 * Shared Claim Types
 *
 * Used by:
 * - Claim management
 * - Claim review
 * - Ownership verification
 * - Security handover
 * - Claim history
 * - Recovery statistics
 */

/* =========================================================
   1. CLAIM ENUMS
========================================================= */

export type ClaimStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type ClaimVerificationStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "VERIFIED"
  | "FAILED";

export type HandoverStatus =
  | "NOT_STARTED"
  | "SCHEDULED"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type ClaimSortField =
  | "createdAt"
  | "updatedAt"
  | "status"
  | "reviewedAt"
  | "completedAt";

export type ClaimSortOrder = "asc" | "desc";

/* =========================================================
   2. CLAIMANT
========================================================= */

export interface Claimant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  studentId?: string | null;
  employeeId?: string | null;
  role?: string;
  department?: string | null;
}

export interface ClaimantSummary {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string | null;
}

/* =========================================================
   3. CLAIM ITEM SUMMARY
========================================================= */

export interface ClaimItemSummary {
  id: string;
  title: string;
  type: "LOST" | "FOUND";
  status?: string;
  imageUrls?: string[];
  dateReported?: string;
  category?: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    name: string;
  };
}

/* =========================================================
   4. CLAIM EVIDENCE
========================================================= */

export interface ClaimEvidence {
  id?: string;
  claimId?: string;
  fileUrl: string;
  fileName?: string;
  mimeType?: string;
  description?: string;
  uploadedAt?: string;
}

export interface ClaimEvidenceInput {
  file: File;
  description?: string;
}

export interface OwnershipEvidence {
  id: string;
  description: string;
  evidenceType:
    | "IDENTIFYING_FEATURE"
    | "PURCHASE_PROOF"
    | "PHOTO"
    | "SERIAL_NUMBER"
    | "OTHER";
  fileUrl?: string | null;
  createdAt: string;
}

/* =========================================================
   5. CLAIM MODEL
========================================================= */

export interface Claim {
  id: string;
  itemId: string;
  claimantId: string;

  description: string;
  status: ClaimStatus;

  item?: ClaimItemSummary;
  claimant?: Claimant;

  evidence?: ClaimEvidence[];
  verificationStatus?: ClaimVerificationStatus;

  reviewedById?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  rejectionReason?: string | null;

  handoverStatus?: HandoverStatus;
  handoverLocation?: string | null;
  handoverScheduledAt?: string | null;
  completedAt?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface ClaimDetails extends Claim {
  item: ClaimItemSummary;
  claimant: Claimant;
  evidence: ClaimEvidence[];
  verificationHistory?: VerificationRecord[];
  handover?: HandoverRecord | null;
}

/* =========================================================
   6. CREATE AND UPDATE CLAIM
========================================================= */

export interface CreateClaimInput {
  itemId: string;
  description: string;
  evidence?: ClaimEvidenceInput[];
}

export interface UpdateClaimInput {
  description?: string;
  evidence?: ClaimEvidenceInput[];
}

export interface CancelClaimInput {
  reason?: string;
}

/* =========================================================
   7. CLAIM REVIEW
========================================================= */

export interface ReviewClaimInput {
  status: "APPROVED" | "REJECTED";
  reviewNotes?: string;
  rejectionReason?: string;
}

export interface ApproveClaimInput {
  reviewNotes?: string;
}

export interface RejectClaimInput {
  rejectionReason: string;
  reviewNotes?: string;
}

export interface ClaimReviewRecord {
  id: string;
  claimId: string;
  reviewerId: string;
  reviewerName?: string;
  status: "APPROVED" | "REJECTED";
  notes?: string | null;
  createdAt: string;
}

/* =========================================================
   8. OWNERSHIP VERIFICATION
========================================================= */

export interface VerificationRecord {
  id: string;
  claimId: string;
  verifiedById: string;
  verifierName?: string;
  status: ClaimVerificationStatus;
  notes?: string | null;
  evidenceReviewed?: string[];
  verifiedAt?: string | null;
  createdAt: string;
}

export interface VerifyOwnershipInput {
  status: "VERIFIED" | "FAILED";
  notes?: string;
  evidenceReviewed?: string[];
}

export interface StartVerificationInput {
  notes?: string;
}

/* =========================================================
   9. HANDOVER
========================================================= */

export interface HandoverRecord {
  id: string;
  claimId: string;
  itemId: string;
  claimantId: string;

  status: HandoverStatus;
  location?: string | null;
  scheduledAt?: string | null;
  completedAt?: string | null;

  verifiedById?: string | null;
  verifiedByName?: string | null;

  claimantConfirmed: boolean;
  securityConfirmed: boolean;

  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleHandoverInput {
  location: string;
  scheduledAt: string;
  notes?: string;
}

export interface CompleteHandoverInput {
  claimantConfirmed: boolean;
  securityConfirmed: boolean;
  notes?: string;
}

export interface CancelHandoverInput {
  reason: string;
}

/* =========================================================
   10. CLAIM FILTERS AND SEARCH
========================================================= */

export interface ClaimFilters {
  search?: string;
  status?: ClaimStatus | "ALL";
  itemId?: string;
  claimantId?: string;
  reviewerId?: string;
  verificationStatus?: ClaimVerificationStatus;
  handoverStatus?: HandoverStatus;
  startDate?: string;
  endDate?: string;
}

export interface ClaimSortOptions {
  sortBy?: ClaimSortField;
  sortOrder?: ClaimSortOrder;
}

export interface ClaimQueryOptions extends ClaimFilters, ClaimSortOptions {
  page?: number;
  limit?: number;
}

export interface ClaimSearchResult {
  claims: Claim[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* =========================================================
   11. CLAIM STATISTICS
========================================================= */

export interface ClaimStatistics {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  cancelledClaims: number;
  completedClaims: number;
  successfulHandovers: number;
  pendingVerification: number;
  verifiedClaims: number;
}

export interface ClaimStatusDistribution {
  status: ClaimStatus;
  count: number;
  percentage?: number;
}

export interface ClaimTrend {
  label: string;
  pending: number;
  approved: number;
  completed: number;
  date?: string;
}

export interface RecoveryStatistics {
  totalRecoveredItems: number;
  totalSuccessfulHandovers: number;
  recoveryRate: number;
  averageResolutionDays?: number;
}

/* =========================================================
   12. CLAIM MANAGEMENT ACTIONS
========================================================= */

export interface ClaimManagementAction {
  claimId: string;
  action: "APPROVE" | "REJECT" | "CANCEL" | "VERIFY" | "COMPLETE";
  reason?: string;
}

export interface BulkClaimActionInput {
  claimIds: string[];
  action: "APPROVE" | "REJECT" | "CANCEL";
  reason?: string;
}

export interface BulkClaimActionResult {
  successful: number;
  failed: number;
  errors?: Array<{
    claimId: string;
    message: string;
  }>;
}

/* =========================================================
   13. PAGINATION AND API RESPONSES
========================================================= */

export interface ClaimPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ClaimApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface ClaimListApiResponse extends ClaimApiResponse<Claim[]> {
  pagination?: ClaimPagination;
}

export interface ClaimDetailsApiResponse extends ClaimApiResponse<ClaimDetails> {}

/* =========================================================
   14. CONSTANTS AND HELPERS
========================================================= */

export const CLAIM_STATUSES: ClaimStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
];

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const VERIFICATION_STATUS_LABELS: Record<
  ClaimVerificationStatus,
  string
> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  VERIFIED: "Verified",
  FAILED: "Failed",
};

export const HANDOVER_STATUS_LABELS: Record<HandoverStatus, string> = {
  NOT_STARTED: "Not Started",
  SCHEDULED: "Scheduled",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function getClaimStatusLabel(status: ClaimStatus): string {
  return CLAIM_STATUS_LABELS[status];
}

export function isPendingClaim(claim: Pick<Claim, "status">): boolean {
  return claim.status === "PENDING";
}

export function isCompletedClaim(claim: Pick<Claim, "status">): boolean {
  return claim.status === "COMPLETED";
}

export function isRejectedClaim(claim: Pick<Claim, "status">): boolean {
  return claim.status === "REJECTED";
}

export function canReviewClaim(claim: Pick<Claim, "status">): boolean {
  return claim.status === "PENDING";
}

export function canCompleteHandover(
  claim: Pick<Claim, "status" | "verificationStatus">,
): boolean {
  return claim.status === "APPROVED" && claim.verificationStatus === "VERIFIED";
}
