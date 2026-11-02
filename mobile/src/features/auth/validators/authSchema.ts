// mobile/src/features/auth/validators/authSchema.ts

/**
 * Injibara Campus Lost & Found
 * Authentication Validation Schemas
 *
 * Responsibilities:
 * - Validate email addresses
 * - Validate login credentials
 * - Validate registration details
 * - Validate passwords and password confirmation
 * - Validate phone numbers
 * - Validate student IDs
 * - Validate university departments
 * - Validate forgot-password requests
 * - Validate password reset requests
 * - Provide readable validation messages
 */

import { z } from "zod";

/* =========================================================
   1. VALIDATION CONSTANTS
========================================================= */

export const AUTH_VALIDATION = {
  FULL_NAME_MIN: 3,
  FULL_NAME_MAX: 80,

  EMAIL_MAX: 254,

  PASSWORD_MIN: 8,
  PASSWORD_MAX: 64,

  PHONE_MIN: 9,
  PHONE_MAX: 15,

  STUDENT_ID_MIN: 3,
  STUDENT_ID_MAX: 30,

  DEPARTMENT_MAX: 100,
} as const;

/**
 * University user roles.
 */
export const USER_ROLES = ["STUDENT", "STAFF", "SECURITY", "ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];

/**
 * Common validation messages.
 */
export const AUTH_MESSAGES = {
  REQUIRED: "This field is required.",

  INVALID_EMAIL: "Please enter a valid email address.",

  INVALID_PASSWORD: "Please enter a valid password.",

  PASSWORD_TOO_SHORT: `Password must contain at least ${AUTH_VALIDATION.PASSWORD_MIN} characters.`,

  PASSWORD_TOO_LONG: `Password cannot exceed ${AUTH_VALIDATION.PASSWORD_MAX} characters.`,

  PASSWORD_UPPERCASE: "Password must contain at least one uppercase letter.",

  PASSWORD_LOWERCASE: "Password must contain at least one lowercase letter.",

  PASSWORD_NUMBER: "Password must contain at least one number.",

  PASSWORD_SPECIAL: "Password must contain at least one special character.",

  PASSWORD_MISMATCH: "Passwords do not match.",

  INVALID_NAME: "Please enter your full name.",

  NAME_TOO_SHORT: `Name must contain at least ${AUTH_VALIDATION.FULL_NAME_MIN} characters.`,

  NAME_TOO_LONG: `Name cannot exceed ${AUTH_VALIDATION.FULL_NAME_MAX} characters.`,

  INVALID_PHONE: "Please enter a valid phone number.",

  INVALID_STUDENT_ID: "Please enter a valid student ID.",

  DEPARTMENT_REQUIRED: "Please select your department.",

  TERMS_REQUIRED: "You must accept the terms and conditions.",

  INVALID_ROLE: "Please select a valid account role.",
} as const;

/* =========================================================
   2. COMMON REGULAR EXPRESSIONS
========================================================= */

/**
 * Email validation.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Full name:
 * - Letters
 * - Spaces
 * - Hyphens
 * - Apostrophes
 *
 * Unicode letters are supported.
 */
export const FULL_NAME_REGEX = /^[\p{L}][\p{L}\p{M}\s'-]*$/u;

/**
 * Password must contain at least:
 * - One uppercase letter
 * - One lowercase letter
 * - One number
 */
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/;

/**
 * Phone number:
 * - Optional international +
 * - Digits
 * - Spaces
 * - Parentheses
 * - Hyphens
 */
export const PHONE_REGEX = /^\+?[0-9\s()-]+$/;

/**
 * Student ID:
 * - Letters
 * - Numbers
 * - Hyphens
 * - Underscores
 */
export const STUDENT_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

/* =========================================================
   3. BASIC VALIDATION HELPERS
========================================================= */

/**
 * Normalize email addresses.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalize full names.
 */
export function normalizeFullName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Normalize phone numbers.
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s()-]/g, "");
}

/**
 * Normalize student IDs.
 */
export function normalizeStudentId(studentId: string): string {
  return studentId.trim().toUpperCase();
}

/**
 * Check whether an email address is valid.
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(normalizeEmail(email));
}

/**
 * Check whether a password meets basic requirements.
 */
export function isValidPassword(password: string): boolean {
  return (
    password.length >= AUTH_VALIDATION.PASSWORD_MIN &&
    password.length <= AUTH_VALIDATION.PASSWORD_MAX &&
    PASSWORD_REGEX.test(password)
  );
}

/**
 * Check whether a full name is valid.
 */
export function isValidFullName(name: string): boolean {
  const normalized = normalizeFullName(name);

  return (
    normalized.length >= AUTH_VALIDATION.FULL_NAME_MIN &&
    normalized.length <= AUTH_VALIDATION.FULL_NAME_MAX &&
    FULL_NAME_REGEX.test(normalized)
  );
}

