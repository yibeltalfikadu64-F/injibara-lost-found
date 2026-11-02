// mobile/src/utils/validators.ts

// ============================================================
// TYPES
// ============================================================

export interface ValidationResult {
  isValid: boolean;

  message: string;

  errors: Record<string, string>;
}

export interface FieldValidationResult {
  isValid: boolean;

  message: string;
}

export interface RegistrationFormData {
  firstName: string;

  lastName: string;

  email: string;

  password: string;

  confirmPassword: string;

  phoneNumber?: string;

  studentId?: string;

  department?: string;

  acceptTerms: boolean;
}

export interface LoginFormData {
  email: string;

  password: string;
}

export interface ItemFormData {
  title: string;

  description: string;

  categoryId: string;

  locationId: string;

  lostFoundDate: string;

  imageUris?: string[];
}

export interface ClaimFormData {
  itemId: string;

  reason: string;

  description?: string;
}

export interface PasswordValidationOptions {
  minLength?: number;

  requireUppercase?: boolean;

  requireLowercase?: boolean;

  requireNumber?: boolean;

  requireSpecialCharacter?: boolean;
}

// ============================================================
// REGEX CONSTANTS
// ============================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

const NAME_REGEX = /^[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)*$/u;

const STUDENT_ID_REGEX = /^[A-Za-z0-9][A-Za-z0-9/_-]{2,29}$/;

const USERNAME_REGEX = /^[A-Za-z0-9_]{3,30}$/;

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

// ============================================================
// REQUIRED FIELD
// ============================================================

