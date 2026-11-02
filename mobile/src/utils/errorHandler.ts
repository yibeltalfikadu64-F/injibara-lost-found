// mobile/src/utils/errorHandler.ts

import axios, { AxiosError } from "axios";

// ============================================================
// ERROR TYPES
// ============================================================

export type AppErrorType =
  | "NETWORK"
  | "AUTHENTICATION"
  | "AUTHORIZATION"
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMIT"
  | "SERVER"
  | "TIMEOUT"
  | "CANCELLED"
  | "UNKNOWN";

// ============================================================
// ERROR SEVERITY
// ============================================================

export type ErrorSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// ============================================================
// ERROR CODES
// ============================================================

export enum AppErrorCode {
  NETWORK_ERROR = "NETWORK_ERROR",

  CONNECTION_TIMEOUT = "CONNECTION_TIMEOUT",

  CONNECTION_REFUSED = "CONNECTION_REFUSED",

  UNAUTHORIZED = "UNAUTHORIZED",

  FORBIDDEN = "FORBIDDEN",

  TOKEN_EXPIRED = "TOKEN_EXPIRED",

  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",

  VALIDATION_ERROR = "VALIDATION_ERROR",

  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",

  DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE",

  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  SERVER_ERROR = "SERVER_ERROR",

  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  REQUEST_CANCELLED = "REQUEST_CANCELLED",

  FILE_TOO_LARGE = "FILE_TOO_LARGE",

  UNSUPPORTED_FILE_TYPE = "UNSUPPORTED_FILE_TYPE",

  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// ============================================================
// VALIDATION ERROR
// ============================================================

export interface FieldError {
  field: string;

  message: string;

  code?: string;
}

// ============================================================
// API ERROR RESPONSE
// ============================================================

export interface ApiErrorResponse {
  success?: false;

  message?: string;

  error?: string;

  code?: string;

  statusCode?: number;

  errors?: FieldError[] | Record<string, string>;

  details?: unknown;
}

// ============================================================
// APPLICATION ERROR
// ============================================================

export interface AppError {
  type: AppErrorType;

  code: AppErrorCode | string;

  message: string;

  userMessage: string;

  statusCode?: number;

  severity: ErrorSeverity;

  isRetryable: boolean;

  timestamp: string;

  details?: unknown;

  fieldErrors?: FieldError[];
}

// ============================================================
// ERROR HANDLER OPTIONS
// ============================================================

export interface ErrorHandlerOptions {
  fallbackMessage?: string;

  showServerMessage?: boolean;

  logError?: boolean;

  context?: string;
}

// ============================================================
// DEFAULT OPTIONS
// ============================================================

const DEFAULT_ERROR_OPTIONS: Required<ErrorHandlerOptions> = {
  fallbackMessage: "Something went wrong. Please try again.",

  showServerMessage: false,

  logError: true,

  context: "Application",
};

// ============================================================
// USER-FRIENDLY MESSAGES
// ============================================================

const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  [AppErrorCode.NETWORK_ERROR]:
    "Unable to connect. Check your internet connection.",

  [AppErrorCode.CONNECTION_TIMEOUT]:
    "The request took too long. Please try again.",

  [AppErrorCode.CONNECTION_REFUSED]: "The server could not be reached.",

  [AppErrorCode.UNAUTHORIZED]: "Your session has expired. Please log in again.",

  [AppErrorCode.FORBIDDEN]:
    "You do not have permission to perform this action.",

  [AppErrorCode.TOKEN_EXPIRED]:
    "Your session has expired. Please log in again.",

  [AppErrorCode.INVALID_CREDENTIALS]: "Your email or password is incorrect.",

  [AppErrorCode.VALIDATION_ERROR]: "Please check the information you entered.",

  [AppErrorCode.RESOURCE_NOT_FOUND]:
    "The requested information could not be found.",

  [AppErrorCode.DUPLICATE_RESOURCE]: "This information already exists.",

  [AppErrorCode.RATE_LIMIT_EXCEEDED]:
    "Too many requests. Please wait before trying again.",

  [AppErrorCode.SERVER_ERROR]:
    "The server encountered an error. Please try again later.",

  [AppErrorCode.SERVICE_UNAVAILABLE]: "The service is temporarily unavailable.",

