// mobile/src/features/search/services/searchApi.ts

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const SEARCH_ENDPOINT = `${API_BASE_URL}/items`;

/* =========================================================
   TYPES
========================================================= */

export type SearchItemType = "ALL" | "LOST" | "FOUND";

export type SearchSortOption = "newest" | "oldest" | "title_asc" | "title_desc";

export interface SearchFilters {
  query: string;
  type: SearchItemType;
  categoryId: string;
  locationId: string;
  sortBy: SearchSortOption;
  page: number;
  limit: number;
}

export interface SearchCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface SearchLocation {
  id: string;
  name: string;
  description?: string | null;
}

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  type: "LOST" | "FOUND";
  status?: string;
  categoryId?: string | null;
  category?: SearchCategory | null;
  locationId?: string | null;
  location?: SearchLocation | null;
  imageUrls?: string[];
  color?: string | null;
  brand?: string | null;
  dateLostOrFound?: string | null;
  createdAt?: string;
  updatedAt?: string;
  reporterId?: string;
  ownerId?: string;
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchResponse {
  items: SearchItem[];
  pagination: SearchPagination;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  items?: SearchItem[];
  pagination?: SearchPagination;
}

export class SearchApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "SearchApiError";
    this.statusCode = statusCode;
  }
}

/* =========================================================
   DEFAULT VALUES
========================================================= */

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  query: "",
  type: "ALL",
  categoryId: "",
  locationId: "",
  sortBy: "newest",
  page: 1,
  limit: 12,
};

/* =========================================================
   URL HELPERS
========================================================= */

function buildSearchUrl(filters: SearchFilters): string {
  const params = new URLSearchParams();

  const query = filters.query.trim();

  if (query) {
    params.append("search", query);
  }

  if (filters.type !== "ALL") {
    params.append("type", filters.type);
  }

  if (filters.categoryId) {
    params.append("categoryId", filters.categoryId);
  }

  if (filters.locationId) {
    params.append("locationId", filters.locationId);
  }

  params.append("sortBy", filters.sortBy);
  params.append("page", String(filters.page));
  params.append("limit", String(filters.limit));

  return `${SEARCH_ENDPOINT}?${params.toString()}`;
}

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function isSearchItem(value: unknown): value is SearchItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.description === "string" &&
    (item.type === "LOST" || item.type === "FOUND")
  );
}

function normalizePagination(
  pagination: Partial<SearchPagination> | undefined,
  itemCount: number,
  page: number,
  limit: number,
): SearchPagination {
  const total = Number(pagination?.total ?? itemCount);
  const totalPages = Number(
    pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit)),
  );

  return {
    page: Number(pagination?.page ?? page),
    limit: Number(pagination?.limit ?? limit),
    total,
    totalPages,
    hasNextPage: pagination?.hasNextPage ?? page < totalPages,
    hasPreviousPage: pagination?.hasPreviousPage ?? page > 1,
  };
}

function normalizeSearchResponse(
  response: unknown,
  filters: SearchFilters,
): SearchResponse {
  const root = response as ApiResponse<unknown>;

  const data =
    root?.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : undefined;

  const possibleItems =
    (Array.isArray(data?.items) ? data.items : undefined) ??
    (Array.isArray(root?.items) ? root.items : undefined) ??
    (Array.isArray(root?.data) ? root.data : undefined) ??
    (Array.isArray(response) ? response : undefined);

  const items = (possibleItems ?? []).filter(isSearchItem);

  const paginationSource =
    (data?.pagination as Partial<SearchPagination> | undefined) ??
    root?.pagination;

  return {
    items,
    pagination: normalizePagination(
      paginationSource,
      items.length,
      filters.page,
      filters.limit,
    ),
  };
}

/* =========================================================
   HTTP REQUEST
========================================================= */

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new SearchApiError(
      "Unable to connect to the server. Check your internet connection.",
    );
  }

  let responseBody: unknown;

  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    const body = responseBody as ApiResponse<unknown> | null;

    throw new SearchApiError(
      body?.message || `Search request failed with status ${response.status}.`,
      response.status,
    );
  }

  return responseBody as T;
}

