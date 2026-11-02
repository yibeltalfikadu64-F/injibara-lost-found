/**
 * Injibara Campus Lost & Found
 *
 * Validation Pipe
 *
 * Express middleware using Zod 4.
 *
 * Responsibilities:
 * - Validate request body.
 * - Validate query parameters.
 * - Validate URL parameters.
 * - Format validation errors.
 * - Store validated request data.
 */

import type { Request, Response, NextFunction, RequestHandler } from "express";

import { z, ZodError, type ZodType } from "zod";

// ======================================================
// 1. VALIDATION TARGET
// ======================================================

export type ValidationTarget = "body" | "query" | "params";

// ======================================================
// 2. VALIDATION ERROR FIELD
// ======================================================

export interface ValidationFieldError {
  field: string;

  message: string;

  code: string;
}

// ======================================================
// 3. VALIDATION RESULT
// ======================================================

export interface ValidationResult<T = unknown> {
  success: boolean;

  data?: T;

  errors?: ValidationFieldError[];
}

// ======================================================
// 4. EXPRESS REQUEST EXTENSION
// ======================================================

declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

// ======================================================
// 5. CUSTOM VALIDATION ERROR
// ======================================================

export class RequestValidationError extends Error {
  public readonly statusCode = 400;

  public readonly code = "VALIDATION_ERROR";

  public readonly errors: ValidationFieldError[];

  constructor(
    errors: ValidationFieldError[],
    message = "Request validation failed.",
  ) {
    super(message);

    this.name = "RequestValidationError";

    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ======================================================
// 6. VALIDATION OPTIONS
// ======================================================

export interface ValidationOptions {
  target?: ValidationTarget;

  abortEarly?: boolean;

  stripUnknown?: boolean;

  errorMessage?: string;

  includeDetails?: boolean;
}

// ======================================================
// 7. FORMAT ZOD PATH
// ======================================================

function formatZodPath(path: PropertyKey[]): string {
  if (path.length === 0) {
    return "request";
  }

  return path.map((part) => String(part)).join(".");
}

// ======================================================
// 8. FORMAT ZOD ERRORS
// ======================================================

export function formatValidationErrors(
  error: ZodError,
): ValidationFieldError[] {
  return error.issues.map((issue) => ({
    field: formatZodPath(issue.path),

    message: issue.message,

    code: issue.code,
  }));
}

// ======================================================
// 9. VALIDATE DATA DIRECTLY
// ======================================================

export function validateData<T>(
  schema: ZodType<T>,
  data: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,

      errors: formatValidationErrors(result.error),
    };
  }

  return {
    success: true,

    data: result.data,
  };
}

// ======================================================
// 10. GET REQUEST DATA
// ======================================================

function getRequestData(request: Request, target: ValidationTarget): unknown {
  switch (target) {
    case "body":
      return request.body;

    case "query":
      return request.query;

    case "params":
      return request.params;

    default:
      return undefined;
  }
}

// ======================================================
// 11. STORE VALIDATED DATA
// ======================================================

function storeValidatedData(
  request: Request,
  target: ValidationTarget,
  data: unknown,
): void {
  request.validated ??= {};

  request.validated[target] = data;
}

// ======================================================
// 12. CREATE VALIDATION MIDDLEWARE
// ======================================================

/**
 * Validates one part of an Express request.
 *
 * Example:
 *
 * router.post(
 *   '/items',
 *   validateRequest(createItemSchema),
 *   createItem,
 * );
 *
 * By default, the target is request.body.
 */

