// mobile/src/features/notifications/services/notificationsApi.ts

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

export type NotificationType =
  | "CLAIM_SUBMITTED"
  | "CLAIM_APPROVED"
  | "CLAIM_REJECTED"
  | "CLAIM_UPDATED"
  | "ITEM_MATCHED"
  | "ITEM_APPROVED"
  | "ITEM_REJECTED"
  | "ITEM_UPDATED"
  | "ITEM_CLAIMED"
  | "ITEM_RETURNED"
  | "MESSAGE_RECEIVED"
  | "SYSTEM"
  | "ANNOUNCEMENT"
  | "REMINDER"
  | "GENERAL";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface NotificationUser {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatarUrl?: string | null;
}

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  body?: string;
  type: NotificationType | string;
  priority?: NotificationPriority;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  relatedItemId?: string | null;
  relatedClaimId?: string | null;
  actionUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  sender?: NotificationUser | null;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType | string;
  search?: string;
  sortBy?: "newest" | "oldest";
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  pagination: NotificationPagination;
  unreadCount: number;
}

export interface NotificationApiError {
  message: string;
  status?: number;
  code?: string;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string | null;
  body?: unknown;
  signal?: AbortSignal;
}

const DEFAULT_PAGINATION: NotificationPagination = {
  page: 1,
  limit: 15,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const DEFAULT_FILTERS: Required<NotificationFilters> = {
  page: 1,
  limit: 15,
  isRead: undefined as unknown as boolean,
  type: "",
  search: "",
  sortBy: "newest",
};

function getErrorMessage(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.message === "string") {
      return record.message;
    }

    if (typeof record.error === "string") {
      return record.error;
    }
  }

  return "Something went wrong. Please try again.";
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let body: string | undefined;

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method ?? "GET",
      headers,
      body,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw {
      message:
        "Unable to connect to the server. Check your internet connection.",
      code: "NETWORK_ERROR",
    } satisfies NotificationApiError;
  }

  const responseText = await response.text();

  let responseData: unknown = null;

  if (responseText.trim()) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    throw {
      message: getErrorMessage(responseData),
      status: response.status,
      code: "REQUEST_FAILED",
    } satisfies NotificationApiError;
  }

  return responseData as T;
}

function unwrapResponse(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;

  if (record.data !== undefined) {
    return record.data;
  }

  return value;
}

function normalizeNotification(value: unknown): AppNotification {
  const record = (value ?? {}) as Record<string, unknown>;

  const metadata =
    record.metadata && typeof record.metadata === "object"
      ? (record.metadata as Record<string, unknown>)
      : null;

  return {
    id: String(record.id ?? record._id ?? ""),
    userId: record.userId ? String(record.userId) : undefined,
    title: String(record.title ?? "Notification"),
    message: String(record.message ?? record.body ?? record.description ?? ""),
    body: record.body ? String(record.body) : undefined,
    type: String(record.type ?? "GENERAL"),
    priority: (record.priority as NotificationPriority) ?? "NORMAL",
    isRead: Boolean(record.isRead ?? record.read ?? false),
    readAt: record.readAt ? String(record.readAt) : null,
    createdAt: String(record.createdAt ?? new Date().toISOString()),
    updatedAt: record.updatedAt ? String(record.updatedAt) : undefined,
    relatedItemId: record.relatedItemId
      ? String(record.relatedItemId)
      : record.itemId
        ? String(record.itemId)
        : null,
    relatedClaimId: record.relatedClaimId
      ? String(record.relatedClaimId)
      : record.claimId
        ? String(record.claimId)
        : null,
    actionUrl: record.actionUrl ? String(record.actionUrl) : null,
    metadata,
    sender: record.sender as NotificationUser | null | undefined,
  };
}

