// mobile/src/features/security/services/securityApi.ts

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

// ======================================================
// TYPES
// ======================================================

export type SecurityClaimStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "ADDITIONAL_INFORMATION_REQUIRED"
  | "HANDED_OVER"
  | "CANCELLED";

export type CustodyStatus =
  | "IN_CUSTODY"
  | "RELEASED"
  | "TRANSFERRED"
  | "PENDING_VERIFICATION";

export type ItemType = "LOST" | "FOUND";

export interface SecurityUser {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface SecurityLocation {
  id?: string;
  name?: string;
  building?: string;
  description?: string;
}

export interface SecurityItem {
  id: string;
  title: string;
  description?: string;
  type?: ItemType;
  status?: string;
  imageUrls?: string[];
  category?:
    | {
        id?: string;
        name?: string;
      }
    | string;
  location?: SecurityLocation | string;
  color?: string;
  brand?: string;
  identifyingFeatures?: string;
  dateLostOrFound?: string;
}

export interface ClaimVerificationAnswer {
  question: string;
  answer: string;
  verified?: boolean;
}

export interface SecurityClaim {
  id: string;
  claimNumber?: string;
  status: SecurityClaimStatus;
  reason?: string;
  description?: string;
  verificationAnswers?: ClaimVerificationAnswer[];
  evidenceUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  item?: SecurityItem;
  claimant?: SecurityUser;
  reviewer?: SecurityUser;
}

export interface CustodyRecord {
  id: string;
  custodyNumber?: string;
  itemId: string;
  claimId?: string;
  status: CustodyStatus;
  receivedAt: string;
  releasedAt?: string;
  receivedBy?: SecurityUser;
  releasedBy?: SecurityUser;
  storageLocation?: string;
  notes?: string;
  item?: SecurityItem;
  claim?: SecurityClaim;
}

export interface HandoverVerification {
  claimId: string;
  handoverCode: string;
  recipientId?: string;
  recipientName?: string;
  notes?: string;
}

export interface HandoverResult {
  id: string;
  claimId: string;
  itemId: string;
  status: string;
  handedOverAt: string;
  handedOverBy?: SecurityUser;
  recipient?: SecurityUser;
  notes?: string;
}

export interface ClaimReviewPayload {
  status: "APPROVED" | "REJECTED" | "ADDITIONAL_INFORMATION_REQUIRED";
  reviewNotes: string;
}

export interface CustodyCreatePayload {
  itemId: string;
  claimId?: string;
  storageLocation: string;
  notes?: string;
}

export interface CustodyUpdatePayload {
  status: CustodyStatus;
  storageLocation?: string;
  notes?: string;
}

export interface SecurityListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SecurityApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

// ======================================================
// ERROR HANDLING
// ======================================================

function createApiError(
  message: string,
  status?: number,
  code?: string,
  details?: unknown,
): SecurityApiError {
  const error = new Error(message) as SecurityApiError;

  error.name = "SecurityApiError";
  error.status = status;
  error.code = code;
  error.details = details;

  return error;
}

// ======================================================
// RESPONSE NORMALIZATION
// ======================================================

function unwrapResponse<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    const data = (response as { data: unknown }).data;

    if (data && typeof data === "object" && "data" in data) {
      return (data as { data: T }).data;
    }

    return data as T;
  }

  return response as T;
}

function normalizeList<T>(response: unknown): SecurityListResponse<T> {
  const unwrapped = unwrapResponse<unknown>(response);

  if (Array.isArray(unwrapped)) {
    return {
      data: unwrapped as T[],
      total: unwrapped.length,
      page: 1,
      limit: unwrapped.length,
      totalPages: 1,
    };
  }

  if (unwrapped && typeof unwrapped === "object") {
    const record = unwrapped as Record<string, unknown>;

    const list =
      record.items ??
      record.claims ??
      record.records ??
      record.results ??
      record.data;

    const data = Array.isArray(list) ? (list as T[]) : [];

    return {
      data,
      total: typeof record.total === "number" ? record.total : data.length,
      page: typeof record.page === "number" ? record.page : 1,
      limit: typeof record.limit === "number" ? record.limit : data.length,
      totalPages: typeof record.totalPages === "number" ? record.totalPages : 1,
    };
  }

  return {
    data: [],
    total: 0,
    page: 1,
    limit: 0,
    totalPages: 0,
  };
}

// ======================================================
// HTTP CLIENT
// ======================================================

async function securityRequest<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  if (!accessToken) {
    throw createApiError(
      "Authentication is required to access security services.",
      401,
      "UNAUTHORIZED",
    );
  }

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("Accept", "application/json");

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw createApiError(
      "Unable to connect to the server. Check your network connection.",
      undefined,
      "NETWORK_ERROR",
    );
  }

  let responseBody: unknown = null;

  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    const record =
      responseBody && typeof responseBody === "object"
        ? (responseBody as Record<string, unknown>)
        : {};

    const message =
      typeof record.message === "string"
        ? record.message
        : typeof record.error === "string"
          ? record.error
          : `Security request failed (${response.status}).`;

    throw createApiError(
      message,
      response.status,
      typeof record.code === "string" ? record.code : undefined,
      record.details,
    );
  }

  return unwrapResponse<T>(responseBody);
}

// ======================================================
// CLAIM MANAGEMENT
// ======================================================