/**
 * Check whether a phone number is valid.
 *
 * International format is supported.
 * This is a format check, not proof that a number exists.
 */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);

  const digitsOnly = normalized.replace(/\D/g, "");

  return (
    PHONE_REGEX.test(phone.trim()) &&
    digitsOnly.length >= AUTH_VALIDATION.PHONE_MIN &&
    digitsOnly.length <= AUTH_VALIDATION.PHONE_MAX
  );
}

/**
 * Check whether a student ID is valid.
 */
export function isValidStudentId(studentId: string): boolean {
  const normalized = normalizeStudentId(studentId);

  return (
    normalized.length >= AUTH_VALIDATION.STUDENT_ID_MIN &&
    normalized.length <= AUTH_VALIDATION.STUDENT_ID_MAX &&
    STUDENT_ID_REGEX.test(normalized)
  );
}

/* =========================================================
   4. ZOD BASIC SCHEMAS
========================================================= */

/**
 * Email schema.
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, AUTH_MESSAGES.REQUIRED)
  .max(AUTH_VALIDATION.EMAIL_MAX, "Email address is too long.")
  .email(AUTH_MESSAGES.INVALID_EMAIL)
  .transform((email) => email.toLowerCase());

/**
 * Full name schema.
 */
export const fullNameSchema = z
  .string()
  .trim()
  .min(AUTH_VALIDATION.FULL_NAME_MIN, AUTH_MESSAGES.NAME_TOO_SHORT)
  .max(AUTH_VALIDATION.FULL_NAME_MAX, AUTH_MESSAGES.NAME_TOO_LONG)
  .refine((name) => FULL_NAME_REGEX.test(name), AUTH_MESSAGES.INVALID_NAME)
  .transform(normalizeFullName);

/**
 * Password schema.
 */
export const passwordSchema = z
  .string()
  .min(AUTH_VALIDATION.PASSWORD_MIN, AUTH_MESSAGES.PASSWORD_TOO_SHORT)
  .max(AUTH_VALIDATION.PASSWORD_MAX, AUTH_MESSAGES.PASSWORD_TOO_LONG)
  .refine(
    (password) => /[A-Z]/.test(password),
    AUTH_MESSAGES.PASSWORD_UPPERCASE,
  )
  .refine(
    (password) => /[a-z]/.test(password),
    AUTH_MESSAGES.PASSWORD_LOWERCASE,
  )
  .refine((password) => /\d/.test(password), AUTH_MESSAGES.PASSWORD_NUMBER);

/**
 * Optional phone schema.
 */
export const phoneSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((phone) => {
    if (!phone) {
      return undefined;
    }

    return normalizePhone(phone);
  })
  .refine(
    (phone) => phone === undefined || isValidPhone(phone),
    AUTH_MESSAGES.INVALID_PHONE,
  );

/**
 * Optional student ID schema.
 */
export const studentIdSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((studentId) => {
    if (!studentId) {
      return undefined;
    }

    return normalizeStudentId(studentId);
  })
  .refine(
    (studentId) => studentId === undefined || isValidStudentId(studentId),
    AUTH_MESSAGES.INVALID_STUDENT_ID,
  );

/**
 * Department schema.
 */
export const departmentSchema = z
  .string()
  .trim()
  .max(AUTH_VALIDATION.DEPARTMENT_MAX, "Department name is too long.");

/* =========================================================
   5. LOGIN VALIDATION
========================================================= */

