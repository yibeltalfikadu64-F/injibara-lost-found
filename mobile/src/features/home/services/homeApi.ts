// mobile/src/features/home/services/homeApi.ts

/**
 * Injibara Campus Lost & Found
 * Home API Service
 *
 * Responsibilities:
 * - Retrieve home dashboard statistics
 * - Retrieve recent lost and found items
 * - Retrieve university announcements
 * - Retrieve personalized dashboard data
 * - Handle API errors
 * - Support optional authentication tokens
 */

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

/* =========================================================
   1. TYPES
========================================================= */

export type HomeItemType = "LOST" | "FOUND";

export type HomeItemStatus =
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "CLAIMED"
  | "RETURNED"
  | "REJECTED"
  | "RESOLVED"
  | "EXPIRED";

export interface HomeItem {
  id: string;
  title: string;
  description?: string;

  type: HomeItemType;

  status: HomeItemStatus;

  imageUrl?: string | null;

  category?: string | null;

  location?: string | null;

  reportedAt?: string;

  createdAt: string;

  updatedAt?: string;

  isUrgent?: boolean;
}

export interface HomeStatistics {
  totalLostItems: number;
  totalFoundItems: number;
  totalReturnedItems: number;
  totalActiveItems: number;
  totalClaims: number;
  totalUsers?: number;
}

export interface HomeAnnouncement {
  id: string;
  title: string;
  message: string;

  category?: string;

  priority?: "LOW" | "NORMAL" | "HIGH";

  imageUrl?: string | null;

  publishedAt?: string;

  createdAt: string;

  expiresAt?: string | null;
}

export interface HomeDashboard {
  statistics: HomeStatistics;
  recentItems: HomeItem[];
  announcements: HomeAnnouncement[];
}

export interface HomeApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

/* =========================================================
   2. DEFAULT DATA
========================================================= */

export const DEFAULT_HOME_STATISTICS: HomeStatistics = {
  totalLostItems: 0,
  totalFoundItems: 0,
  totalReturnedItems: 0,
  totalActiveItems: 0,
  totalClaims: 0,
  totalUsers: 0,
};

/* =========================================================
   3. API ERROR
========================================================= */

export class HomeApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);

    this.name = "HomeApiError";

    this.statusCode = statusCode;
  }
}

/* =========================================================
   4. RESPONSE HELPERS
========================================================= */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    Number.isFinite(Number(value))
  ) {
    return Number(value);
  }

  return fallback;
}

/**
 * Supports common API response formats:
 *
 * { data: [...] }
 * { items: [...] }
 * { success: true, data: { items: [...] } }
 */

function extractData(response: unknown): unknown {
  if (!isObject(response)) {
    return response;
  }

  if (response.data !== undefined) {
    return response.data;
  }

  return response;
}

/* =========================================================
   5. HTTP REQUEST
========================================================= */

async function homeRequest<T>(
  endpoint: string,
  accessToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers,
    });
  } catch {
    throw new HomeApiError(
      "Unable to connect to the server. Check your internet connection.",
    );
  }

  if (!response.ok) {
    let message = "Unable to retrieve dashboard information.";

    try {
      const body: unknown = await response.json();

      if (isObject(body)) {
        message = getString(body.message) || getString(body.error) || message;
      }
    } catch {
      // Use the default error message.
    }

    throw new HomeApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new HomeApiError(
      "The server returned an invalid response.",
      response.status,
    );
  }
}

/* =========================================================
   6. NORMALIZE ITEM
========================================================= */

function normalizeItem(value: unknown): HomeItem | null {
  if (!isObject(value)) {
    return null;
  }

  const id = value.id ?? value.itemId;

  if (typeof id !== "string" && typeof id !== "number") {
    return null;
  }

  const type = getString(value.type, "LOST").toUpperCase();

  const status = getString(value.status, "PENDING").toUpperCase();

  const validTypes: HomeItemType[] = ["LOST", "FOUND"];

  const validStatuses: HomeItemStatus[] = [
    "PENDING",
    "APPROVED",
    "ACTIVE",
    "CLAIMED",
    "RETURNED",
    "REJECTED",
    "RESOLVED",
    "EXPIRED",
  ];

  const imageValue =
    value.imageUrl ??
    value.image ??
    (isArray(value.imageUrls) ? value.imageUrls[0] : null);

  const categoryValue = isObject(value.category)
    ? value.category.name
    : value.category;

  const locationValue = isObject(value.location)
    ? value.location.name
    : value.location;

  return {
    id: String(id),

    title: getString(value.title, "Untitled item"),

    description: getString(value.description),

    type: validTypes.includes(type as HomeItemType)
      ? (type as HomeItemType)
      : "LOST",

    status: validStatuses.includes(status as HomeItemStatus)
      ? (status as HomeItemStatus)
      : "PENDING",

    imageUrl: typeof imageValue === "string" ? imageValue : null,

    category: typeof categoryValue === "string" ? categoryValue : null,

    location: typeof locationValue === "string" ? locationValue : null,

    reportedAt: getString(value.reportedAt),

    createdAt: getString(value.createdAt, new Date().toISOString()),

    updatedAt: getString(value.updatedAt),

    isUrgent: typeof value.isUrgent === "boolean" ? value.isUrgent : false,
  };
}

