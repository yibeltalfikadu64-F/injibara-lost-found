/**
 * Injibara Campus Lost & Found
 *
 * HTTP Exception Filter
 *
 * Express 5 centralized error-handling middleware.
 */

import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

// ======================================================
// 1. ERROR TYPES
// ======================================================

export interface HttpExceptionOptions {
  statusCode?: number;

  code?: string;

  details?: unknown;

  exposeMessage?: boolean;
}

// ======================================================
// 2. CUSTOM HTTP EXCEPTION
// ======================================================

export class HttpException extends Error {
  public readonly statusCode: number;

  public readonly code: string;

  public readonly details?: unknown;

  public readonly exposeMessage: boolean;

  constructor(message: string, options: HttpExceptionOptions = {}) {
    super(message);

    this.name = "HttpException";

    this.statusCode = options.statusCode ?? 500;

    this.code = options.code ?? "HTTP_ERROR";

    this.details = options.details;

    this.exposeMessage = options.exposeMessage ?? true;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ======================================================
// 3. COMMON HTTP EXCEPTIONS
// ======================================================

export class BadRequestException extends HttpException {
  constructor(message = "Bad request.", details?: unknown) {
    super(message, {
      statusCode: 400,
      code: "BAD_REQUEST",
      details,
    });
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "Authentication is required.") {
    super(message, {
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = "Access denied.") {
    super(message, {
      statusCode: 403,
      code: "FORBIDDEN",
    });
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Resource not found.") {
    super(message, {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Resource conflict.", details?: unknown) {
    super(message, {
      statusCode: 409,
      code: "CONFLICT",
      details,
    });
  }
}

export class PayloadTooLargeException extends HttpException {
  constructor(message = "Uploaded content is too large.") {
    super(message, {
      statusCode: 413,
      code: "PAYLOAD_TOO_LARGE",
    });
  }
}

export class UnsupportedMediaTypeException extends HttpException {
  constructor(message = "Unsupported media type.") {
    super(message, {
      statusCode: 415,
      code: "UNSUPPORTED_MEDIA_TYPE",
    });
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message = "Too many requests.") {
    super(message, {
      statusCode: 429,
      code: "TOO_MANY_REQUESTS",
    });
  }
}

// ======================================================
// 4. ERROR RESPONSE TYPE
// ======================================================

interface ErrorResponse {
  success: false;

  message: string;

  code: string;

  statusCode: number;

  path: string;

  method: string;

  timestamp: string;

  requestId?: string;

  details?: unknown;
}

// ======================================================
// 5. ENVIRONMENT
// ======================================================

const isProduction = process.env.NODE_ENV === "production";

// ======================================================
// 6. SAFE STATUS CODE
// ======================================================

function isValidStatusCode(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 400 &&
    value <= 599
  );
}

// ======================================================
// 7. UNKNOWN ERROR TYPE
// ======================================================

interface UnknownError {
  name?: string;

  message?: string;

  status?: number;

  statusCode?: number;

  code?: string;

  type?: string;

  details?: unknown;
}

// ======================================================
// 8. NORMALIZE UNKNOWN ERROR
// ======================================================

function normalizeUnknownError(error: unknown): UnknownError {
  if (typeof error === "object" && error !== null) {
    return error as UnknownError;
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

// ======================================================
// 9. PRISMA ERROR MAPPING
// ======================================================

function mapPrismaError(error: UnknownError): {
  statusCode: number;
  code: string;
  message: string;
} | null {
  const code = error.code;

  switch (code) {
    case "P2000":
      return {
        statusCode: 400,
        code: "DATABASE_VALUE_TOO_LONG",
        message: "One of the supplied values is too long.",
      };

    case "P2002":
      return {
        statusCode: 409,
        code: "DUPLICATE_RESOURCE",
        message: "A record with this information already exists.",
      };

    case "P2003":
      return {
        statusCode: 400,
        code: "INVALID_RELATION",
        message: "The supplied related resource is invalid.",
      };

    case "P2025":
      return {
        statusCode: 404,
        code: "RECORD_NOT_FOUND",
        message: "The requested record could not be found.",
      };

    case "P2014":
      return {
        statusCode: 409,
        code: "RELATION_CONSTRAINT",
        message: "This operation conflicts with related records.",
      };

    default:
      return null;
  }
}

// ======================================================
// 10. MAP COMMON ERRORS
// ======================================================

function mapCommonError(error: UnknownError): {
  statusCode: number;
  code: string;
  message: string;
} | null {
  // ----------------------------------------------
  // JWT errors
  // ----------------------------------------------

  if (error.name === "TokenExpiredError") {
    return {
      statusCode: 401,
      code: "TOKEN_EXPIRED",
      message: "Your access token has expired.",
    };
  }

  if (error.name === "JsonWebTokenError") {
    return {
      statusCode: 401,
      code: "INVALID_TOKEN",
      message: "Your access token is invalid.",
    };
  }

  // ----------------------------------------------
  // Multer upload errors
  // ----------------------------------------------

  if (error.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") {
      return {
        statusCode: 413,
        code: "FILE_TOO_LARGE",
        message: "The uploaded file exceeds the allowed size.",
      };
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return {
        statusCode: 400,
        code: "TOO_MANY_FILES",
        message: "Too many files were uploaded.",
      };
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return {
        statusCode: 400,
        code: "UNEXPECTED_FILE",
        message: "An unexpected file field was submitted.",
      };
    }

    return {
      statusCode: 400,
      code: "UPLOAD_ERROR",
      message: "The file upload could not be processed.",
    };
  }

  // ----------------------------------------------
  // Body parser errors
  // ----------------------------------------------

  if (error.type === "entity.too.large") {
    return {
      statusCode: 413,
      code: "PAYLOAD_TOO_LARGE",
      message: "The request body is too large.",
    };
  }

  if (error.type === "entity.parse.failed") {
    return {
      statusCode: 400,
      code: "INVALID_JSON",
      message: "The request body contains invalid JSON.",
    };
  }

  return null;
}

// ======================================================
// 11. BUILD ERROR RESPONSE
// ======================================================

function buildErrorResponse(
  request: Request,
  statusCode: number,
  message: string,
  code: string,
  details?: unknown,
): ErrorResponse {
  return {
    success: false,

    message,

    code,

    statusCode,

    path: request.originalUrl,

    method: request.method,

    timestamp: new Date().toISOString(),

    ...(request.requestId ? { requestId: request.requestId } : {}),

    ...(!isProduction && details !== undefined ? { details } : {}),
  };
}

// ======================================================
// 12. LOG SERVER ERROR
// ======================================================

function logServerError(
  error: unknown,
  request: Request,
  statusCode: number,
): void {
  if (statusCode < 500) {
    return;
  }

  console.error("\n========== SERVER ERROR ==========");

  console.error("Method:", request.method);

  console.error("Path:", request.originalUrl);

  console.error("Request ID:", request.requestId ?? "Unavailable");

  console.error("User ID:", request.user?.id ?? "Unauthenticated");

  console.error("Error:", error);

  console.error("==================================\n");
}

// ======================================================
// 13. CENTRAL ERROR HANDLER
// ======================================================

export const httpExceptionFilter: ErrorRequestHandler = (
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  if (response.headersSent) {
    return;
  }

  const normalized = normalizeUnknownError(error);

  let statusCode = 500;

  let code = "INTERNAL_SERVER_ERROR";

  let message = "An unexpected server error occurred.";

  let details: unknown;

  // ----------------------------------------------
  // Custom HTTP exceptions
  // ----------------------------------------------

  if (error instanceof HttpException) {
    statusCode = error.statusCode;

    code = error.code;

    message =
      !isProduction || error.exposeMessage
        ? error.message
        : "An unexpected server error occurred.";

    details = error.details;
  }

  // ----------------------------------------------
  // Authentication and authorization errors
  // ----------------------------------------------
  else if (
    normalized.name === "AuthenticationError" ||
    normalized.name === "UnauthenticatedError"
  ) {
    statusCode = 401;

    code = normalized.code ?? "UNAUTHENTICATED";

    message = normalized.message ?? "Authentication is required.";
  } else if (
    normalized.name === "AuthorizationError" ||
    normalized.name === "ForbiddenError"
  ) {
    statusCode = 403;

    code = normalized.code ?? "FORBIDDEN";

    message = normalized.message ?? "Access denied.";
  }

  // ----------------------------------------------
  // Prisma errors
  // ----------------------------------------------
  else {
    const prismaError = mapPrismaError(normalized);

    if (prismaError) {
      statusCode = prismaError.statusCode;
      code = prismaError.code;
      message = prismaError.message;
    } else {
      // -------------------------------------------
      // Common framework errors
      // -------------------------------------------

      const commonError = mapCommonError(normalized);

      if (commonError) {
        statusCode = commonError.statusCode;
        code = commonError.code;
        message = commonError.message;
      } else if (isValidStatusCode(normalized.statusCode)) {
        statusCode = normalized.statusCode;

        code = normalized.code ?? "HTTP_ERROR";

        message = normalized.message ?? "The request could not be completed.";
      } else if (isValidStatusCode(normalized.status)) {
        statusCode = normalized.status;

        code = normalized.code ?? "HTTP_ERROR";

        message = normalized.message ?? "The request could not be completed.";
      }
    }
  }

  // ----------------------------------------------
  // Hide server error details in production
  // ----------------------------------------------

  if (isProduction && statusCode >= 500) {
    message = "An unexpected server error occurred.";

    details = undefined;
  }

  // ----------------------------------------------
  // Log error
  // ----------------------------------------------

  logServerError(error, request, statusCode);

  // ----------------------------------------------
  // Send response
  // ----------------------------------------------

  const body = buildErrorResponse(request, statusCode, message, code, details);

  response.status(statusCode).json(body);
};

// ======================================================
// 14. NOT FOUND HELPER
// ======================================================

export function createNotFoundError(resource = "Resource"): NotFoundException {
  return new NotFoundException(`${resource} was not found.`);
}

// ======================================================
// 15. DEFAULT EXPORT
// ======================================================

export default httpExceptionFilter;
