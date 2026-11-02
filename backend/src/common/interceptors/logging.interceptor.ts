
/**
 * Injibara Campus Lost & Found
 *
 * Request Logging Interceptor
 *
 * Express middleware for request and response logging.
 *
 * Security:
 * - Never logs passwords.
 * - Never logs authorization headers.
 * - Never logs JWT tokens.
 * - Never logs uploaded file contents.
 */

import {
  randomUUID,
} from 'node:crypto';

import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';

// ======================================================
// 1. CONFIGURATION
// ======================================================

export interface LoggingOptions {
  enabled?: boolean;

  logRequests?: boolean;

  logResponses?: boolean;

  logErrors?: boolean;

  slowRequestThresholdMs?: number;

  ignoredPaths?: string[];

  includeUserAgent?: boolean;

  includeIpAddress?: boolean;
}

// ======================================================
// 2. LOG ENTRY
// ======================================================

export interface RequestLogEntry {
  requestId: string;

  method: string;

  path: string;

  statusCode?: number;

  durationMs?: number;

  userId?: string;

  ipAddress?: string;

  userAgent?: string;

  timestamp: string;

  level: 'INFO' | 'WARN' | 'ERROR';
}

// ======================================================
// 3. DEFAULT SETTINGS
// ======================================================

const DEFAULT_OPTIONS: Required<LoggingOptions> = {
  enabled: true,

  logRequests: true,

  logResponses: true,

  logErrors: true,

  slowRequestThresholdMs: 3000,

  ignoredPaths: [
    '/favicon.ico',
  ],

  includeUserAgent: true,

  includeIpAddress: true,
};

// ======================================================
// 4. ENVIRONMENT
// ======================================================

const isProduction =
  process.env.NODE_ENV === 'production';

// ======================================================
// 5. NORMALIZE OPTIONS
// ======================================================

function normalizeOptions(
  options: LoggingOptions = {},
): Required<LoggingOptions> {
  return {
    ...DEFAULT_OPTIONS,
    ...options,
  };
}

// ======================================================
// 6. SAFE REQUEST PATH
// ======================================================

/**
 * Excludes query strings to avoid accidentally logging
 * sensitive query parameters.
 */

function getSafeRequestPath(
  request: Request,
): string {
  return request.path;
}

// ======================================================
// 7. GET CLIENT IP
// ======================================================

function getClientIp(
  request: Request,
): string | undefined {
  const ip = request.ip;

  if (!ip) {
    return undefined;
  }

  return ip.replace(/^::ffff:/, '');
}

// ======================================================
// 8. GET USER AGENT
// ======================================================

function getUserAgent(
  request: Request,
): string | undefined {
  const value =
    request.headers['user-agent'];

  if (typeof value !== 'string') {
    return undefined;
  }

  return value.slice(0, 300);
}

// ======================================================
// 9. GET REQUEST ID
// ======================================================

function getRequestId(
  request: Request,
): string {
  const incomingId =
    request.headers['x-request-id'];

  if (
    typeof incomingId === 'string' &&
    /^[a-zA-Z0-9._-]{1,100}$/.test(incomingId)
  ) {
    return incomingId;
  }

  return randomUUID();
}

// ======================================================
// 10. LOG LEVEL
// ======================================================

function getLogLevel(
  statusCode: number,
  durationMs: number,
  threshold: number,
): RequestLogEntry['level'] {
  if (statusCode >= 500) {
    return 'ERROR';
  }

  if (
    statusCode >= 400 ||
    durationMs >= threshold
  ) {
    return 'WARN';
  }

  return 'INFO';
}

// ======================================================
// 11. FORMAT LOG ENTRY
// ======================================================

function createLogEntry(
  request: Request,
  statusCode: number,
  durationMs: number,
  options: Required<LoggingOptions>,
): RequestLogEntry {
  const level = getLogLevel(
    statusCode,
    durationMs,
    options.slowRequestThresholdMs,
  );

  return {
    requestId:
      request.requestId ?? randomUUID(),

    method: request.method,

    path: getSafeRequestPath(request),

    statusCode,

    durationMs,

    ...(request.user?.id
      ? { userId: request.user.id }
      : {}),

    ...(options.includeIpAddress
      ? {
          ipAddress: getClientIp(request),
        }
      : {}),

    ...(options.includeUserAgent
      ? {
          userAgent: getUserAgent(request),
        }
      : {}),

    timestamp: new Date().toISOString(),

    level,
  };
}