function normalizeList(
  value: unknown,
  requestedPage: number,
  requestedLimit: number,
): NotificationsResponse {
  const unwrapped = unwrapResponse(value);
  const record = (unwrapped ?? {}) as Record<string, unknown>;

  const rawNotifications = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray(record.notifications)
      ? record.notifications
      : Array.isArray(record.items)
        ? record.items
        : [];

  const notifications = rawNotifications.map(normalizeNotification);

  const rawPagination =
    record.pagination && typeof record.pagination === "object"
      ? (record.pagination as Record<string, unknown>)
      : {};

  const total = Number(
    rawPagination.total ?? record.total ?? notifications.length,
  );

  const page = Number(rawPagination.page ?? requestedPage);
  const limit = Number(rawPagination.limit ?? requestedLimit);

  const totalPages = Number(
    rawPagination.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 0),
  );

  const unreadCount = Number(
    record.unreadCount ??
      record.unread ??
      notifications.filter((notification) => !notification.isRead).length,
  );

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: Boolean(rawPagination.hasNextPage ?? page < totalPages),
      hasPreviousPage: Boolean(rawPagination.hasPreviousPage ?? page > 1),
    },
    unreadCount,
  };
}

function buildQuery(filters: NotificationFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.page !== undefined) {
    params.set("page", String(filters.page));
  }

  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  if (filters.isRead !== undefined) {
    params.set("isRead", String(filters.isRead));
  }

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.sortBy) {
    params.set("sortBy", filters.sortBy);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

const notificationsApi = {
  /**
   * Get the current user's notifications.
   */
  async getNotifications(
    token: string,
    filters: NotificationFilters = {},
    signal?: AbortSignal,
  ): Promise<NotificationsResponse> {
    const page = filters.page ?? DEFAULT_FILTERS.page;
    const limit = filters.limit ?? DEFAULT_FILTERS.limit;

    const response = await apiRequest<unknown>(
      `/notifications${buildQuery({ ...DEFAULT_FILTERS, ...filters })}`,
      { token, signal },
    );

    return normalizeList(response, page, limit);
  },

  /**
   * Get one notification by its ID.
   */
  async getNotificationById(
    notificationId: string,
    token: string,
  ): Promise<AppNotification> {
    const response = await apiRequest<unknown>(
      `/notifications/${encodeURIComponent(notificationId)}`,
      { token },
    );

    return normalizeNotification(unwrapResponse(response));
  },

  /**
   * Get the current user's unread notification count.
   */
  async getUnreadCount(token: string): Promise<number> {
    const response = await apiRequest<unknown>("/notifications/unread-count", {
      token,
    });

    const data = unwrapResponse(response);
    const record = (data ?? {}) as Record<string, unknown>;

    return Number(record.unreadCount ?? record.count ?? data ?? 0);
  },

  /**
   * Mark one notification as read.
   */
  async markAsRead(
    notificationId: string,
    token: string,
  ): Promise<AppNotification | null> {
    const response = await apiRequest<unknown>(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
      { method: "PATCH", token },
    );

    const data = unwrapResponse(response);

    if (!data || typeof data !== "object") {
      return null;
    }

    const record = data as Record<string, unknown>;

    if (!record.id && !record._id) {
      return null;
    }

    return normalizeNotification(data);
  },

  /**
   * Mark one notification as unread.
   */
  async markAsUnread(notificationId: string, token: string): Promise<void> {
    await apiRequest(
      `/notifications/${encodeURIComponent(notificationId)}/unread`,
      { method: "PATCH", token },
    );
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(token: string): Promise<void> {
    await apiRequest("/notifications/read-all", {
      method: "PATCH",
      token,
    });
  },

  /**
   * Delete one notification.
   */
  async deleteNotification(
    notificationId: string,
    token: string,
  ): Promise<void> {
    await apiRequest(`/notifications/${encodeURIComponent(notificationId)}`, {
      method: "DELETE",
      token,
    });
  },

  /**
   * Delete all read notifications.
   */
  async deleteReadNotifications(token: string): Promise<void> {
    await apiRequest("/notifications/read", {
      method: "DELETE",
      token,
    });
  },

  /**
   * Register a device push token.
   * The backend must implement this endpoint before using push notifications.
   */
  async registerDeviceToken(
    token: string,
    deviceToken: string,
    platform: "ios" | "android" | "web",
  ): Promise<void> {
    await apiRequest("/notifications/device-token", {
      method: "POST",
      token,
      body: {
        deviceToken,
        platform,
      },
    });
  },
};

export { DEFAULT_PAGINATION };
export default notificationsApi;
