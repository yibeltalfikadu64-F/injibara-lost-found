// mobile/src/services/apiClient.ts

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import tokenService from "./tokenService";

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

const API_TIMEOUT = 30_000;

const REFRESH_PATH =
  process.env.EXPO_PUBLIC_AUTH_REFRESH_PATH || "/auth/refresh";

// ============================================================
// TYPES
// ============================================================

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
  code?: string;
}

export interface ApiSuccessResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface ApiRequestOptions {
  requiresAuth?: boolean;
  timeout?: number;
  signal?: AbortSignal;
}

export interface RefreshTokenResponse {
  accessToken?: string;
  refreshToken?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
  skipAuthorization?: boolean;
}

// ============================================================
// CUSTOM API ERROR
// ============================================================

export class ApiError extends Error {
  statusCode?: number;

  code?: string;

  details?: Record<string, string[]>;

  originalError?: unknown;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      code?: string;
      details?: Record<string, string[]>;
      originalError?: unknown;
    },
  ) {
    super(message);

    this.name = "ApiError";

    this.statusCode = options?.statusCode;

    this.code = options?.code;

    this.details = options?.details;

    this.originalError = options?.originalError;
  }
}

// ============================================================
// AXIOS INSTANCE
// ============================================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,

  timeout: API_TIMEOUT,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ============================================================
// PUBLIC CONFIGURATION
// ============================================================

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function getApiTimeout(): number {
  return API_TIMEOUT;
}

// ============================================================
// ERROR NORMALIZATION
// ============================================================

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    const response = axiosError.response;

    if (response) {
      const data = response.data;

      return new ApiError(
        data?.message ||
          data?.error ||
          axiosError.message ||
          "The server rejected the request.",
        {
          statusCode: response.status,
          code: data?.code,
          details: data?.errors,
          originalError: error,
        },
      );
    }

    if (axiosError.code === "ECONNABORTED") {
      return new ApiError("The request timed out. Please try again.", {
        code: "REQUEST_TIMEOUT",
        originalError: error,
      });
    }

    if (
      axiosError.code === "ERR_CANCELED" ||
      axiosError.code === "ECONNABORTED"
    ) {
      return new ApiError("The request was cancelled.", {
        code: "REQUEST_CANCELLED",
        originalError: error,
      });
    }

    return new ApiError(
      "Unable to connect to the server. Check your internet connection and server address.",
      {
        code: "NETWORK_ERROR",
        originalError: error,
      },
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message, {
      originalError: error,
    });
  }

  return new ApiError("An unexpected error occurred.", {
    originalError: error,
  });
}

// ============================================================
// REFRESH RESPONSE EXTRACTION
// ============================================================

function extractRefreshTokens(response: RefreshTokenResponse): {
  accessToken: string;
  refreshToken: string;
} | null {
  const data = response.data ?? response;

  if (
    typeof data.accessToken !== "string" ||
    typeof data.refreshToken !== "string" ||
    !data.accessToken ||
    !data.refreshToken
  ) {
    return null;
  }

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}

// ============================================================
// REFRESH STATE
// ============================================================

let refreshPromise: Promise<string> | null = null;

let isLoggingOut = false;

// ============================================================
// AUTHORIZATION HEADER
// ============================================================

async function attachAuthorization(
  config: RetriableRequestConfig,
): Promise<RetriableRequestConfig> {
  if (config.skipAuthorization) {
    return config;
  }

  const token = await tokenService.getAccessToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
}

// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = await tokenService.getRefreshToken();

      if (!refreshToken) {
        throw new ApiError("Your session has expired. Please sign in again.", {
          statusCode: 401,
          code: "REFRESH_TOKEN_MISSING",
        });
      }

      // Use a separate Axios request to avoid running the
      // normal 401 response interceptor recursively.
      const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}${REFRESH_PATH}`,
        {
          refreshToken,
        },
        {
          timeout: API_TIMEOUT,

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      const tokens = extractRefreshTokens(response.data);

      if (!tokens) {
        throw new ApiError("The server returned an invalid token response.", {
          code: "INVALID_REFRESH_RESPONSE",
        });
      }

      // Save both tokens because the backend may rotate
      // the refresh token after every successful refresh.
      await tokenService.saveTokens(tokens);

      return tokens.accessToken;
    } catch (error) {
      await tokenService.clearTokens();

      throw normalizeApiError(error);
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    return attachAuthorization(config as RetriableRequestConfig);
  },
  (error: unknown) => {
    return Promise.reject(normalizeApiError(error));
  },
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(normalizeApiError(error));
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined;

    const statusCode = error.response?.status;

    if (
      statusCode !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.skipAuthRefresh ||
      isLoggingOut
    ) {
      return Promise.reject(normalizeApiError(error));
    }

    // Do not refresh tokens for the refresh request itself.
    if (originalRequest.url?.includes(REFRESH_PATH)) {
      return Promise.reject(normalizeApiError(error));
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();

      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);

      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(normalizeApiError(refreshError));
    }
  },
);

// ============================================================
// REQUEST HELPERS
// ============================================================

async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.get<T>(url, config);

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await apiClient.post<T>(url, data, config);

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await apiClient.put<T>(url, data, config);

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  try {
    const response = await apiClient.patch<T>(url, data, config);

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

async function remove<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.delete<T>(url, config);

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

// ============================================================
// AUTHENTICATED REQUEST HELPERS
// ============================================================

async function getAuthenticated<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  return get<T>(url, config);
}

async function postAuthenticated<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  return post<T>(url, data, config);
}

// ============================================================
// PUBLIC AUTH REQUEST
// ============================================================

async function postWithoutAuth<T>(url: string, data?: unknown): Promise<T> {
  try {
    const response = await apiClient.post<T>(url, data, {
      skipAuthorization: true,
      skipAuthRefresh: true,
    } as AxiosRequestConfig);

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

// ============================================================
// LOGOUT STATE
// ============================================================

async function clearAuthentication(): Promise<void> {
  isLoggingOut = true;

  try {
    await tokenService.clearTokens();
  } finally {
    isLoggingOut = false;
  }
}

// ============================================================
// HEALTH CHECK
// ============================================================

async function checkServerHealth(): Promise<boolean> {
  try {
    await apiClient.get("/health", {
      timeout: 10_000,

      skipAuthorization: true,
      skipAuthRefresh: true,
    } as AxiosRequestConfig);

    return true;
  } catch {
    return false;
  }
}

// ============================================================
// EXPORT
// ============================================================

const api = {
  instance: apiClient,

  get,
  post,
  put,
  patch,
  delete: remove,

  getAuthenticated,
  postAuthenticated,
  postWithoutAuth,

  refreshAccessToken,

  clearAuthentication,

  checkServerHealth,

  getApiBaseUrl,
  getApiTimeout,

  normalizeApiError,
};

export default api;