export function validateRequest<T>(
  schema: ZodType<T>,
  options: ValidationOptions = {},
): RequestHandler {
  const {
    target = "body",
    abortEarly = false,
    stripUnknown = false,
    errorMessage = "Please check the information you submitted.",
    includeDetails = true,
  } = options;

  // abortEarly is retained as an API option for
  // consistency. Zod safeParse collects its issues.
  void abortEarly;

  return (request: Request, _response: Response, next: NextFunction) => {
    try {
      const input = getRequestData(request, target);

      let dataToValidate = input;

      // ------------------------------------------
      // Optional object unknown-key handling
      // ------------------------------------------

      if (
        stripUnknown &&
        typeof input === "object" &&
        input !== null &&
        !Array.isArray(input) &&
        schema instanceof z.ZodObject
      ) {
        const allowedKeys = Object.keys(schema.shape);

        dataToValidate = Object.fromEntries(
          Object.entries(input).filter(([key]) => allowedKeys.includes(key)),
        );
      }

      // ------------------------------------------
      // Validate with Zod
      // ------------------------------------------

      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const errors = formatValidationErrors(result.error);

        next(new RequestValidationError(errors, errorMessage));

        return;
      }

      // ------------------------------------------
      // Save validated result
      // ------------------------------------------

      storeValidatedData(request, target, result.data);

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ======================================================
// 13. BODY VALIDATION
// ======================================================

export function validateBody<T>(
  schema: ZodType<T>,
  options: Omit<ValidationOptions, "target"> = {},
): RequestHandler {
  return validateRequest(schema, {
    ...options,
    target: "body",
  });
}

// ======================================================
// 14. QUERY VALIDATION
// ======================================================

export function validateQuery<T>(
  schema: ZodType<T>,
  options: Omit<ValidationOptions, "target"> = {},
): RequestHandler {
  return validateRequest(schema, {
    ...options,
    target: "query",
  });
}

// ======================================================
// 15. PARAMETER VALIDATION
// ======================================================

export function validateParams<T>(
  schema: ZodType<T>,
  options: Omit<ValidationOptions, "target"> = {},
): RequestHandler {
  return validateRequest(schema, {
    ...options,
    target: "params",
  });
}

// ======================================================
// 16. READ VALIDATED BODY
// ======================================================

export function getValidatedBody<T>(request: Request): T {
  const data = request.validated?.body;

  if (data === undefined) {
    throw new Error(
      "Validated request body is unavailable. Register validateBody before the controller.",
    );
  }

  return data as T;
}

// ======================================================
// 17. READ VALIDATED QUERY
// ======================================================

export function getValidatedQuery<T>(request: Request): T {
  const data = request.validated?.query;

  if (data === undefined) {
    throw new Error(
      "Validated query is unavailable. Register validateQuery before the controller.",
    );
  }

  return data as T;
}

// ======================================================
// 18. READ VALIDATED PARAMETERS
// ======================================================

export function getValidatedParams<T>(request: Request): T {
  const data = request.validated?.params;

  if (data === undefined) {
    throw new Error(
      "Validated parameters are unavailable. Register validateParams before the controller.",
    );
  }

  return data as T;
}

// ======================================================
// 19. REQUIRED STRING SCHEMA
// ======================================================

export const requiredStringSchema = z
  .string()
  .trim()
  .min(1, "This field is required.");

// ======================================================
// 20. EMAIL SCHEMA
// ======================================================

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(254, "Email address is too long.");

// ======================================================
// 21. PASSWORD SCHEMA
// ======================================================

export const passwordSchema = z
  .string()
  .min(12, "Password must contain at least 12 characters.")
  .max(128, "Password must not exceed 128 characters.");

// ======================================================
// 22. UUID SCHEMA
// ======================================================

export const uuidSchema = z.uuid({
  error: "A valid UUID is required.",
});

// ======================================================
// 23. PAGINATION SCHEMA
// ======================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().max(100).optional(),

  sortBy: z.string().trim().max(50).optional(),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ======================================================
// 24. REGISTRATION SCHEMA
// ======================================================

export const registerRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(100),

  email: emailSchema,

  password: passwordSchema,

  studentId: z.string().trim().min(2).max(50).optional(),

  department: z.string().trim().max(100).optional(),

  phone: z.string().trim().max(30).optional(),
});

// ======================================================
// 25. LOGIN SCHEMA
// ======================================================

export const loginRequestSchema = z.object({
  email: emailSchema,

  password: z.string().min(1, "Password is required.").max(128),
});

// ======================================================
// 26. LOST / FOUND ITEM SCHEMA
// ======================================================

export const createItemRequestSchema = z.object({
  title: z.string().trim().min(3).max(150),

  description: z.string().trim().min(10).max(5000),

  type: z.enum(["LOST", "FOUND"]),

  categoryId: uuidSchema.optional(),

  locationId: uuidSchema.optional(),

  dateOccurred: z.iso.datetime().optional(),

  color: z.string().trim().max(50).optional(),

  brand: z.string().trim().max(100).optional(),

  identifyingFeatures: z.string().trim().max(2000).optional(),

  imageUrls: z.array(z.string().url()).max(5).default([]),
});

// ======================================================
// 27. CLAIM SCHEMA
// ======================================================

export const createClaimRequestSchema = z.object({
  itemId: uuidSchema,

  description: z.string().trim().min(10).max(3000),

  proofAnswers: z.record(z.string(), z.unknown()).optional(),
});

// ======================================================
// 28. CLAIM REVIEW SCHEMA
// ======================================================

export const reviewClaimRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),

  reviewNote: z.string().trim().max(2000).optional(),
});

// ======================================================
// 29. USER UPDATE SCHEMA
// ======================================================

export const updateUserRequestSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),

  department: z.string().trim().max(100).optional(),

  phone: z.string().trim().max(30).optional(),

  avatarUrl: z.string().url().nullable().optional(),
});

// ======================================================
// 30. ITEM UPDATE SCHEMA
// ======================================================

export const updateItemRequestSchema = z.object({
  title: z.string().trim().min(3).max(150).optional(),

  description: z.string().trim().min(10).max(5000).optional(),

  color: z.string().trim().max(50).nullable().optional(),

  brand: z.string().trim().max(100).nullable().optional(),

  identifyingFeatures: z.string().trim().max(2000).nullable().optional(),

  categoryId: uuidSchema.nullable().optional(),

  locationId: uuidSchema.nullable().optional(),
});

// ======================================================
// 31. NOTIFICATION UPDATE SCHEMA
// ======================================================

export const notificationUpdateSchema = z.object({
  isRead: z.boolean(),
});

// ======================================================
// 32. ANNOUNCEMENT SCHEMA
// ======================================================

export const announcementRequestSchema = z.object({
  title: z.string().trim().min(3).max(200),

  content: z.string().trim().min(10).max(10000),

  isPublished: z.boolean().default(false),
});

// ======================================================
// 33. SEARCH QUERY SCHEMA
// ======================================================

export const itemSearchSchema = z.object({
  search: z.string().trim().max(100).optional(),

  type: z.enum(["LOST", "FOUND"]).optional(),

  status: z.enum(["OPEN", "CLAIMED", "RESOLVED", "ARCHIVED"]).optional(),

  categoryId: uuidSchema.optional(),

  locationId: uuidSchema.optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ======================================================
// 34. CHANGE PASSWORD SCHEMA
// ======================================================

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),

    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password.",

    path: ["newPassword"],
  });

// ======================================================
// 35. ID PARAMETER SCHEMA
// ======================================================

export const idParameterSchema = z.object({
  id: uuidSchema,
});

// ======================================================
// 36. DEFAULT EXPORT
// ======================================================

export default validateRequest;
