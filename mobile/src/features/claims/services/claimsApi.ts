// mobile/src/features/claims/services/claimsApi.ts

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

export type ClaimStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type ClaimTimelineEventType =
  | "CREATED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "QUESTION_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "HANDOVER_CODE_GENERATED"
  | "HANDOVER_CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "UPDATED";

export interface VerificationAnswer {
  question: string;
  answer: string;
}

export interface ClaimUser {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface ClaimItem {
  id: string;
  title: string;
  description?: string;
  type?: "LOST" | "FOUND";
  status?: string;
  imageUrls?: string[];
  category?: {
    id: string;
    name: string;
  } | null;
  location?: {
    id: string;
    name: string;
  } | null;
  createdAt?: string;
}

export interface ClaimTimelineEvent {
  id: string;
  type: ClaimTimelineEventType | string;
  title?: string;
  description?: string;
  message?: string;
  createdAt: string;
  actor?: ClaimUser | null;
  metadata?: Record<string, unknown> | null;
}

export interface Claim {
  id: string;
  itemId: string;
  claimantId?: string;
  status: ClaimStatus;
  description?: string;
  contactPhone?: string;
  verificationAnswers?: VerificationAnswer[];
  rejectionReason?: string | null;
  reviewNote?: string | null;
  handoverCode?: string | null;
  handoverCodeExpiresAt?: string | null;
  item?: ClaimItem;
  claimant?: ClaimUser;
  reviewer?: ClaimUser | null;
  createdAt: string;
  updatedAt?: string;
  timeline?: ClaimTimelineEvent[];
}

export interface CreateClaimPayload {
  itemId: string;
  description: string;
  contactPhone?: string;
  verificationAnswers: VerificationAnswer[];
}

export interface UpdateClaimPayload {
  description?: string;
  contactPhone?: string;
  verificationAnswers?: VerificationAnswer[];
}

export interface ClaimListFilters {
  status?: ClaimStatus | "ALL";
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest";
}

export interface ClaimPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ClaimListResponse {
  claims: Claim[];
  pagination: ClaimPagination;
}

export interface ClaimTimelineResponse {
  events: ClaimTimelineEvent[];
}

export class ClaimsApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ClaimsApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "string" && body.trim()) {
    return body;
  }

  if (body && typeof body === "object") {
    const value = body as Record<string, unknown>;

    if (typeof value.message === "string") {
      return value.message;
    }

    if (
      value.error &&
      typeof value.error === "object" &&
      typeof (value.error as Record<string, unknown>).message === "string"
    ) {
      return (value.error as Record<string, string>).message;
    }
  }

  return fallback;
}

async function parseResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  let body: unknown;

  try {
    const text = await response.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }

  if (!response.ok) {
    const envelope = body as ApiEnvelope<unknown>;

    throw new ClaimsApiError(
      getErrorMessage(body, fallbackMessage),
      response.status,
      envelope?.error?.code,
      envelope?.error?.details,
    );
  }

  const envelope = body as ApiEnvelope<T>;

  if (
    envelope &&
    typeof envelope === "object" &&
    "data" in envelope &&
    envelope.data !== undefined
  ) {
    return envelope.data;
  }

  return body as T;
}

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  if (!token) {
    throw new ClaimsApiError(
      "Your session has expired. Please sign in again.",
      401,
      "UNAUTHORIZED",
    );
  }

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ClaimsApiError(
      "Unable to connect to the server. Check your internet connection and try again.",
      undefined,
      "NETWORK_ERROR",
    );
  }

  return parseResponse<T>(
    response,
    "Something went wrong while processing your claim.",
  );
}

function normalizeClaim(value: unknown): Claim {
  if (!value || typeof value !== "object") {
    throw new ClaimsApiError(
      "The server returned an invalid claim.",
      undefined,
      "INVALID_RESPONSE",
    );
  }

  const raw = value as Record<string, unknown>;

  const claim = (
    raw.claim && typeof raw.claim === "object" ? raw.claim : raw
  ) as Record<string, unknown>;

  if (typeof claim.id !== "string" || typeof claim.itemId !== "string") {
    throw new ClaimsApiError(
      "The server response is missing claim information.",
      undefined,
      "INVALID_CLAIM",
    );
  }

  return {
    ...(claim as unknown as Claim),
    status: (claim.status as ClaimStatus) || "PENDING",
    verificationAnswers: Array.isArray(claim.verificationAnswers)
      ? (claim.verificationAnswers as VerificationAnswer[])
      : [],
  };
}

function normalizeClaimList(value: unknown): ClaimListResponse {
  const raw = value as Record<string, unknown>;

  const possibleClaims = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.claims)
      ? raw.claims
      : Array.isArray(raw.items)
        ? raw.items
        : [];

  const paginationRaw =
    !Array.isArray(raw) && raw.pagination && typeof raw.pagination === "object"
      ? (raw.pagination as Record<string, unknown>)
      : {};

  const claims = possibleClaims.map(normalizeClaim);

  const page = Number(paginationRaw.page || 1);
  const limit = Number(paginationRaw.limit || 10);
  const total = Number(paginationRaw.total ?? claims.length);
  const totalPages = Number(
    paginationRaw.totalPages ||
      Math.max(1, Math.ceil(total / Math.max(limit, 1))),
  );

  return {
    claims,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage:
        typeof paginationRaw.hasNextPage === "boolean"
          ? paginationRaw.hasNextPage
          : page < totalPages,
    },
  };
}