  [AppErrorCode.REQUEST_CANCELLED]: "The request was cancelled.",

  [AppErrorCode.FILE_TOO_LARGE]: "The selected file is too large.",

  [AppErrorCode.UNSUPPORTED_FILE_TYPE]:
    "The selected file type is not supported.",

  [AppErrorCode.UNKNOWN_ERROR]: "Something went wrong. Please try again.",
};

// ============================================================
// CREATE APPLICATION ERROR
// ============================================================

export function createAppError(
  options: Partial<AppError> & {
    message: string;
  },
): AppError {
  const code = options.code ?? AppErrorCode.UNKNOWN_ERROR;

  const normalizedCode = Object.values(AppErrorCode).includes(
    code as AppErrorCode,
  )
    ? (code as AppErrorCode)
    : AppErrorCode.UNKNOWN_ERROR;

  return {
    type: options.type ?? "UNKNOWN",

    code: normalizedCode,

    message: options.message,

    userMessage: options.userMessage ?? ERROR_MESSAGES[normalizedCode],

    ...(options.statusCode !== undefined
      ? { statusCode: options.statusCode }
      : {}),

    severity: options.severity ?? "MEDIUM",

    isRetryable: options.isRetryable ?? false,

    timestamp: options.timestamp ?? new Date().toISOString(),

    ...(options.details !== undefined ? { details: options.details } : {}),

    ...(options.fieldErrors !== undefined
      ? { fieldErrors: options.fieldErrors }
      : {}),
  };
}

// ============================================================
// MAP HTTP STATUS TO ERROR TYPE
// ============================================================

export function getErrorTypeFromStatus(statusCode: number): AppErrorType {
  if (statusCode === 401) {
    return "AUTHENTICATION";
  }

  if (statusCode === 403) {
    return "AUTHORIZATION";
  }

  if (statusCode === 400 || statusCode === 422) {
    return "VALIDATION";
  }

  if (statusCode === 404) {
    return "NOT_FOUND";
  }

  if (statusCode === 409) {
    return "CONFLICT";
  }

  if (statusCode === 429) {
    return "RATE_LIMIT";
  }

  if (statusCode >= 500) {
    return "SERVER";
  }

  return "UNKNOWN";
}

// ============================================================
// MAP HTTP STATUS TO ERROR CODE
// ============================================================

export function getErrorCodeFromStatus(statusCode: number): AppErrorCode {
  switch (statusCode) {
    case 401:
      return AppErrorCode.UNAUTHORIZED;

    case 403:
      return AppErrorCode.FORBIDDEN;

    case 404:
      return AppErrorCode.RESOURCE_NOT_FOUND;

    case 409:
      return AppErrorCode.DUPLICATE_RESOURCE;

    case 422:
    case 400:
      return AppErrorCode.VALIDATION_ERROR;

    case 429:
      return AppErrorCode.RATE_LIMIT_EXCEEDED;

    case 503:
      return AppErrorCode.SERVICE_UNAVAILABLE;

    default:
      return statusCode >= 500
        ? AppErrorCode.SERVER_ERROR
        : AppErrorCode.UNKNOWN_ERROR;
  }
}

// ============================================================
// EXTRACT FIELD ERRORS
// ============================================================

export function extractFieldErrors(
  errors: ApiErrorResponse["errors"],
): FieldError[] {
  if (!errors) {
    return [];
  }

  if (Array.isArray(errors)) {
    return errors.filter(
      (error): error is FieldError =>
        typeof error.field === "string" && typeof error.message === "string",
    );
  }

  return Object.entries(errors).map(([field, message]) => ({
    field,

    message: typeof message === "string" ? message : "Invalid value.",
  }));
}

// ============================================================
// GET FIELD ERROR MESSAGE
// ============================================================

export function getFieldError(
  fieldErrors: FieldError[],
  fieldName: string,
): string | undefined {
  return fieldErrors.find((error) => error.field === fieldName)?.message;
}

// ============================================================
// DETECT NETWORK ERROR
// ============================================================

export function isNetworkError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const axiosError = error as AxiosError;

  return !axiosError.response && !axiosError.request?.status;
}

// ============================================================
// DETECT TIMEOUT ERROR
// ============================================================

export function isTimeoutError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
}

// ============================================================
// DETECT CANCELLED REQUEST
// ============================================================

