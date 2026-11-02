import axios from "axios";

import { apiClient, getApiErrorMessage } from "../lib/apiClient";

/**
 * Central API configuration.
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",

  TIMEOUT: 20000,

  DEFAULT_PAGE_SIZE: 10,

  MAX_PAGE_SIZE: 100,
};

/**
 * Standard API response.
 */
export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

/**
 * Pagination information.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated API response.
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Standard API error.
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

/**
 * Query parameters.
 */
export interface ApiQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}

/**
 * Check whether an error is an Axios error.
 */
export function isApiError(error: unknown): boolean {
  return axios.isAxiosError(error);
}

/**
 * Get a readable error message.
 */
export function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred.",
): string {
  return getApiErrorMessage(error, fallback);
}

/**
 * Build URL query parameters.
 */
export function buildQueryParams(params: ApiQueryParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams;
}

/**
 * Normalize API list responses.
 *
 * Supports common response structures:
 * { items: [] }
 * { data: [] }
 * { data: { items: [] } }
 * []
 */
export function normalizeListResponse<T>(
  response: unknown,
  possibleKeys: string[] = ["items", "results", "data"],
): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const record = response as Record<string, unknown>;

  for (const key of possibleKeys) {
    if (Array.isArray(record[key])) {
      return record[key] as T[];
    }
  }

  if (record.data && typeof record.data === "object") {
    const nested = record.data as Record<string, unknown>;

    for (const key of possibleKeys) {
      if (Array.isArray(nested[key])) {
        return nested[key] as T[];
      }
    }
  }

  return [];
}

/**
 * Extract an object from common API response envelopes.
 */
export function normalizeObjectResponse<T>(response: unknown): T {
  if (response && typeof response === "object" && "data" in response) {
    const record = response as { data?: T };

    if (record.data !== undefined) {
      return record.data;
    }
  }

  return response as T;
}

/**
 * API health and connectivity helper.
 *
 * This only checks connectivity if the backend exposes
 * the configured health endpoint.
 */
export async function checkApiConnection(): Promise<boolean> {
  try {
    await apiClient.get("/health");
    return true;
  } catch {
    return false;
  }
}

/**
 * Export the single configured Axios instance.
 */
export { apiClient };

export default apiClient;
