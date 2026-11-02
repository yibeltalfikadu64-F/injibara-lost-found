
/**
 * Injibara Campus Lost & Found
 *
 * Main Express Application
 *
 * This file configures the complete Express application.
 */

// ======================================================
// 1. IMPORTS
// ======================================================

import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
  type ErrorRequestHandler,
} from 'express';

import helmet from 'helmet';

import cors from 'cors';

import rateLimit from 'express-rate-limit';

// ======================================================
// 2. TYPES
// ======================================================

interface ApiError extends Error {
  statusCode?: number;

  code?: string;

  details?: unknown;
}

interface ErrorResponse {
  success: false;

  message: string;

  code?: string;

  details?: unknown;
}

// ======================================================
// 3. ENVIRONMENT CONFIGURATION
// ======================================================

const NODE_ENV =
  process.env.NODE_ENV ?? 'development';

const API_PREFIX =
  process.env.API_PREFIX ?? '/api/v1';

const isProduction =
  NODE_ENV === 'production';

// ======================================================
// 4. VALIDATE API PREFIX
// ======================================================

function normalizeApiPrefix(
  prefix: string,
): string {
  const normalized = prefix.trim();

  if (!normalized.startsWith('/')) {
    throw new Error(
      'API_PREFIX must begin with "/".',
    );
  }

  if (normalized.endsWith('/')) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

const apiPrefix =
  normalizeApiPrefix(API_PREFIX);

// ======================================================
// 5. CREATE APPLICATION
// ======================================================

export function createApp(): Application {
  const app = express();

  // ----------------------------------------------------
  // 5.1 Disable Express fingerprinting
  // ----------------------------------------------------

  app.disable('x-powered-by');

  // ----------------------------------------------------
  // 5.2 Trust proxy
  // ----------------------------------------------------

  if (isProduction) {
    app.set('trust proxy', 1);
  }

  // ----------------------------------------------------
  // 5.3 Security headers
  // ----------------------------------------------------

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },

      contentSecurityPolicy: isProduction
        ? undefined
        : false,
    }),
  );

  // ----------------------------------------------------
  // 5.4 CORS configuration
  // ----------------------------------------------------

  const allowedOrigins = (
    process.env.CORS_ORIGIN ?? ''
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (
        origin,
        callback,
      ) => {
        // Native mobile clients may not send Origin.
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        // Development convenience when no origins
        // have been configured.
        if (
          !isProduction &&
          allowedOrigins.length === 0
        ) {
          callback(null, true);
          return;
        }

        callback(
          new Error(
            'Origin is not allowed by CORS policy.',
          ),
        );
      },

      credentials: true,

      methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
      ],

      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Request-ID',
      ],
    }),
  );

  // ----------------------------------------------------
  // 5.5 JSON request parsing
  // ----------------------------------------------------

  app.use(
    express.json({
      limit: '2mb',

      strict: true,
    }),
  );

  // ----------------------------------------------------
  // 5.6 URL encoded request parsing
  // ----------------------------------------------------

  app.use(
    express.urlencoded({
      extended: true,

      limit: '2mb',
    }),
  );

  // ----------------------------------------------------
  // 5.7 Basic request logging in development
  // ----------------------------------------------------

  if (!isProduction) {
    app.use(
      (
        request: Request,
        _response: Response,
        next: NextFunction,
      ) => {
        const timestamp =
          new Date().toISOString();

        console.log(
          `[${timestamp}] ${request.method} ${request.originalUrl}`,
        );

        next();
      },
    );
  }

  // ----------------------------------------------------
  // 5.8 General API rate limiter
  // ----------------------------------------------------

  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 300,

    standardHeaders: 'draft-8',

    legacyHeaders: false,

    message: {
      success: false,

      message:
        'Too many requests. Please try again later.',

      code: 'RATE_LIMIT_EXCEEDED',
    },
  });

  app.use(
    apiPrefix,
    generalLimiter,
  );

  // ----------------------------------------------------
  // 5.9 API health endpoint
  // ----------------------------------------------------

  app.get(
    '/health',
    (
      _request: Request,
      response: Response,
    ) => {
      response.status(200).json({
        success: true,

        message:
          'Injibara Campus Lost & Found API is running.',

        data: {
          application:
            'Injibara Campus Lost & Found',

          environment: NODE_ENV,

          status: 'healthy',

          timestamp: new Date().toISOString(),
        },
      });
    },
  );

  // ----------------------------------------------------
  // 5.10 API information endpoint
  // ----------------------------------------------------

  app.get(
    apiPrefix,
    (
      _request: Request,
      response: Response,
    ) => {
      response.status(200).json({
        success: true,

        message:
          'Welcome to Injibara Campus Lost & Found API.',

        data: {
          name:
            'Injibara Campus Lost & Found',

          version: '1.0.0',

          prefix: apiPrefix,

          environment: NODE_ENV,

          documentation:
            'API documentation has not yet been configured.',
        },
      });
    },
  );

  // ----------------------------------------------------
  // 5.11 Future feature routes
  // ----------------------------------------------------

  /**
   * Register actual route modules here after they
   * have been implemented.
   *
   * Examples:
   *
   * app.use(`${apiPrefix}/auth`, authRouter);
   * app.use(`${apiPrefix}/users`, userRouter);
   * app.use(`${apiPrefix}/items`, itemRouter);
   * app.use(`${apiPrefix}/claims`, claimRouter);
   * app.use(`${apiPrefix}/notifications`, notificationRouter);
   * app.use(`${apiPrefix}/admin`, adminRouter);
   *
   * Do not register undefined routers.
   */

  // ----------------------------------------------------
  // 5.12 404 handler
  // ----------------------------------------------------

  app.use(
    (
      request: Request,
      response: Response,
    ) => {
      response.status(404).json({
        success: false,

        message: 'API endpoint not found.',

        code: 'ROUTE_NOT_FOUND',

        path: request.originalUrl,
      });
    },
  );

  // ----------------------------------------------------
  // 5.13 Global error handler
  // ----------------------------------------------------

  const errorHandler: ErrorRequestHandler = (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    console.error(
      '[API ERROR]',
      error,
    );

    const apiError = error as ApiError;

    let statusCode =
      Number.isInteger(apiError.statusCode) &&
      apiError.statusCode! >= 400 &&
      apiError.statusCode! <= 599
        ? apiError.statusCode!
        : 500;

    let message =
      apiError.message ||
      'An unexpected server error occurred.';

    let code = apiError.code;

    // -----------------------------------------------
    // JSON body too large
    // -----------------------------------------------

    if (
      apiError.type === 'entity.too.large'
    ) {
      statusCode = 413;

      message =
        'Request body is too large.';

      code = 'PAYLOAD_TOO_LARGE';
    }

    // -----------------------------------------------
    // Invalid JSON
    // -----------------------------------------------

    if (
      apiError instanceof SyntaxError &&
      'body' in apiError
    ) {
      statusCode = 400;

      message =
        'Invalid JSON request body.';

      code = 'INVALID_JSON';
    }

    // -----------------------------------------------
    // CORS errors
    // -----------------------------------------------

    if (
      message ===
      'Origin is not allowed by CORS policy.'
    ) {
      statusCode = 403;

      message =
        'Your application origin is not permitted.';

      code = 'CORS_ORIGIN_DENIED';
    }

    // -----------------------------------------------
    // Hide internal server errors in production
    // -----------------------------------------------

    if (
      isProduction &&
      statusCode >= 500
    ) {
      message =
        'An unexpected server error occurred.';
    }

    const body: ErrorResponse = {
      success: false,

      message,

      ...(code ? { code } : {}),

      ...(
        !isProduction &&
        apiError.details !== undefined
          ? { details: apiError.details }
          : {}
      ),
    };

    if (response.headersSent) {
      return;
    }

    response.status(statusCode).json(body);
  };

  app.use(errorHandler);

  return app;
}

// ======================================================
// 6. DEFAULT EXPORT
// ======================================================

export default createApp;