export function isCancelledRequest(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (axios.isAxiosError(error) && error.code === "ERR_CANCELED")
  );
}

// ============================================================
// DETECT SERVER ERROR
// ============================================================

export function isServerError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  return error.response?.status !== undefined && error.response.status >= 500;
}

// ============================================================
// DETECT AUTHENTICATION ERROR
// ============================================================

export function isAuthenticationError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

// ============================================================
// DETECT AUTHORIZATION ERROR
// ============================================================

export function isAuthorizationError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 403;
}

// ============================================================
// NORMALIZE UNKNOWN ERROR
// ============================================================

export function normalizeError(
  error: unknown,
  options: ErrorHandlerOptions = {},
): AppError {
  const config = {
    ...DEFAULT_ERROR_OPTIONS,
    ...options,
  };

  // ----------------------------------------------------------
  // CANCELLED REQUEST
  // ----------------------------------------------------------

  if (isCancelledRequest(error)) {
    return createAppError({
      type: "CANCELLED",

      code: AppErrorCode.REQUEST_CANCELLED,

      message: "Request was cancelled.",

      severity: "LOW",

      isRetryable: false,
    });
  }

  // ----------------------------------------------------------
  // TIMEOUT ERROR
  // ----------------------------------------------------------

  if (isTimeoutError(error)) {
    return createAppError({
      type: "TIMEOUT",

      code: AppErrorCode.CONNECTION_TIMEOUT,

      message: "Request timeout.",

      severity: "MEDIUM",

      isRetryable: true,
    });
  }

  // ----------------------------------------------------------
  // NETWORK ERROR
  // ----------------------------------------------------------

  if (isNetworkError(error)) {
    return createAppError({
      type: "NETWORK",

      code: AppErrorCode.NETWORK_ERROR,

      message: "Network connection failed.",

      severity: "MEDIUM",

      isRetryable: true,
    });
  }

  // ----------------------------------------------------------
  // AXIOS ERROR
  // ----------------------------------------------------------

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    const statusCode = axiosError.response?.status;

    if (statusCode !== undefined) {
      const type = getErrorTypeFromStatus(statusCode);

      const code = getErrorCodeFromStatus(statusCode);

      const responseData = axiosError.response?.data;

      const serverMessage = responseData?.message ?? responseData?.error;

      const fieldErrors = extractFieldErrors(responseData?.errors);

      return createAppError({
        type,

        code,

        message: serverMessage ?? axiosError.message ?? "API request failed.",

        userMessage:
          config.showServerMessage && typeof serverMessage === "string"
            ? serverMessage
            : ERROR_MESSAGES[code],

        statusCode,

        severity:
          statusCode >= 500
            ? "HIGH"
            : statusCode === 401 || statusCode === 403
              ? "MEDIUM"
              : "LOW",

        isRetryable:
          statusCode === 408 ||
          statusCode === 425 ||
          statusCode === 429 ||
          statusCode >= 500,

        fieldErrors,

        details: {
          method: axiosError.config?.method,

          url: axiosError.config?.url,
        },
      });
    }

    return createAppError({
      type: "UNKNOWN",

      code: AppErrorCode.UNKNOWN_ERROR,

      message: axiosError.message,

      userMessage: config.fallbackMessage,

      severity: "MEDIUM",

      isRetryable: false,
    });
  }

  // ----------------------------------------------------------
  // STANDARD JAVASCRIPT ERROR
  // ----------------------------------------------------------

  if (error instanceof Error) {
    return createAppError({
      type: "UNKNOWN",

      code: AppErrorCode.UNKNOWN_ERROR,

      message: error.message,

      userMessage: config.fallbackMessage,

      severity: "MEDIUM",

      isRetryable: false,
    });
  }

  // ----------------------------------------------------------
  // STRING ERROR
  // ----------------------------------------------------------

  if (typeof error === "string") {
    return createAppError({
      type: "UNKNOWN",

      code: AppErrorCode.UNKNOWN_ERROR,

      message: error,

      userMessage: config.fallbackMessage,

      severity: "MEDIUM",

      isRetryable: false,
    });
  }

  // ----------------------------------------------------------
  // UNKNOWN ERROR
  // ----------------------------------------------------------

  return createAppError({
    type: "UNKNOWN",

    code: AppErrorCode.UNKNOWN_ERROR,

    message: "An unknown error occurred.",

    userMessage: config.fallbackMessage,

    severity: "MEDIUM",

    isRetryable: false,
  });
}

