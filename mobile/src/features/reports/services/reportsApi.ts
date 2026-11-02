// mobile/src/features/reports/services/reportsApi.ts

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

export type ReportType =
  | "LOST_ITEM"
  | "FOUND_ITEM"
  | "CLAIM"
  | "USER"
  | "OTHER";

export type ReportStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "DISMISSED"
  | "CLOSED";

export type ReportPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface ReportUser {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
}

export interface ReportItem {
  id: string;
  title: string;
  type?: "LOST" | "FOUND";
  status?: string;
  imageUrls?: string[];
}

export interface Report {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  status: ReportStatus;
  priority?: ReportPriority;
  reporterId?: string;
  reporter?: ReportUser;
  assignedTo?: ReportUser | null;
  itemId?: string | null;
  item?: ReportItem | null;
  adminNote?: string | null;
  resolutionNote?: string | null;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string | null;
}

export interface ReportFilters {
  status?: ReportStatus | "ALL";
  type?: ReportType | "ALL";
  priority?: ReportPriority | "ALL";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest";
}

export interface ReportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ReportsListResponse {
  reports: Report[];
  pagination: ReportPagination;
}

export interface CreateReportPayload {
  title: string;
  description: string;
  type: ReportType;
  itemId?: string;
  priority?: ReportPriority;
}

export interface UpdateReportPayload {
  title?: string;
  description?: string;
  priority?: ReportPriority;
}

export class ReportsApiError extends Error {
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
    this.name = "ReportsApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

interface ApiErrorBody {
  message?: string;
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
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

function getMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const value = body as ApiErrorBody;

    if (typeof value.message === "string") {
      return value.message;
    }

    if (typeof value.error?.message === "string") {
      return value.error.message;
    }
  }

  return fallback;
}

async function readResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  let body: unknown = {};

  try {
    const responseText = await response.text();
    body = responseText ? JSON.parse(responseText) : {};
  } catch {
    body = {};
  }

  if (!response.ok) {
    const envelope = body as ApiEnvelope<unknown>;

    throw new ReportsApiError(
      getMessage(body, fallback),
      response.status,
      envelope.error?.code,
      envelope.error?.details,
    );
  }

  const envelope = body as ApiEnvelope<T>;

  if (envelope && typeof envelope === "object" && envelope.data !== undefined) {
    return envelope.data;
  }

  return body as T;
}

async function apiRequest<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  if (!token) {
    throw new ReportsApiError(
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
    throw new ReportsApiError(
      "Unable to connect to the server. Check your internet connection.",
      undefined,
      "NETWORK_ERROR",
    );
  }

  return readResponse<T>(response, "Unable to process the report request.");
}

function normalizeReport(value: unknown): Report {
  if (!value || typeof value !== "object") {
    throw new ReportsApiError(
      "The server returned invalid report information.",
      undefined,
      "INVALID_RESPONSE",
    );
  }

  const raw = value as Record<string, unknown>;

  const report =
    raw.report && typeof raw.report === "object"
      ? (raw.report as Record<string, unknown>)
      : raw;

  if (typeof report.id !== "string" || typeof report.title !== "string") {
    throw new ReportsApiError(
      "The report response is missing required fields.",
      undefined,
      "INVALID_REPORT",
    );
  }

  return {
    ...(report as unknown as Report),
    description:
      typeof report.description === "string" ? report.description : "",
    type: (report.type as ReportType) || "OTHER",
    status: (report.status as ReportStatus) || "PENDING",
    createdAt:
      typeof report.createdAt === "string"
        ? report.createdAt
        : new Date().toISOString(),
  };
}