/* =========================================================
   7. NORMALIZE ANNOUNCEMENT
========================================================= */

function normalizeAnnouncement(value: unknown): HomeAnnouncement | null {
  if (!isObject(value)) {
    return null;
  }

  const id = value.id ?? value.announcementId;

  if (typeof id !== "string" && typeof id !== "number") {
    return null;
  }

  const priority = getString(value.priority, "NORMAL").toUpperCase();

  const validPriorities = ["LOW", "NORMAL", "HIGH"] as const;

  return {
    id: String(id),

    title: getString(value.title, "University Announcement"),

    message: getString(value.message ?? value.content),

    category: getString(value.category, "GENERAL"),

    priority: validPriorities.includes(
      priority as (typeof validPriorities)[number],
    )
      ? (priority as HomeAnnouncement["priority"])
      : "NORMAL",

    imageUrl: typeof value.imageUrl === "string" ? value.imageUrl : null,

    publishedAt: getString(value.publishedAt),

    createdAt: getString(value.createdAt, new Date().toISOString()),

    expiresAt: typeof value.expiresAt === "string" ? value.expiresAt : null,
  };
}

/* =========================================================
   8. NORMALIZE STATISTICS
========================================================= */

function normalizeStatistics(value: unknown): HomeStatistics {
  if (!isObject(value)) {
    return DEFAULT_HOME_STATISTICS;
  }

  return {
    totalLostItems: getNumber(
      value.totalLostItems ?? value.lostItems ?? value.totalLost,
    ),

    totalFoundItems: getNumber(
      value.totalFoundItems ?? value.foundItems ?? value.totalFound,
    ),

    totalReturnedItems: getNumber(
      value.totalReturnedItems ?? value.returnedItems,
    ),

    totalActiveItems: getNumber(value.totalActiveItems ?? value.activeItems),

    totalClaims: getNumber(value.totalClaims ?? value.claims),

    totalUsers: getNumber(value.totalUsers ?? value.users),
  };
}

/* =========================================================
   9. GET DASHBOARD
========================================================= */

/**
 * GET /home/dashboard
 *
 * The endpoint is configurable to match your backend.
 */
export async function getHomeDashboard(
  accessToken?: string,
): Promise<HomeDashboard> {
  const response = await homeRequest<unknown>("/home/dashboard", accessToken);

  const data = extractData(response);

  if (!isObject(data)) {
    throw new HomeApiError("Invalid dashboard response.");
  }

  const statistics = normalizeStatistics(data.statistics ?? data.stats);

  const rawItems = data.recentItems ?? data.items;

  const rawAnnouncements = data.announcements;

  const recentItems = isArray(rawItems)
    ? rawItems
        .map(normalizeItem)
        .filter((item): item is HomeItem => item !== null)
    : [];

  const announcements = isArray(rawAnnouncements)
    ? rawAnnouncements
        .map(normalizeAnnouncement)
        .filter((item): item is HomeAnnouncement => item !== null)
    : [];

  return {
    statistics,
    recentItems,
    announcements,
  };
}

/* =========================================================
   10. GET STATISTICS
========================================================= */

export async function getHomeStatistics(
  accessToken?: string,
): Promise<HomeStatistics> {
  const response = await homeRequest<unknown>("/home/statistics", accessToken);

  const data = extractData(response);

  return normalizeStatistics(data);
}

/* =========================================================
   11. GET RECENT ITEMS
========================================================= */

export async function getRecentItems(
  accessToken?: string,
  limit = 5,
): Promise<HomeItem[]> {
  const response = await homeRequest<unknown>(
    `/items/recent?limit=${limit}`,
    accessToken,
  );

  const data = extractData(response);

  let items: unknown[] = [];

  if (isArray(data)) {
    items = data;
  } else if (isObject(data)) {
    if (isArray(data.items)) {
      items = data.items;
    } else if (isArray(data.results)) {
      items = data.results;
    }
  }

  return items
    .map(normalizeItem)
    .filter((item): item is HomeItem => item !== null);
}

/* =========================================================
   12. GET ANNOUNCEMENTS
========================================================= */

export async function getAnnouncements(
  accessToken?: string,
  limit = 5,
): Promise<HomeAnnouncement[]> {
  const response = await homeRequest<unknown>(
    `/announcements?limit=${limit}`,
    accessToken,
  );

  const data = extractData(response);

  let announcements: unknown[] = [];

  if (isArray(data)) {
    announcements = data;
  } else if (isObject(data)) {
    if (isArray(data.announcements)) {
      announcements = data.announcements;
    } else if (isArray(data.results)) {
      announcements = data.results;
    }
  }

  return announcements
    .map(normalizeAnnouncement)
    .filter((item): item is HomeAnnouncement => item !== null);
}

/* =========================================================
   13. EXPORT SERVICE
========================================================= */

export const homeApi = {
  getDashboard: getHomeDashboard,
  getStatistics: getHomeStatistics,
  getRecentItems,
  getAnnouncements,
};

export default homeApi;
