// mobile/src/features/admin/services/adminApi.ts

// ============================================================
// INJIBARA CAMPUS LOST & FOUND
// ADMIN API SERVICE
// ============================================================

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const ADMIN_API_PREFIX = "/admin";

// ============================================================
// ENUMS AND TYPES
// ============================================================

export type AdminUserRole = "STUDENT" | "STAFF" | "SECURITY" | "ADMIN";

export type AdminUserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";

export type AdminItemType = "LOST" | "FOUND";

export type AdminItemStatus =
  | "OPEN"
  | "CLAIMED"
  | "RESOLVED"
  | "RETURNED"
  | "CLOSED"
  | "PENDING"
  | "REJECTED"
  | "EXPIRED";

export type AdminClaimStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type AdminActivityType =
  | "USER_REGISTERED"
  | "ITEM_REPORTED"
  | "CLAIM_SUBMITTED"
  | "CLAIM_APPROVED"
  | "CLAIM_REJECTED"
  | "ITEM_RETURNED"
  | "USER_SUSPENDED"
  | "USER_ACTIVATED"
  | "ITEM_REMOVED"
  | "OTHER";

export type AdminDateRange = "TODAY" | "WEEK" | "MONTH" | "YEAR" | "ALL";

// ============================================================
// USER TYPES
// ============================================================

export interface AdminUser {
  id: string;

  fullName?: string;

  firstName?: string;

  lastName?: string;

  name?: string;

  email: string;

  phone?: string | null;

  universityId?: string | null;

  studentId?: string | null;

  employeeId?: string | null;

  department?: string | null;

  faculty?: string | null;

  role: AdminUserRole;

  status?: AdminUserStatus;

  isActive?: boolean;

  isVerified?: boolean;

  avatarUrl?: string | null;

  profileImage?: string | null;

  createdAt: string;

  updatedAt?: string;

  lastLoginAt?: string | null;
}

export interface AdminUserFilters {
  search?: string;

  role?: AdminUserRole | "ALL";

  status?: AdminUserStatus | "ALL";

  department?: string;

  page?: number;

  limit?: number;

  sortBy?: "createdAt" | "fullName" | "email";

  sortOrder?: "asc" | "desc";
}

export interface CreateAdminUserPayload {
  fullName: string;

  email: string;

  phone?: string;

  universityId?: string;

  department?: string;

  role: AdminUserRole;

  password?: string;
}

export interface UpdateAdminUserPayload {
  fullName?: string;

  email?: string;

  phone?: string | null;

  universityId?: string | null;

  department?: string | null;

  role?: AdminUserRole;

  status?: AdminUserStatus;

  isActive?: boolean;
}

// ============================================================
// ITEM TYPES
// ============================================================

export interface AdminCategory {
  id: string;

  name: string;

  description?: string | null;
}

export interface AdminLocation {
  id: string;

  name: string;

  description?: string | null;
}

export interface AdminItemReporter {
  id: string;

  fullName?: string;

  name?: string;

  email?: string;
}

export interface AdminItem {
  id: string;

  title: string;

  description: string;

  type: AdminItemType;

  status: AdminItemStatus;

  category?: AdminCategory | string | null;

  location?: AdminLocation | string | null;

  imageUrls?: string[];

  color?: string | null;

  brand?: string | null;

  identifyingFeatures?: string | null;

  dateLostOrFound?: string | null;

  createdAt: string;

  updatedAt?: string;

  reporterId?: string;

  reporter?: AdminItemReporter | null;

  ownerId?: string;

  isApproved?: boolean;

  rejectionReason?: string | null;
}

export interface AdminItemFilters {
  search?: string;

  type?: AdminItemType | "ALL";

  status?: AdminItemStatus | "ALL";

  categoryId?: string;

  locationId?: string;

  page?: number;

  limit?: number;

  sortBy?: "createdAt" | "title" | "dateLostOrFound";

  sortOrder?: "asc" | "desc";
}

export interface UpdateAdminItemPayload {
  title?: string;

  description?: string;

  status?: AdminItemStatus;

  type?: AdminItemType;