function normalizeReportList(value: unknown): ReportsListResponse {
  const raw = value as Record<string, unknown>;

  const list = Array.isArray(value)
    ? value
    : Array.isArray(raw.reports)
      ? raw.reports
      : Array.isArray(raw.items)
        ? raw.items
        : [];

  const paginationRaw =
    raw &&
    typeof raw === "object" &&
    raw.pagination &&
    typeof raw.pagination === "object"
      ? (raw.pagination as Record<string, unknown>)
      : {};

  const reports = list.map(normalizeReport);

  const page = Number(paginationRaw.page || 1);
  const limit = Number(paginationRaw.limit || 10);
  const total = Number(paginationRaw.total ?? reports.length);

  const totalPages = Number(
    paginationRaw.totalPages ||
      Math.max(1, Math.ceil(total / Math.max(limit, 1))),
  );

  return {
    reports,
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

function buildQuery(filters: ReportFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.status && filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  if (filters.type && filters.type !== "ALL") {
    params.set("type", filters.type);
  }

  if (filters.priority && filters.priority !== "ALL") {
    params.set("priority", filters.priority);
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  params.set("page", String(filters.page || 1));
  params.set("limit", String(filters.limit || 10));
  params.set("sortBy", filters.sortBy || "newest");

  return params.toString();
}

export const DEFAULT_REPORT_FILTERS: ReportFilters = {
  status: "ALL",
  type: "ALL",
  priority: "ALL",
  search: "",
  page: 1,
  limit: 10,
  sortBy: "newest",
};

const reportsApi = {
  /**
   * Retrieve the signed-in user's reports.
   */
  async getMyReports(
    token: string,
    filters: ReportFilters = {},
  ): Promise<ReportsListResponse> {
    const query = buildQuery(filters);

    const result = await apiRequest<unknown>(`/reports/my?${query}`, token);

    return normalizeReportList(result);
  },

  /**
   * Retrieve a report by its ID.
   */
  async getReportById(reportId: string, token: string): Promise<Report> {
    const result = await apiRequest<unknown>(
      `/reports/${encodeURIComponent(reportId)}`,
      token,
    );

    return normalizeReport(result);
  },

  /**
   * Submit a new report.
   */
  async createReport(
    payload: CreateReportPayload,
    token: string,
  ): Promise<Report> {
    const result = await apiRequest<unknown>("/reports", token, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return normalizeReport(result);
  },

  /**
   * Update an existing report.
   */
  async updateReport(
    reportId: string,
    payload: UpdateReportPayload,
    token: string,
  ): Promise<Report> {
    const result = await apiRequest<unknown>(
      `/reports/${encodeURIComponent(reportId)}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    return normalizeReport(result);
  },

  /**
   * Withdraw a report submitted by the current user.
   */
  async withdrawReport(
    reportId: string,
    token: string,
    reason?: string,
  ): Promise<Report> {
    const result = await apiRequest<unknown>(
      `/reports/${encodeURIComponent(reportId)}/withdraw`,
      token,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
    );

    return normalizeReport(result);
  },

  /**
   * Retrieve the reports associated with an item.
   */
  async getReportsByItem(itemId: string, token: string): Promise<Report[]> {
    const result = await apiRequest<unknown>(
      `/items/${encodeURIComponent(itemId)}/reports`,
      token,
    );

    const raw = result as Record<string, unknown>;

    const list = Array.isArray(result)
      ? result
      : Array.isArray(raw.reports)
        ? raw.reports
        : [];

    return list.map(normalizeReport);
  },

  /**
   * Validate a new report before submitting it.
   */
  validateReport(payload: CreateReportPayload): string[] {
    const errors: string[] = [];

    if (!payload.title.trim()) {
      errors.push("Please enter a report title.");
    } else if (payload.title.trim().length < 4) {
      errors.push("The report title must contain at least 4 characters.");
    } else if (payload.title.trim().length > 120) {
      errors.push("The report title cannot exceed 120 characters.");
    }

    if (!payload.description.trim()) {
      errors.push("Please describe the issue you want to report.");
    } else if (payload.description.trim().length < 10) {
      errors.push("Please provide at least 10 characters in the description.");
    } else if (payload.description.trim().length > 2000) {
      errors.push("The description cannot exceed 2,000 characters.");
    }

    const allowedTypes: ReportType[] = [
      "LOST_ITEM",
      "FOUND_ITEM",
      "CLAIM",
      "USER",
      "OTHER",
    ];

    if (!allowedTypes.includes(payload.type)) {
      errors.push("Please select a valid report type.");
    }

    return errors;
  },

  getStatusLabel(status: ReportStatus): string {
    const labels: Record<ReportStatus, string> = {
      PENDING: "Pending",
      UNDER_REVIEW: "Under review",
      RESOLVED: "Resolved",
      DISMISSED: "Dismissed",
      CLOSED: "Closed",
    };

    return labels[status] || "Unknown";
  },

  getTypeLabel(type: ReportType): string {
    const labels: Record<ReportType, string> = {
      LOST_ITEM: "Lost item",
      FOUND_ITEM: "Found item",
      CLAIM: "Claim issue",
      USER: "User report",
      OTHER: "Other",
    };

    return labels[type] || "Other";
  },

  getPriorityLabel(priority?: ReportPriority): string {
    if (!priority) return "Normal";

    const labels: Record<ReportPriority, string> = {
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
      URGENT: "Urgent",
    };

    return labels[priority];
  },

  isReportEditable(status: ReportStatus): boolean {
    return status === "PENDING";
  },

  isReportActive(status: ReportStatus): boolean {
    return status === "PENDING" || status === "UNDER_REVIEW";
  },
};

export default reportsApi;