// ============================================================
// CENTRAL ERROR HANDLER
// ============================================================

export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {},
): AppError {
  const config = {
    ...DEFAULT_ERROR_OPTIONS,
    ...options,
  };

  const normalizedError = normalizeError(error, config);

  if (config.logError) {
    logError(normalizedError, config.context);
  }

  return normalizedError;
}

// ============================================================
// ERROR LOGGER
// ============================================================

export function logError(error: AppError, context = "Application"): void {
  if (__DEV__) {
    console.group(`[${context}] Error`);

    console.error("Type:", error.type);

    console.error("Code:", error.code);

    console.error("Message:", error.message);

    console.error("User message:", error.userMessage);

    console.error("Status code:", error.statusCode);

    console.error("Severity:", error.severity);

    console.error("Retryable:", error.isRetryable);

    if (error.fieldErrors?.length) {
      console.error("Field errors:", error.fieldErrors);
    }

    console.error("Timestamp:", error.timestamp);

    console.groupEnd();
  }
}

// ============================================================
// GET USER-FRIENDLY ERROR MESSAGE
// ============================================================

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const normalized = normalizeError(error, {
    fallbackMessage: fallback,
    logError: false,
  });

  return normalized.userMessage || fallback;
}

// ============================================================
// GET ERROR SEVERITY
// ============================================================

export function getErrorSeverity(error: unknown): ErrorSeverity {
  return normalizeError(error, {
    logError: false,
  }).severity;
}

// ============================================================
// CHECK IF ERROR CAN BE RETRIED
// ============================================================

export function canRetryRequest(error: unknown): boolean {
  return normalizeError(error, {
    logError: false,
  }).isRetryable;
}

// ============================================================
// GET HTTP STATUS
// ============================================================

export function getHttpStatusCode(error: unknown): number | undefined {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  return error.response?.status;
}

// ============================================================
// GET RETRY DELAY
// ============================================================

export function getRetryDelay(
  attempt: number,
  baseDelay = 1000,
  maximumDelay = 30000,
): number {
  if (!Number.isFinite(attempt) || attempt < 0) {
    return baseDelay;
  }

  const delay = Math.min(baseDelay * Math.pow(2, attempt), maximumDelay);

  // Add small jitter to avoid synchronized retries.
  const jitter = Math.random() * 250;

  return Math.round(delay + jitter);
}

// ============================================================
// ERROR SUMMARY
// ============================================================

export function getErrorSummary(error: AppError): string {
  const status = error.statusCode ? `HTTP ${error.statusCode}` : error.type;

  return `${status}: ${error.userMessage}`;
}

// ============================================================
// API ERROR HELPER
// ============================================================

export function createApiError(
  statusCode: number,
  message: string,
  errors?: FieldError[],
): AppError {
  const code = getErrorCodeFromStatus(statusCode);

  return createAppError({
    type: getErrorTypeFromStatus(statusCode),

    code,

    message,

    userMessage: ERROR_MESSAGES[code],

    statusCode,

    fieldErrors: errors,

    severity: statusCode >= 500 ? "HIGH" : "MEDIUM",

    isRetryable: statusCode === 408 || statusCode === 429 || statusCode >= 500,
  });
}

// ============================================================
// ERROR BOUNDARY FALLBACK MESSAGE
// ============================================================

export function getUnexpectedErrorMessage(): string {
  return (
    "The application encountered an unexpected problem. " +
    "Please try again or restart the application."
  );
}

// ============================================================
// EXPORT ERROR MESSAGE CONSTANTS
// ============================================================

export const APP_ERROR_MESSAGES = ERROR_MESSAGES;

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  createAppError,

  createApiError,

  normalizeError,

  handleError,

  logError,

  getErrorMessage,

  getErrorSeverity,

  canRetryRequest,

  getHttpStatusCode,

  getRetryDelay,

  getErrorSummary,

  isNetworkError,

  isTimeoutError,

  isCancelledRequest,

  isServerError,

  isAuthenticationError,

  isAuthorizationError,

  extractFieldErrors,

  getFieldError,
};