// ======================================================
// 12. OUTPUT LOGGER
// ======================================================

function outputLog(
  entry: RequestLogEntry,
): void {
  const prefix = `[${entry.level}]`;

  const message = {
    ...entry,
  };

  if (entry.level === 'ERROR') {
    console.error(prefix, message);
    return;
  }

  if (entry.level === 'WARN') {
    console.warn(prefix, message);
    return;
  }

  console.info(prefix, message);
}

// ======================================================
// 13. SKIP IGNORED PATHS
// ======================================================

function shouldSkipLogging(
  request: Request,
  ignoredPaths: string[],
): boolean {
  return ignoredPaths.some(
    (path) =>
      request.path === path ||
      request.path.startsWith(`${path}/`),
  );
}

// ======================================================
// 14. REQUEST LOGGING MIDDLEWARE
// ======================================================

export function createLoggingInterceptor(
  options: LoggingOptions = {},
): RequestHandler {
  const settings =
    normalizeOptions(options);

  return (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    if (!settings.enabled) {
      next();
      return;
    }

    if (
      shouldSkipLogging(
        request,
        settings.ignoredPaths,
      )
    ) {
      next();
      return;
    }

    const startedAt = process.hrtime.bigint();

    const requestId =
      getRequestId(request);

    request.requestId = requestId;

    response.setHeader(
      'X-Request-ID',
      requestId,
    );

    // --------------------------------------------
    // Incoming request
    // --------------------------------------------

    if (settings.logRequests) {
      const requestLog = {
        requestId,

        method: request.method,

        path: getSafeRequestPath(request),

        timestamp: new Date().toISOString(),

        ...(request.user?.id
          ? { userId: request.user.id }
          : {}),
      };

      console.info(
        '[HTTP REQUEST]',
        requestLog,
      );
    }

    // --------------------------------------------
    // Response completion
    // --------------------------------------------

    let logged = false;

    const finishLogging = (): void => {
      if (logged) {
        return;
      }

      logged = true;

      const finishedAt =
        process.hrtime.bigint();

      const durationMs = Number(
        finishedAt - startedAt,
      ) / 1_000_000;

      const entry = createLogEntry(
        request,
        response.statusCode,
        Math.round(durationMs * 100) / 100,
        settings,
      );

      if (
        settings.logErrors &&
        response.statusCode >= 400
      ) {
        outputLog(entry);
        return;
      }

      if (settings.logResponses) {
        outputLog(entry);
      }
    };

    response.once(
      'finish',
      finishLogging,
    );

    response.once(
      'close',
      finishLogging,
    );

    next();
  };
}

// ======================================================
// 15. DEFAULT LOGGING INTERCEPTOR
// ======================================================

export const loggingInterceptor =
  createLoggingInterceptor();

// ======================================================
// 16. DEVELOPMENT LOGGING
// ======================================================

export const developmentLoggingInterceptor =
  createLoggingInterceptor({
    enabled: !isProduction,

    logRequests: true,

    logResponses: true,

    logErrors: true,

    slowRequestThresholdMs: 2000,
  });

// ======================================================
// 17. PRODUCTION LOGGING
// ======================================================

export const productionLoggingInterceptor =
  createLoggingInterceptor({
    enabled: isProduction,

    logRequests: true,

    logResponses: true,

    logErrors: true,

    slowRequestThresholdMs: 3000,

    includeUserAgent: false,
  });

// ======================================================
// 18. HEALTH CHECK LOGGING
// ======================================================

export const apiLoggingInterceptor =
  createLoggingInterceptor({
    ignoredPaths: [
      '/favicon.ico',
      '/health',
    ],
  });

// ======================================================
// 19. MANUAL LOGGING HELPER
// ======================================================

export function logApplicationEvent(
  event: string,
  details?: Record<string, unknown>,
): void {
  console.info(
    '[APPLICATION EVENT]',
    {
      event,

      timestamp: new Date().toISOString(),

      ...(details ?? {}),
    },
  );
}

// ======================================================
// 20. DEFAULT EXPORT
// ======================================================

export default loggingInterceptor;