  rejectionReason?: string;

  isApproved?: boolean;
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface AdminDashboardStatistics {
  totalUsers: number;

  totalStudents: number;

  totalStaff: number;

  totalSecurityUsers: number;

  totalAdmins: number;

  activeUsers: number;

  inactiveUsers: number;

  totalItems: number;

  lostItems: number;

  foundItems: number;

  openItems: number;

  resolvedItems: number;

  totalClaims: number;

  pendingClaims: number;

  approvedClaims: number;

  rejectedClaims: number;

  completedClaims: number;

  returnedItems: number;
}

export interface AdminActivity {
  id: string;

  type: AdminActivityType;

  title: string;

  description?: string;

  createdAt: string;

  actor?: {
    id: string;

    fullName?: string;

    name?: string;
  } | null;

  targetId?: string | null;
}

export interface AdminDashboardResponse {
  statistics: AdminDashboardStatistics;

  recentActivities: AdminActivity[];

  generatedAt?: string;
}

export interface DashboardQuery {
  dateRange?: AdminDateRange;
}

// ============================================================
// PAGINATION TYPES
// ============================================================

export interface AdminPagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;

  hasNextPage?: boolean;

  hasPreviousPage?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];

  pagination: AdminPagination;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

interface ApiResponse<T> {
  success?: boolean;

  message?: string;

  data?: T;

  users?: T;

  items?: T;

  statistics?: T;
}

// ============================================================
// ERROR TYPE
// ============================================================

export class AdminApiError extends Error {
  status: number;

  code?: string;

  details?: unknown;

  constructor(message: string, status = 500, code?: string, details?: unknown) {
    super(message);

    this.name = "AdminApiError";

    this.status = status;

    this.code = code;

    this.details = details;
  }
}

// ============================================================
// REQUEST OPTIONS
// ============================================================

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

  token: string;

  body?: unknown;

  signal?: AbortSignal;
}

// ============================================================
// RESPONSE HELPERS
// ============================================================

async function parseResponse<T>(response: Response): Promise<T> {
  let result: unknown;

  try {
    const text = await response.text();

    result = text ? JSON.parse(text) : {};
  } catch {
    throw new AdminApiError(
      "The server returned an invalid response.",
      response.status,
    );
  }

  const payload = result as {
    message?: string;

    error?: string;

    code?: string;

    details?: unknown;
  };

  if (!response.ok) {
    throw new AdminApiError(
      payload.message ||
        payload.error ||
        `Request failed with status ${response.status}.`,
      response.status,
      payload.code,
      payload.details,
    );
  }

  return result as T;
}

// ============================================================
// NORMALIZE PAGINATION
// ============================================================

function normalizePaginatedResponse<T>(
  response: unknown,
  collectionKey: "users" | "items",
  requestedPage = 1,
  requestedLimit = 20,
): PaginatedResponse<T> {
  const root = response as Record<string, unknown>;

  const nested =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;

  const collection =
    nested[collectionKey] ?? nested.data ?? root[collectionKey] ?? root.data;

  const data = Array.isArray(collection) ? (collection as T[]) : [];

  const rawPagination =
    (nested.pagination as Partial<AdminPagination> | undefined) ??
    (root.pagination as Partial<AdminPagination> | undefined);

  const page = Number(rawPagination?.page) || requestedPage;

  const limit = Number(rawPagination?.limit) || requestedLimit;

  const total = Number(rawPagination?.total) || data.length;

  const totalPages =
    Number(rawPagination?.totalPages) ||
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return {
    data,

    pagination: {
      page,

      limit,

      total,

      totalPages,

      hasNextPage: rawPagination?.hasNextPage ?? page < totalPages,

      hasPreviousPage: rawPagination?.hasPreviousPage ?? page > 1,
    },
  };
}

// ============================================================
// API REQUEST
// ============================================================