export const loginSchema = z.object({
  email: emailSchema,

  /**
   * Do not trim passwords.
   * Spaces may be intentional password characters.
   */
  password: z
    .string()
    .min(1, AUTH_MESSAGES.REQUIRED)
    .max(AUTH_VALIDATION.PASSWORD_MAX, AUTH_MESSAGES.PASSWORD_TOO_LONG),

  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Validate login form.
 */
export function validateLogin(values: unknown) {
  return loginSchema.safeParse(values);
}

/* =========================================================
   6. REGISTRATION VALIDATION
========================================================= */

/**
 * Registration schema.
 *
 * The student ID and department are optional here because
 * your application supports both students and staff.
 *
 * Adjust these requirements if your university requires
 * student IDs for every student registration.
 */
export const registerSchema = z
  .object({
    fullName: fullNameSchema,

    email: emailSchema,

    phone: phoneSchema,

    studentId: studentIdSchema,

    department: departmentSchema.optional().or(z.literal("")),

    password: passwordSchema,

    confirmPassword: z.string().min(1, "Please confirm your password."),

    acceptTerms: z
      .boolean()
      .refine((accepted) => accepted === true, AUTH_MESSAGES.TERMS_REQUIRED),
  })
  .superRefine((values, context) => {
    /**
     * Confirm password.
     */
    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: AUTH_MESSAGES.PASSWORD_MISMATCH,
      });
    }

    /**
     * Validate optional student ID.
     */
    if (values.studentId && !isValidStudentId(values.studentId)) {
      context.addIssue({
        code: "custom",
        path: ["studentId"],
        message: AUTH_MESSAGES.INVALID_STUDENT_ID,
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Validate registration form.
 */
export function validateRegister(values: unknown) {
  return registerSchema.safeParse(values);
}

/* =========================================================
   7. PASSWORD VALIDATION
========================================================= */

/**
 * Password strength result.
 */
export interface PasswordStrength {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  color: string;

  hasMinimumLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialCharacter: boolean;

  isValid: boolean;
}

/**
 * Evaluate password strength for the registration screen.
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinimumLength = password.length >= AUTH_VALIDATION.PASSWORD_MIN;

  const hasUppercase = /[A-Z]/.test(password);

  const hasLowercase = /[a-z]/.test(password);

  const hasNumber = /\d/.test(password);

  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password);

  const checks = [
    hasMinimumLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialCharacter,
  ];

  const score = checks.filter(Boolean).length;

  let label: PasswordStrength["label"] = "Weak";

  let color = "#DC2626";

  if (score >= 5) {
    label = "Strong";
    color = "#16A34A";
  } else if (score >= 4) {
    label = "Good";
    color = "#2563EB";
  } else if (score >= 3) {
    label = "Fair";
    color = "#D97706";
  }

  const isValid =
    hasMinimumLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    password.length <= AUTH_VALIDATION.PASSWORD_MAX;

  return {
    score,
    label,
    color,

    hasMinimumLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialCharacter,

    isValid,
  };
}

/**
 * Get readable password requirements.
 */
export function getPasswordRequirements(password: string) {
  const strength = evaluatePasswordStrength(password);

  return [
    {
      id: "length",
      label: "At least 8 characters",
      passed: strength.hasMinimumLength,
    },
    {
      id: "uppercase",
      label: "At least one uppercase letter",
      passed: strength.hasUppercase,
    },
    {
      id: "lowercase",
      label: "At least one lowercase letter",
      passed: strength.hasLowercase,
    },
    {
      id: "number",
      label: "At least one number",
      passed: strength.hasNumber,
    },
    {
      id: "special",
      label: "At least one special character",
      passed: strength.hasSpecialCharacter,
    },
  ];
}

/**
 * Check password confirmation.
 */
export function passwordsMatch(
  password: string,
  confirmPassword: string,
): boolean {
  return password.length > 0 && password === confirmPassword;
}

/* =========================================================
   8. FORGOT PASSWORD VALIDATION
========================================================= */

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function validateForgotPassword(values: unknown) {
  return forgotPasswordSchema.safeParse(values);
}

/* =========================================================
   9. RESET PASSWORD VALIDATION
========================================================= */

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Password reset token is required."),

    password: passwordSchema,

    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: AUTH_MESSAGES.PASSWORD_MISMATCH,
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function validateResetPassword(values: unknown) {
  return resetPasswordSchema.safeParse(values);
}

/* =========================================================
   10. ROLE VALIDATION
========================================================= */

export const userRoleSchema = z.enum(USER_ROLES);

/**
 * Check whether a role is supported.
 */
export function isValidUserRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}

/* =========================================================
   11. VALIDATION ERROR HELPERS
========================================================= */

/**
 * Return the first validation error.
 */
export function getFirstValidationError(result: {
  success: boolean;
  error?: z.ZodError;
}): string | null {
  if (result.success || !result.error) {
    return null;
  }

  return result.error.issues[0]?.message ?? "Please check your information.";
}

/**
 * Convert Zod errors into a field-error object.
 *
 * Example:
 * {
 *   email: 'Please enter a valid email address.',
 *   password: 'Password is required.'
 * }
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path.map(String).join(".");

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

/**
 * Validate any schema and return readable errors.
 */
export function validateWithErrors<T>(
  schema: z.ZodType<T>,
  values: unknown,
):
  | {
      success: true;
      data: T;
      errors: Record<string, never>;
    }
  | {
      success: false;
      data: null;
      errors: Record<string, string>;
    } {
  const result = schema.safeParse(values);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: {},
    };
  }

  return {
    success: false,
    data: null,
    errors: getValidationErrors(result.error),
  };
}

/* =========================================================
   12. REACT HOOK FORM COMPATIBILITY
========================================================= */

/**
 * Export schemas for React Hook Form.
 *
 * Example:
 *
 * useForm({
 *   resolver: zodResolver(loginSchema),
 * });
 */

export const authSchemas = {
  login: loginSchema,
  register: registerSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  email: emailSchema,
  password: passwordSchema,
};

/* =========================================================
   13. DEFAULT EXPORT
========================================================= */

const authSchema = {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,

  emailSchema,
  fullNameSchema,
  passwordSchema,
  phoneSchema,
  studentIdSchema,
  departmentSchema,
  userRoleSchema,

  validateLogin,
  validateRegister,
  validateForgotPassword,
  validateResetPassword,

  evaluatePasswordStrength,
  getPasswordRequirements,
  passwordsMatch,

  normalizeEmail,
  normalizeFullName,
  normalizePhone,
  normalizeStudentId,

  isValidEmail,
  isValidPassword,
  isValidFullName,
  isValidPhone,
  isValidStudentId,
  isValidUserRole,

  getFirstValidationError,
  getValidationErrors,
  validateWithErrors,
};

export default authSchema;
