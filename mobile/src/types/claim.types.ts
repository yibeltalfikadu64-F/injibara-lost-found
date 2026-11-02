// mobile/src/types/claim.types.ts

import type { Item, ItemSummary } from "./item.types";

import type { UserSummary } from "./user.types";

// ============================================================
// CLAIM ENUMS
// ============================================================

export enum ClaimStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export enum ClaimVerificationStatus {
  NOT_STARTED = "NOT_STARTED",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  FAILED = "FAILED",
}

export enum HandoverStatus {
  NOT_STARTED = "NOT_STARTED",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum ClaimPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
}

// ============================================================
// CLAIM QUESTION
// ============================================================

export interface ClaimQuestion {
  id: string;

  question: string;

  description?: string;

  required: boolean;

  type: "TEXT" | "BOOLEAN" | "SELECT" | "DATE";

  options?: string[];

  sortOrder?: number;
}

// ============================================================
// CLAIM ANSWER
// ============================================================

export interface ClaimAnswer {
  questionId: string;

  question: string;

  answer: string | boolean | string[];
}

// ============================================================
// CLAIM PROOF
// ============================================================

export interface ClaimProof {
  id?: string;

  type: "DESCRIPTION" | "PHOTO" | "DOCUMENT" | "SERIAL_NUMBER" | "OTHER";

  description?: string;

  fileUrl?: string;

  fileName?: string;

  mimeType?: string;

  createdAt?: string;
}

// ============================================================
// CLAIM USER
// ============================================================

export interface ClaimUser extends UserSummary {
  phoneNumber?: string | null;

  studentId?: string | null;

  employeeId?: string | null;
}

// ============================================================
// MAIN CLAIM ENTITY
// ============================================================

export interface Claim {
  id: string;

  itemId: string;

  item?: ItemSummary;

  claimantId: string;

  claimant?: ClaimUser;

  status: ClaimStatus;

  reason: string;

  description?: string | null;

  answers?: ClaimAnswer[];

  proofs?: ClaimProof[];

  verificationStatus?: ClaimVerificationStatus;

  verificationNotes?: string | null;

  reviewedById?: string | null;

  reviewedBy?: UserSummary | null;

  reviewedAt?: string | null;

  rejectionReason?: string | null;

  handoverStatus?: HandoverStatus;

  handoverCompletedAt?: string | null;

  securityOfficerId?: string | null;

  priority?: ClaimPriority;

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// CLAIM DETAIL
// ============================================================

export interface ClaimDetail extends Claim {
  item: Item;

  claimant: ClaimUser;

  timeline: ClaimTimelineEvent[];

  canCancel?: boolean;

  canEdit?: boolean;

  canReview?: boolean;

  canCompleteHandover?: boolean;
}

// ============================================================
// CLAIM SUMMARY
// ============================================================

export interface ClaimSummary {
  id: string;

  itemId: string;

  itemTitle: string;

  itemImageUrl?: string | null;

  claimantId: string;

  claimantName: string;

  status: ClaimStatus;

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// CREATE CLAIM REQUEST
// ============================================================

export interface CreateClaimRequest {
  itemId: string;

  reason: string;

  description?: string;

  answers: ClaimAnswer[];

  proofs?: ClaimProof[];
}

// ============================================================
// UPDATE CLAIM REQUEST
// ============================================================

export interface UpdateClaimRequest {
  reason?: string;

  description?: string;

  answers?: ClaimAnswer[];

  proofs?: ClaimProof[];
}

// ============================================================
// CLAIM RESPONSE
// ============================================================

export interface ClaimResponse {
  success: boolean;

  message: string;

  claim: Claim;
}

// ============================================================
// CLAIM LIST RESPONSE
// ============================================================

export interface ClaimListResponse {
  success: boolean;

  claims: Claim[];

  pagination: ClaimPagination;
}

// ============================================================
// CLAIM PAGINATION
// ============================================================

export interface ClaimPagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
}

// ============================================================
// CLAIM FILTERS
// ============================================================

export interface ClaimFilters {
  search?: string;

  itemId?: string;

  claimantId?: string;

  status?: ClaimStatus;

  verificationStatus?: ClaimVerificationStatus;

  handoverStatus?: HandoverStatus;

  priority?: ClaimPriority;

  fromDate?: string;

  toDate?: string;

  page?: number;

  limit?: number;

  sortBy?: "createdAt" | "updatedAt" | "status";

  sortOrder?: "asc" | "desc";
}

// ============================================================
// CLAIM APPROVAL REQUEST
// ============================================================

export interface ApproveClaimRequest {
  claimId: string;

  notes?: string;
}

// ============================================================
// CLAIM REJECTION REQUEST
// ============================================================

export interface RejectClaimRequest {
  claimId: string;

  reason: string;

  notes?: string;
}

// ============================================================
// CLAIM REVIEW REQUEST
// ============================================================

export interface ReviewClaimRequest {
  decision: "APPROVE" | "REJECT";

  notes?: string;

  rejectionReason?: string;
}

// ============================================================
// CLAIM VERIFICATION REQUEST
// ============================================================

export interface VerifyClaimRequest {
  claimId: string;

  answers: ClaimAnswer[];

  notes?: string;
}

// ============================================================
// CLAIM VERIFICATION RESPONSE
// ============================================================

export interface VerifyClaimResponse {
  success: boolean;

  status: ClaimVerificationStatus;

  message: string;