async function request<T>(path: string, options: RequestOptions): Promise<T> {
  if (!options.token) {
    throw new AdminApiError("Authentication is required.", 401);
  }

  const headers: Record<string, string> = {
    Accept: "application/json",

    Authorization: `Bearer ${options.token}`,
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${ADMIN_API_PREFIX}${path}`, {
      method: options.method ?? "GET",

      headers,

      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,

      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new AdminApiError(
      "Unable to connect to the server. Check your internet connection and API server.",
      0,
      "NETWORK_ERROR",
    );
  }

  return parseResponse<T>(response);
}

// ============================================================
// QUERY STRING
// ============================================================

function buildQuery(
  values: Record<string, string | number | boolean | undefined>,
): string {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== "ALL") {
      params.append(key, String(value));
    }
  });

  const query = params.toString();

  return query ? `?${query}` : "";
}

// ============================================================
// NORMALIZE DASHBOARD STATISTICS
// ============================================================

function normalizeStatistics(
  raw?: Partial<AdminDashboardStatistics>,
): AdminDashboardStatistics {
  return {
    totalUsers: raw?.totalUsers ?? 0,

    totalStudents: raw?.totalStudents ?? 0,

    totalStaff: raw?.totalStaff ?? 0,

    totalSecurityUsers: raw?.totalSecurityUsers ?? 0,

    totalAdmins: raw?.totalAdmins ?? 0,

    activeUsers: raw?.activeUsers ?? 0,

    inactiveUsers: raw?.inactiveUsers ?? 0,

    totalItems: raw?.totalItems ?? 0,

    lostItems: raw?.lostItems ?? 0,

    foundItems: raw?.foundItems ?? 0,

    openItems: raw?.openItems ?? 0,

    resolvedItems: raw?.resolvedItems ?? 0,

    totalClaims: raw?.totalClaims ?? 0,

    pendingClaims: raw?.pendingClaims ?? 0,

    approvedClaims: raw?.approvedClaims ?? 0,

    rejectedClaims: raw?.rejectedClaims ?? 0,

    completedClaims: raw?.completedClaims ?? 0,

    returnedItems: raw?.returnedItems ?? 0,
  };
}

// ============================================================
// ADMIN API
// ============================================================

export const adminApi = {
  // ==========================================================
  // DASHBOARD
  // ==========================================================

  async getDashboard(
    token: string,
    query: DashboardQuery = {},
    signal?: AbortSignal,
  ): Promise<AdminDashboardResponse> {
    const queryString = buildQuery({
      dateRange: query.dateRange,
    });

    const response = await request<
      ApiResponse<AdminDashboardResponse> & AdminDashboardResponse
    >(`/dashboard${queryString}`, {
      token,

      signal,
    });

    const raw = (response.data ?? response) as AdminDashboardResponse;

    return {
      statistics: normalizeStatistics(raw.statistics),

      recentActivities: Array.isArray(raw.recentActivities)
        ? raw.recentActivities
        : [],

      generatedAt: raw.generatedAt,
    };
  },

  // ==========================================================
  // USERS
  // ==========================================================

  async getUsers(
    token: string,
    filters: AdminUserFilters = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<AdminUser>> {
    const page = filters.page ?? 1;

    const limit = filters.limit ?? 20;

    const query = buildQuery({
      search: filters.search,

      role: filters.role,

      status: filters.status,

      department: filters.department,

      page,

      limit,

      sortBy: filters.sortBy,

      sortOrder: filters.sortOrder,
    });

    const response = await request<unknown>(`/users${query}`, {
      token,

      signal,
    });

    return normalizePaginatedResponse<AdminUser>(
      response,
      "users",
      page,
      limit,
    );
  },

  async getUserById(token: string, userId: string): Promise<AdminUser> {
    const response = await request<
      ApiResponse<AdminUser> & {
        user?: AdminUser;
      }
    >(`/users/${encodeURIComponent(userId)}`, {
      token,
    });

    const user = response.data ?? response.user;

    if (!user) {
      throw new AdminApiError(
        "User information was not returned by the server.",
        404,
      );
    }

    return user;
  },

  async createUser(
    token: string,
    payload: CreateAdminUserPayload,
  ): Promise<AdminUser> {
    const validation = this.validateCreateUser(payload);

    if (validation) {
      throw new AdminApiError(validation, 400);
    }

    const response = await request<
      ApiResponse<AdminUser> & {
        user?: AdminUser;
      }
    >("/users", {
      method: "POST",

      token,

      body: payload,
    });

    const user = response.data ?? response.user;

    if (!user) {
      throw new AdminApiError("The created user was not returned.");
    }

    return user;
  },

  async updateUser(
    token: string,
    userId: string,
    payload: UpdateAdminUserPayload,
  ): Promise<AdminUser> {
    const response = await request<
      ApiResponse<AdminUser> & {
        user?: AdminUser;
      }
    >(`/users/${encodeURIComponent(userId)}`, {
      method: "PATCH",

      token,

      body: payload,
    });

    const user = response.data ?? response.user;

    if (!user) {
      throw new AdminApiError("The updated user was not returned.");
    }

    return user;
  },

  async updateUserStatus(
    token: string,
    userId: string,
    status: AdminUserStatus,
  ): Promise<AdminUser> {
    return this.updateUser(token, userId, {
      status,

      isActive: status === "ACTIVE",
    });
  },

  async activateUser(token: string, userId: string): Promise<AdminUser> {
    return this.updateUserStatus(token, userId, "ACTIVE");
  },

  async deactivateUser(token: string, userId: string): Promise<AdminUser> {
    return this.updateUserStatus(token, userId, "INACTIVE");
  },

  async suspendUser(token: string, userId: string): Promise<AdminUser> {
    return this.updateUserStatus(token, userId, "SUSPENDED");
  },

  async deleteUser(token: string, userId: string): Promise<void> {
    await request(`/users/${encodeURIComponent(userId)}`, {
      method: "DELETE",

      token,
    });
  },

  // ==========================================================
  // ITEMS
  // ==========================================================

  async getItems(
    token: string,
    filters: AdminItemFilters = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<AdminItem>> {
    const page = filters.page ?? 1;

    const limit = filters.limit ?? 20;

    const query = buildQuery({
      search: filters.search,

      type: filters.type,

      status: filters.status,

      categoryId: filters.categoryId,

      locationId: filters.locationId,

      page,

      limit,

      sortBy: filters.sortBy,

      sortOrder: filters.sortOrder,
    });

    const response = await request<unknown>(`/items${query}`, {
      token,

      signal,
    });

    return normalizePaginatedResponse<AdminItem>(
      response,
      "items",
      page,
      limit,
    );
  },

  async getItemById(token: string, itemId: string): Promise<AdminItem> {
    const response = await request<
      ApiResponse<AdminItem> & {
        item?: AdminItem;
      }
    >(`/items/${encodeURIComponent(itemId)}`, {
      token,
    });

    const item = response.data ?? response.item;

    if (!item) {
      throw new AdminApiError(
        "Item information was not returned by the server.",
        404,
      );
    }

    return item;
  },

  async updateItem(
    token: string,
    itemId: string,
    payload: UpdateAdminItemPayload,
  ): Promise<AdminItem> {
    const response = await request<
      ApiResponse<AdminItem> & {
        item?: AdminItem;
      }
    >(`/items/${encodeURIComponent(itemId)}`, {
      method: "PATCH",

      token,

      body: payload,
    });

    const item = response.data ?? response.item;

    if (!item) {
      throw new AdminApiError("The updated item was not returned.");
    }

    return item;
  },

  async updateItemStatus(
    token: string,
    itemId: string,
    status: AdminItemStatus,
  ): Promise<AdminItem> {
    return this.updateItem(token, itemId, { status });
  },

  async approveItem(token: string, itemId: string): Promise<AdminItem> {
    return this.updateItem(token, itemId, {
      isApproved: true,

      status: "OPEN",
    });
  },

  async rejectItem(
    token: string,
    itemId: string,
    reason: string,
  ): Promise<AdminItem> {
    const validation = this.validateRejectionReason(reason);

    if (validation) {
      throw new AdminApiError(validation, 400);
    }

    return this.updateItem(token, itemId, {
      isApproved: false,

      status: "REJECTED",

      rejectionReason: reason.trim(),
    });
  },

  async deleteItem(token: string, itemId: string): Promise<void> {
    await request(`/items/${encodeURIComponent(itemId)}`, {
      method: "DELETE",

      token,
    });
  },

  // ==========================================================
  // VALIDATION
  // ==========================================================

  validateCreateUser(payload: CreateAdminUserPayload): string | null {
    if (!payload.fullName.trim()) {
      return "Full name is required.";
    }

    if (payload.fullName.trim().length < 2) {
      return "Full name must contain at least 2 characters.";
    }

    if (!payload.email.trim()) {
      return "Email address is required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(payload.email.trim())) {
      return "Enter a valid email address.";
    }

    if (!payload.role) {
      return "Select a user role.";
    }

    if (payload.password && payload.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    return null;
  },

  validateRejectionReason(reason: string): string | null {
    if (!reason.trim()) {
      return "A rejection reason is required.";
    }

    if (reason.trim().length < 5) {
      return "The rejection reason must contain at least 5 characters.";
    }

    if (reason.trim().length > 1000) {
      return "The rejection reason cannot exceed 1000 characters.";
    }

    return null;
  },

  // ==========================================================
  // FORMATTING HELPERS
  // ==========================================================

  getUserName(user: AdminUser): string {
    if (user.fullName?.trim()) {
      return user.fullName.trim();
    }

    if (user.name?.trim()) {
      return user.name.trim();
    }

    const combined = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return combined || user.email || "Unknown User";
  },

  getItemLocation(item: AdminItem): string {
    if (typeof item.location === "string") {
      return item.location;
    }

    return item.location?.name ?? "Unknown location";
  },

  getItemCategory(item: AdminItem): string {
    if (typeof item.category === "string") {
      return item.category;
    }

    return item.category?.name ?? "Uncategorized";
  },

  getItemReporterName(item: AdminItem): string {
    if (!item.reporter) {
      return "Unknown reporter";
    }

    return (
      item.reporter.fullName ??
      item.reporter.name ??
      item.reporter.email ??
      "Unknown reporter"
    );
  },

  getRoleLabel(role: AdminUserRole): string {
    const labels: Record<AdminUserRole, string> = {
      STUDENT: "Student",

      STAFF: "Staff",

      SECURITY: "Security",

      ADMIN: "Administrator",
    };

    return labels[role];
  },

  getUserStatusLabel(status?: AdminUserStatus): string {
    if (!status) {
      return "Unknown";
    }

    const labels: Record<AdminUserStatus, string> = {
      ACTIVE: "Active",

      INACTIVE: "Inactive",

      SUSPENDED: "Suspended",

      PENDING: "Pending",
    };

    return labels[status];
  },

  getItemStatusLabel(status: AdminItemStatus): string {
    const labels: Record<AdminItemStatus, string> = {
      OPEN: "Open",

      CLAIMED: "Claimed",

      RESOLVED: "Resolved",

      RETURNED: "Returned",

      CLOSED: "Closed",

      PENDING: "Pending",

      REJECTED: "Rejected",

      EXPIRED: "Expired",
    };

    return labels[status] ?? status;
  },

  getItemTypeLabel(type: AdminItemType): string {
    return type === "LOST" ? "Lost Item" : "Found Item";
  },

  formatDate(date?: string | null): string {
    if (!date) {
      return "Not available";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Invalid date";
    }

    return parsed.toLocaleDateString();
  },

  formatDateTime(date?: string | null): string {
    if (!date) {
      return "Not available";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Invalid date";
    }

    return parsed.toLocaleString();
  },

  getSecurityErrorMessage(error: unknown): string {
    if (error instanceof AdminApiError) {
      if (error.status === 401) {
        return "Your session has expired. Please sign in again.";
      }

      if (error.status === 403) {
        return "You do not have permission to perform this action.";
      }

      if (error.status === 404) {
        return "The requested record could not be found.";
      }

      if (error.status === 409) {
        return "This operation conflicts with the current record state.";
      }

      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "An unexpected error occurred. Please try again.";
  },
};

export default adminApi;