async function getPendingClaims(
  accessToken: string,
  page = 1,
  limit = 20,
): Promise<SecurityListResponse<SecurityClaim>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await securityRequest<unknown>(
    `/security/claims/pending?${params.toString()}`,
    accessToken,
  );

  return normalizeList<SecurityClaim>(response);
}

async function getClaimById(
  accessToken: string,
  claimId: string,
): Promise<SecurityClaim> {
  const response = await securityRequest<unknown>(
    `/claims/${encodeURIComponent(claimId)}`,
    accessToken,
  );

  return unwrapResponse<SecurityClaim>(response);
}

async function reviewClaim(
  accessToken: string,
  claimId: string,
  payload: ClaimReviewPayload,
): Promise<SecurityClaim> {
  if (!claimId.trim()) {
    throw createApiError("Claim ID is required.");
  }

  if (!payload.reviewNotes.trim()) {
    throw createApiError(
      "Please provide review notes.",
      400,
      "VALIDATION_ERROR",
    );
  }

  return securityRequest<SecurityClaim>(
    `/security/claims/${encodeURIComponent(claimId)}/review`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

// ======================================================
// CUSTODY REGISTER
// ======================================================

async function getCustodyRecords(
  accessToken: string,
  page = 1,
  limit = 20,
): Promise<SecurityListResponse<CustodyRecord>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await securityRequest<unknown>(
    `/security/custody?${params.toString()}`,
    accessToken,
  );

  return normalizeList<CustodyRecord>(response);
}

async function getCustodyRecordById(
  accessToken: string,
  custodyId: string,
): Promise<CustodyRecord> {
  const response = await securityRequest<unknown>(
    `/security/custody/${encodeURIComponent(custodyId)}`,
    accessToken,
  );

  return unwrapResponse<CustodyRecord>(response);
}

async function createCustodyRecord(
  accessToken: string,
  payload: CustodyCreatePayload,
): Promise<CustodyRecord> {
  if (!payload.itemId.trim()) {
    throw createApiError("Item ID is required.");
  }

  if (!payload.storageLocation.trim()) {
    throw createApiError("Storage location is required.");
  }

  return securityRequest<CustodyRecord>("/security/custody", accessToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function updateCustodyRecord(
  accessToken: string,
  custodyId: string,
  payload: CustodyUpdatePayload,
): Promise<CustodyRecord> {
  return securityRequest<CustodyRecord>(
    `/security/custody/${encodeURIComponent(custodyId)}`,
    accessToken,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

// ======================================================
// HANDOVER
// ======================================================

async function verifyHandoverCode(
  accessToken: string,
  handoverCode: string,
): Promise<SecurityClaim> {
  const normalizedCode = handoverCode.trim();

  if (!normalizedCode) {
    throw createApiError(
      "Please enter a handover code.",
      400,
      "VALIDATION_ERROR",
    );
  }

  return securityRequest<SecurityClaim>(
    "/security/handovers/verify",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        handoverCode: normalizedCode,
      }),
    },
  );
}

async function completeHandover(
  accessToken: string,
  payload: HandoverVerification,
): Promise<HandoverResult> {
  if (!payload.claimId.trim()) {
    throw createApiError("Claim ID is required.");
  }

  if (!payload.handoverCode.trim()) {
    throw createApiError("Handover code is required.");
  }

  return securityRequest<HandoverResult>(
    `/security/claims/${encodeURIComponent(payload.claimId)}/handover`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

async function getHandoverHistory(
  accessToken: string,
  claimId: string,
): Promise<HandoverResult[]> {
  const response = await securityRequest<unknown>(
    `/security/claims/${encodeURIComponent(claimId)}/handovers`,
    accessToken,
  );

  const result = unwrapResponse<unknown>(response);

  return Array.isArray(result) ? (result as HandoverResult[]) : [];
}

// ======================================================
// VALIDATION HELPERS
// ======================================================

function validateHandoverCode(code: string): string | null {
  const normalized = code.trim();

  if (!normalized) {
    return "Handover code is required.";
  }

  if (normalized.length < 4) {
    return "Handover code is too short.";
  }

  if (normalized.length > 100) {
    return "Handover code is too long.";
  }

  return null;
}

function validateReviewNotes(notes: string): string | null {
  if (!notes.trim()) {
    return "Please enter review notes.";
  }

  if (notes.trim().length < 5) {
    return "Review notes must contain at least 5 characters.";
  }

  if (notes.trim().length > 1000) {
    return "Review notes cannot exceed 1000 characters.";
  }

  return null;
}

function getSecurityErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected security error occurred.";
}

function getPersonName(user?: SecurityUser): string {
  if (!user) {
    return "Unknown user";
  }

  if (user.fullName) {
    return user.fullName;
  }

  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "Unknown user"
  );
}

function formatSecurityDate(date?: string): string {
  if (!date) {
    return "Not available";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleString();
}

// ======================================================
// EXPORTED API
// ======================================================

export const securityApi = {
  getPendingClaims,
  getClaimById,
  reviewClaim,

  getCustodyRecords,
  getCustodyRecordById,
  createCustodyRecord,
  updateCustodyRecord,

  verifyHandoverCode,
  completeHandover,
  getHandoverHistory,

  validateHandoverCode,
  validateReviewNotes,

  getSecurityErrorMessage,
  getPersonName,
  formatSecurityDate,
};

export default securityApi;