  notes?: string;
}

// ============================================================
// CLAIM CANCELLATION REQUEST
// ============================================================

export interface CancelClaimRequest {
  reason?: string;
}

// ============================================================
// CLAIM TIMELINE EVENT
// ============================================================

export interface ClaimTimelineEvent {
  id: string;

  claimId: string;

  action:
    | "CREATED"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "VERIFIED"
    | "HANDOVER_STARTED"
    | "HANDOVER_COMPLETED"
    | "CANCELLED"
    | "EXPIRED"
    | "UPDATED";

  title: string;

  description?: string;

  oldStatus?: ClaimStatus | null;

  newStatus?: ClaimStatus | null;

  performedBy?: UserSummary | null;

  createdAt: string;
}

// ============================================================
// CLAIM HANDOVER
// ============================================================

export interface ClaimHandover {
  id: string;

  claimId: string;

  itemId: string;

  status: HandoverStatus;

  securityOfficerId?: string | null;

  securityOfficer?: UserSummary | null;

  verifiedAt?: string | null;

  completedAt?: string | null;

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// HANDOVER CODE REQUEST
// ============================================================

export interface VerifyHandoverCodeRequest {
  claimId: string;

  code: string;
}

// ============================================================
// HANDOVER CODE RESPONSE
// ============================================================

export interface VerifyHandoverCodeResponse {
  success: boolean;

  verified: boolean;

  message: string;

  claim?: Claim;

  handover?: ClaimHandover;
}

// ============================================================
// HANDOVER COMPLETION REQUEST
// ============================================================

export interface CompleteHandoverRequest {
  claimId: string;

  verificationCode: string;

  notes?: string;

  confirmedByClaimant: boolean;

  confirmedBySecurity: boolean;
}

// ============================================================
// HANDOVER COMPLETION RESPONSE
// ============================================================

export interface CompleteHandoverResponse {
  success: boolean;

  message: string;

  handover: ClaimHandover;

  claim: Claim;
}

// ============================================================
// CUSTODY RECORD
// ============================================================

export interface CustodyRecord {
  id: string;

  itemId: string;

  item?: ItemSummary;

  claimId?: string | null;

  securityOfficerId: string;

  securityOfficer?: UserSummary;

  receivedAt: string;

  releasedAt?: string | null;

  releaseNotes?: string | null;

  storageLocation?: string | null;

  conditionOnReceipt?: string | null;

  conditionOnRelease?: string | null;

  status: "IN_CUSTODY" | "RELEASED" | "TRANSFERRED";

  createdAt: string;

  updatedAt: string;
}

// ============================================================
// CUSTODY REGISTRATION REQUEST
// ============================================================

export interface CreateCustodyRecordRequest {
  itemId: string;

  claimId?: string;

  storageLocation?: string;

  conditionOnReceipt?: string;

  notes?: string;
}

// ============================================================
// CLAIM STATISTICS
// ============================================================

export interface ClaimStatistics {
  totalClaims: number;

  pendingClaims: number;

  underReviewClaims: number;

  approvedClaims: number;

  rejectedClaims: number;

  completedClaims: number;

  cancelledClaims: number;

  expiredClaims: number;
}

// ============================================================
// CLAIM VALIDATION ERRORS
// ============================================================

export interface ClaimValidationErrors {
  itemId?: string;

  reason?: string;

  description?: string;

  answers?: string;

  proofs?: string;

  verificationCode?: string;
}

// ============================================================
// CLAIM FORM STATE
// ============================================================

export interface ClaimFormState {
  itemId: string;

  reason: string;

  description: string;

  answers: ClaimAnswer[];

  proofs: ClaimProof[];
}

// ============================================================
// CLAIM STATUS LABELS
// ============================================================

export function getClaimStatusLabel(status: ClaimStatus): string {
  const labels: Record<ClaimStatus, string> = {
    [ClaimStatus.PENDING]: "Pending",

    [ClaimStatus.UNDER_REVIEW]: "Under Review",

    [ClaimStatus.APPROVED]: "Approved",

    [ClaimStatus.REJECTED]: "Rejected",

    [ClaimStatus.COMPLETED]: "Completed",

    [ClaimStatus.CANCELLED]: "Cancelled",

    [ClaimStatus.EXPIRED]: "Expired",
  };

  return labels[status];
}

// ============================================================
// CLAIM STATUS HELPERS
// ============================================================

export function isClaimPending(claim: Pick<Claim, "status">): boolean {
  return claim.status === ClaimStatus.PENDING;
}

export function isClaimApproved(claim: Pick<Claim, "status">): boolean {
  return claim.status === ClaimStatus.APPROVED;
}

export function isClaimRejected(claim: Pick<Claim, "status">): boolean {
  return claim.status === ClaimStatus.REJECTED;
}

export function isClaimCompleted(claim: Pick<Claim, "status">): boolean {
  return claim.status === ClaimStatus.COMPLETED;
}

export function canCancelClaim(claim: Pick<Claim, "status">): boolean {
  return (
    claim.status === ClaimStatus.PENDING ||
    claim.status === ClaimStatus.UNDER_REVIEW
  );
}

// ============================================================
// HANDOVER HELPERS
// ============================================================

export function isHandoverCompleted(
  handover: Pick<ClaimHandover, "status">,
): boolean {
  return handover.status === HandoverStatus.COMPLETED;
}

// ============================================================
// TYPE GUARDS
// ============================================================

export function isClaimStatus(value: unknown): value is ClaimStatus {
  return (
    typeof value === "string" &&
    Object.values(ClaimStatus).includes(value as ClaimStatus)
  );
}