export function validateRequired(
  value: unknown,
  fieldName = "This field",
): FieldValidationResult {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      message: `${fieldName} is required.`,
    };
  }

  if (typeof value === "string" && value.trim().length === 0) {
    return {
      isValid: false,
      message: `${fieldName} is required.`,
    };
  }

  if (Array.isArray(value) && value.length === 0) {
    return {
      isValid: false,
      message: `${fieldName} is required.`,
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// EMAIL VALIDATION
// ============================================================

export function validateEmail(email: string): FieldValidationResult {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return {
      isValid: false,
      message: "Email address is required.",
    };
  }

  if (normalizedEmail.length > 254) {
    return {
      isValid: false,
      message: "Email address is too long.",
    };
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return {
      isValid: false,
      message: "Enter a valid email address.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// PHONE NUMBER VALIDATION
// ============================================================

export function validatePhoneNumber(
  phoneNumber: string,
): FieldValidationResult {
  const phone = phoneNumber.trim();

  if (!phone) {
    return {
      isValid: false,
      message: "Phone number is required.",
    };
  }

  if (!PHONE_REGEX.test(phone)) {
    return {
      isValid: false,
      message: "Enter a valid phone number.",
    };
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) {
    return {
      isValid: false,
      message: "Phone number must contain 7–15 digits.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// OPTIONAL PHONE NUMBER VALIDATION
// ============================================================

export function validateOptionalPhoneNumber(
  phoneNumber?: string,
): FieldValidationResult {
  if (!phoneNumber?.trim()) {
    return {
      isValid: true,
      message: "",
    };
  }

  return validatePhoneNumber(phoneNumber);
}

// ============================================================
// NAME VALIDATION
// ============================================================

export function validateName(
  name: string,
  fieldName = "Name",
): FieldValidationResult {
  const value = name.trim();

  if (!value) {
    return {
      isValid: false,
      message: `${fieldName} is required.`,
    };
  }

  if (value.length < 2) {
    return {
      isValid: false,
      message: `${fieldName} must contain at least 2 characters.`,
    };
  }

  if (value.length > 60) {
    return {
      isValid: false,
      message: `${fieldName} cannot exceed 60 characters.`,
    };
  }

  if (!NAME_REGEX.test(value)) {
    return {
      isValid: false,
      message: `${fieldName} contains invalid characters.`,
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// PASSWORD VALIDATION
// ============================================================

export function validatePassword(
  password: string,
  options: PasswordValidationOptions = {},
): FieldValidationResult {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialCharacter = true,
  } = options;

  if (!password) {
    return {
      isValid: false,
      message: "Password is required.",
    };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must contain at least ${minLength} characters.`,
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      message: "Password cannot exceed 128 characters.",
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter.",
    };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter.",
    };
  }

  if (requireNumber && !/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number.",
    };
  }

  if (requireSpecialCharacter && !/[^A-Za-z0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one special character.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// CONFIRM PASSWORD
// ============================================================

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): FieldValidationResult {
  if (!confirmPassword) {
    return {
      isValid: false,
      message: "Please confirm your password.",
    };
  }

  if (password !== confirmPassword) {
    return {
      isValid: false,
      message: "Passwords do not match.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// PASSWORD STRENGTH
// ============================================================

export function getPasswordStrength(password: string): {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  percentage: number;
} {
  const checks = [
    password.length >= 8,
    password.length >= 12,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const score = checks.filter(Boolean).length;

  let label: "Weak" | "Fair" | "Good" | "Strong";

  if (score <= 2) {
    label = "Weak";
  } else if (score <= 3) {
    label = "Fair";
  } else if (score <= 4) {
    label = "Good";
  } else {
    label = "Strong";
  }

  return {
    score,
    label,
    percentage: Math.round((score / checks.length) * 100),
  };
}

// ============================================================
// STUDENT ID VALIDATION
// ============================================================

export function validateStudentId(studentId: string): FieldValidationResult {
  const value = studentId.trim();

  if (!value) {
    return {
      isValid: false,
      message: "Student ID is required.",
    };
  }

  if (!STUDENT_ID_REGEX.test(value)) {
    return {
      isValid: false,
      message: "Enter a valid student ID.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// USERNAME VALIDATION
// ============================================================

export function validateUsername(username: string): FieldValidationResult {
  const value = username.trim();

  if (!value) {
    return {
      isValid: false,
      message: "Username is required.",
    };
  }

  if (!USERNAME_REGEX.test(value)) {
    return {
      isValid: false,
      message: "Username must contain 3–30 letters, numbers, or underscores.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// ITEM TITLE VALIDATION
// ============================================================

export function validateItemTitle(title: string): FieldValidationResult {
  const value = title.trim();

  if (!value) {
    return {
      isValid: false,
      message: "Item title is required.",
    };
  }

  if (value.length < 3) {
    return {
      isValid: false,
      message: "Item title must contain at least 3 characters.",
    };
  }

  if (value.length > 100) {
    return {
      isValid: false,
      message: "Item title cannot exceed 100 characters.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// ITEM DESCRIPTION VALIDATION
// ============================================================

export function validateItemDescription(
  description: string,
): FieldValidationResult {
  const value = description.trim();

  if (!value) {
    return {
      isValid: false,
      message: "Item description is required.",
    };
  }

  if (value.length < 10) {
    return {
      isValid: false,
      message: "Description must contain at least 10 characters.",
    };
  }

  if (value.length > 3000) {
    return {
      isValid: false,
      message: "Description cannot exceed 3000 characters.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// CLAIM REASON VALIDATION
// ============================================================

export function validateClaimReason(reason: string): FieldValidationResult {
  const value = reason.trim();

  if (!value) {
    return {
      isValid: false,
      message: "Claim reason is required.",
    };
  }

  if (value.length < 10) {
    return {
      isValid: false,
      message: "Please provide at least 10 characters explaining your claim.",
    };
  }

  if (value.length > 2000) {
    return {
      isValid: false,
      message: "Claim reason cannot exceed 2000 characters.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// URL VALIDATION
// ============================================================

export function validateUrl(url: string): FieldValidationResult {
  const value = url.trim();

  if (!value) {
    return {
      isValid: false,
      message: "URL is required.",
    };
  }

  if (!URL_REGEX.test(value)) {
    return {
      isValid: false,
      message: "Enter a valid HTTP or HTTPS URL.",
    };
  }

  try {
    const parsed = new URL(value);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        isValid: false,
        message: "Only HTTP and HTTPS URLs are allowed.",
      };
    }
  } catch {
    return {
      isValid: false,
      message: "Enter a valid URL.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// DATE VALIDATION
// ============================================================

export function validateDate(value: string): FieldValidationResult {
  if (!value.trim()) {
    return {
      isValid: false,
      message: "Date is required.",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      isValid: false,
      message: "Enter a valid date.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// DATE NOT IN FUTURE
// ============================================================

export function validateDateNotInFuture(value: string): FieldValidationResult {
  const result = validateDate(value);

  if (!result.isValid) {
    return result;
  }

  const date = new Date(value);

  if (date.getTime() > Date.now()) {
    return {
      isValid: false,
      message: "Date cannot be in the future.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// DATE RANGE VALIDATION
// ============================================================

export function validateDateRange(
  startDate: string,
  endDate: string,
): FieldValidationResult {
  const start = new Date(startDate);

  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return {
      isValid: false,
      message: "Enter valid start and end dates.",
    };
  }

  if (start.getTime() > end.getTime()) {
    return {
      isValid: false,
      message: "Start date cannot be later than end date.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// IMAGE COUNT VALIDATION
// ============================================================

export function validateImageCount(
  images: string[],
  maximum = 5,
): FieldValidationResult {
  if (images.length > maximum) {
    return {
      isValid: false,
      message: `You can upload a maximum of ${maximum} images.`,
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// IMAGE URI VALIDATION
// ============================================================

export function validateImageUri(uri: string): FieldValidationResult {
  if (!uri.trim()) {
    return {
      isValid: false,
      message: "Image is required.",
    };
  }

  const allowedProtocols = ["file:", "content:", "ph:", "https:", "http:"];

  try {
    const parsed = new URL(uri);

    if (!allowedProtocols.includes(parsed.protocol)) {
      return {
        isValid: false,
        message: "Unsupported image URI.",
      };
    }
  } catch {
    // React Native local URIs can vary by platform.
    // Validate non-empty values here and verify the
    // actual file when uploading.
    if (
      !uri.startsWith("/") &&
      !uri.startsWith("file://") &&
      !uri.startsWith("content://")
    ) {
      return {
        isValid: false,
        message: "Invalid image URI.",
      };
    }
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// TERMS ACCEPTANCE
// ============================================================

export function validateTermsAcceptance(
  accepted: boolean,
): FieldValidationResult {
  if (!accepted) {
    return {
      isValid: false,
      message: "You must accept the terms and conditions.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// LOGIN FORM VALIDATION
// ============================================================

export function validateLoginForm(data: LoginFormData): ValidationResult {
  const errors: Record<string, string> = {};

  const email = validateEmail(data.email);

  const password = validateRequired(data.password, "Password");

  if (!email.isValid) {
    errors.email = email.message;
  }

  if (!password.isValid) {
    errors.password = password.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,

    message:
      Object.keys(errors).length === 0
        ? "Login form is valid."
        : "Please correct the highlighted fields.",

    errors,
  };
}

// ============================================================
// REGISTRATION FORM VALIDATION
// ============================================================

export function validateRegistrationForm(
  data: RegistrationFormData,
): ValidationResult {
  const errors: Record<string, string> = {};

  const firstName = validateName(data.firstName, "First name");

  const lastName = validateName(data.lastName, "Last name");

  const email = validateEmail(data.email);

  const password = validatePassword(data.password);

  const confirmPassword = validateConfirmPassword(
    data.password,
    data.confirmPassword,
  );

  const phone = validateOptionalPhoneNumber(data.phoneNumber);

  if (!firstName.isValid) {
    errors.firstName = firstName.message;
  }

  if (!lastName.isValid) {
    errors.lastName = lastName.message;
  }

  if (!email.isValid) {
    errors.email = email.message;
  }

  if (!password.isValid) {
    errors.password = password.message;
  }

  if (!confirmPassword.isValid) {
    errors.confirmPassword = confirmPassword.message;
  }

  if (!phone.isValid) {
    errors.phoneNumber = phone.message;
  }

  if (data.studentId && !validateStudentId(data.studentId).isValid) {
    errors.studentId = validateStudentId(data.studentId).message;
  }

  if (!data.department?.trim()) {
    errors.department = "Department is required.";
  }

  if (!data.acceptTerms) {
    errors.acceptTerms = "You must accept the terms and conditions.";
  }

  return {
    isValid: Object.keys(errors).length === 0,

    message:
      Object.keys(errors).length === 0
        ? "Registration form is valid."
        : "Please correct the highlighted fields.",

    errors,
  };
}

// ============================================================
// ITEM FORM VALIDATION
// ============================================================

export function validateItemForm(data: ItemFormData): ValidationResult {
  const errors: Record<string, string> = {};

  const title = validateItemTitle(data.title);

  const description = validateItemDescription(data.description);

  if (!title.isValid) {
    errors.title = title.message;
  }

  if (!description.isValid) {
    errors.description = description.message;
  }

  if (!data.categoryId.trim()) {
    errors.categoryId = "Select an item category.";
  }

  if (!data.locationId.trim()) {
    errors.locationId = "Select an item location.";
  }

  const date = validateDateNotInFuture(data.lostFoundDate);

  if (!date.isValid) {
    errors.lostFoundDate = date.message;
  }

  if (data.imageUris) {
    const imageCount = validateImageCount(data.imageUris, 5);

    if (!imageCount.isValid) {
      errors.images = imageCount.message;
    }

    const invalidImage = data.imageUris.find(
      (uri) => !validateImageUri(uri).isValid,
    );

    if (invalidImage) {
      errors.images = "One or more image URIs are invalid.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,

    message:
      Object.keys(errors).length === 0
        ? "Item form is valid."
        : "Please correct the highlighted fields.",

    errors,
  };
}

// ============================================================
// CLAIM FORM VALIDATION
// ============================================================

export function validateClaimForm(data: ClaimFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.itemId.trim()) {
    errors.itemId = "Item is required.";
  }

  const reason = validateClaimReason(data.reason);

  if (!reason.isValid) {
    errors.reason = reason.message;
  }

  if (data.description && data.description.length > 2000) {
    errors.description = "Description cannot exceed 2000 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,

    message:
      Object.keys(errors).length === 0
        ? "Claim form is valid."
        : "Please correct the highlighted fields.",

    errors,
  };
}

// ============================================================
// GENERIC FORM VALIDATION
// ============================================================

export function validateForm(
  validations: Record<string, FieldValidationResult>,
): ValidationResult {
  const errors: Record<string, string> = {};

  Object.entries(validations).forEach(([field, result]) => {
    if (!result.isValid) {
      errors[field] = result.message;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,

    message:
      Object.keys(errors).length === 0
        ? "Form is valid."
        : "Please correct the highlighted fields.",

    errors,
  };
}

// ============================================================
// TYPE GUARD
// ============================================================

export function hasValidationErrors(result: ValidationResult): boolean {
  return Object.keys(result.errors).length > 0;
}

// ============================================================
// EXPORT REGEX CONSTANTS
// ============================================================

export const VALIDATION_PATTERNS = {
  EMAIL: EMAIL_REGEX,

  PHONE: PHONE_REGEX,

  NAME: NAME_REGEX,

  STUDENT_ID: STUDENT_ID_REGEX,

  USERNAME: USERNAME_REGEX,

  URL: URL_REGEX,
} as const;