function encodeQuery(filters: ClaimListFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  params.set("page", String(filters.page || 1));
  params.set("limit", String(filters.limit || 10));
  params.set("sort", filters.sort || "newest");

  return params.toString();
}

export const claimsApi = {
  /**
   * Create a new claim for a lost or found item.
   */
  async createClaim(
    payload: CreateClaimPayload,
    token: string,
  ): Promise<Claim> {
    const result = await request<unknown>("/claims", token, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return normalizeClaim(result);
  },

  /**
   * Retrieve claims submitted by the signed-in user.
   */
  async getMyClaims(
    token: string,
    filters: ClaimListFilters = {},
  ): Promise<ClaimListResponse> {
    const query = encodeQuery(filters);

    const result = await request<unknown>(`/claims/my?${query}`, token);

    return normalizeClaimList(result);
  },

  /**
   * Retrieve claims for a specific item.
   */
  async getItemClaims(itemId: string, token: string): Promise<Claim[]> {
    const result = await request<unknown>(
      `/items/${encodeURIComponent(itemId)}/claims`,
      token,
    );

    const raw = result as Record<string, unknown>;
    const list = Array.isArray(result)
      ? result
      : Array.isArray(raw.claims)
        ? raw.claims
        : [];

    return list.map(normalizeClaim);
  },

  /**
   * Retrieve a single claim.
   */
  async getClaimById(claimId: string, token: string): Promise<Claim> {
    const result = await request<unknown>(
      `/claims/${encodeURIComponent(claimId)}`,
      token,
    );

    return normalizeClaim(result);
  },

  /**
   * Update a claim while it is still editable.
   */
  async updateClaim(
    claimId: string,
    payload: UpdateClaimPayload,
    token: string,
  ): Promise<Claim> {
    const result = await request<unknown>(
      `/claims/${encodeURIComponent(claimId)}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return normalizeClaim(result);
  },

  /**
   * Cancel a claim submitted by the current user.
   */
  async cancelClaim(
    claimId: string,
    token: string,
    reason?: string,
  ): Promise<Claim> {
    const result = await request<unknown>(
      `/claims/${encodeURIComponent(claimId)}/cancel`,
      token,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
    );

    return normalizeClaim(result);
  },

  /**
   * Retrieve the claim's history.
   */
  async getClaimTimeline(
    claimId: string,
    token: string,
  ): Promise<ClaimTimelineEvent[]> {
    const result = await request<unknown>(
      `/claims/${encodeURIComponent(claimId)}/timeline`,
      token,
    );

    const raw = result as Record<string, unknown>;

    const events = Array.isArray(result)
      ? result
      : Array.isArray(raw.events)
        ? raw.events
        : Array.isArray(raw.timeline)
          ? raw.timeline
          : [];

    return events as ClaimTimelineEvent[];
  },

  /**
   * Submit a handover code to confirm that an item was returned.
   */
  async confirmHandover(
    claimId: string,
    code: string,
    token: string,
  ): Promise<Claim> {
    const result = await request<unknown>(
      `/claims/${encodeURIComponent(claimId)}/handover/confirm`,
      token,
      {
        method: "POST",
        body: JSON.stringify({ code: code.trim() }),
      },
    );

    return normalizeClaim(result);
  },

  /**
   * Request a handover code from the backend.
   * The server should generate and deliver the code securely.
   */
  async requestHandoverCode(
    claimId: string,
    token: string,
  ): Promise<{ message: string; expiresAt?: string }> {
    return request(
      `/claims/${encodeURIComponent(claimId)}/handover/code`,
      token,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
  },

  /**
   * Validate the required fields before sending a claim.
   */
  validateClaimPayload(payload: CreateClaimPayload): string[] {
    const errors: string[] = [];

    if (!payload.itemId.trim()) {
      errors.push("The item information is missing.");
    }

    if (payload.description.trim().length < 10) {
      errors.push(
        "Please provide at least 10 characters explaining why this item belongs to you.",
      );
    }

    if (payload.description.trim().length > 2000) {
      errors.push("The explanation cannot exceed 2,000 characters.");
    }

    if (
      payload.contactPhone &&
      !/^[+0-9\s()-]{7,20}$/.test(payload.contactPhone.trim())
    ) {
      errors.push("Please enter a valid phone number.");
    }

    payload.verificationAnswers.forEach((answer, index) => {
      if (!answer.question.trim()) {
        errors.push(`Verification question ${index + 1} is missing.`);
      }

      if (!answer.answer.trim()) {
        errors.push(`Please answer verification question ${index + 1}.`);
      }

      if (answer.answer.trim().length > 500) {
        errors.push(`Answer ${index + 1} cannot exceed 500 characters.`);
      }
    });

    return errors;
  },

  getStatusLabel(status: ClaimStatus): string {
    const labels: Record<ClaimStatus, string> = {
      PENDING: "Pending",
      UNDER_REVIEW: "Under review",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };

    return labels[status] || "Unknown";
  },

  isClaimEditable(status: ClaimStatus): boolean {
    return status === "PENDING";
  },

  isClaimActive(status: ClaimStatus): boolean {
    return (
      status === "PENDING" || status === "UNDER_REVIEW" || status === "APPROVED"
    );
  },
};

export default claimsApi;