/* =========================================================
   SEARCH ITEMS
========================================================= */

export async function searchItems(
  filters: SearchFilters,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const url = buildSearchUrl(filters);

  const response = await request<unknown>(url, {
    method: "GET",
    signal,
  });

  return normalizeSearchResponse(response, filters);
}

/* =========================================================
   GET ALL CATEGORIES
========================================================= */

export async function getSearchCategories(
  signal?: AbortSignal,
): Promise<SearchCategory[]> {
  const response = await request<unknown>(`${API_BASE_URL}/categories`, {
    method: "GET",
    signal,
  });

  const root = response as ApiResponse<unknown>;

  const data =
    root?.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : undefined;

  const categories =
    (Array.isArray(data?.categories) ? data.categories : undefined) ??
    (Array.isArray(root?.data) ? root.data : undefined) ??
    (Array.isArray(root?.items) ? root.items : undefined) ??
    (Array.isArray(response) ? response : undefined);

  return (categories ?? []).filter((category): category is SearchCategory => {
    if (!category || typeof category !== "object") {
      return false;
    }

    const value = category as Record<string, unknown>;

    return typeof value.id === "string" && typeof value.name === "string";
  });
}

/* =========================================================
   GET ALL LOCATIONS
========================================================= */

export async function getSearchLocations(
  signal?: AbortSignal,
): Promise<SearchLocation[]> {
  const response = await request<unknown>(`${API_BASE_URL}/locations`, {
    method: "GET",
    signal,
  });

  const root = response as ApiResponse<unknown>;

  const data =
    root?.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : undefined;

  const locations =
    (Array.isArray(data?.locations) ? data.locations : undefined) ??
    (Array.isArray(root?.data) ? root.data : undefined) ??
    (Array.isArray(root?.items) ? root.items : undefined) ??
    (Array.isArray(response) ? response : undefined);

  return (locations ?? []).filter((location): location is SearchLocation => {
    if (!location || typeof location !== "object") {
      return false;
    }

    const value = location as Record<string, unknown>;

    return typeof value.id === "string" && typeof value.name === "string";
  });
}

/* =========================================================
   GET SINGLE ITEM
========================================================= */

export async function getSearchItemById(
  itemId: string,
  signal?: AbortSignal,
): Promise<SearchItem> {
  if (!itemId.trim()) {
    throw new SearchApiError("An item ID is required.");
  }

  const response = await request<unknown>(
    `${SEARCH_ENDPOINT}/${encodeURIComponent(itemId)}`,
    {
      method: "GET",
      signal,
    },
  );

  const root = response as ApiResponse<unknown>;

  const data =
    root?.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : undefined;

  const candidate = data?.item ?? root?.data ?? root;

  if (!isSearchItem(candidate)) {
    throw new SearchApiError("The server returned an invalid item.");
  }

  return candidate;
}

/* =========================================================
   SEARCH HELPERS
========================================================= */

export function hasActiveSearchFilters(filters: SearchFilters): boolean {
  return Boolean(
    filters.query.trim() ||
    filters.type !== "ALL" ||
    filters.categoryId ||
    filters.locationId ||
    filters.sortBy !== "newest",
  );
}

export function countActiveSearchFilters(filters: SearchFilters): number {
  let count = 0;

  if (filters.type !== "ALL") count += 1;
  if (filters.categoryId) count += 1;
  if (filters.locationId) count += 1;
  if (filters.sortBy !== "newest") count += 1;

  return count;
}

export function getItemImage(item: SearchItem): string | undefined {
  return item.imageUrls?.find(
    (url) => typeof url === "string" && url.trim().length > 0,
  );
}

/* =========================================================
   EXPORT DEFAULT API
========================================================= */

const searchApi = {
  searchItems,
  getSearchCategories,
  getSearchLocations,
  getSearchItemById,
  hasActiveSearchFilters,
  countActiveSearchFilters,
  getItemImage,
};

export default searchApi;
