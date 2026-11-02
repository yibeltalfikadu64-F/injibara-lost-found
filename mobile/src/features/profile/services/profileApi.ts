// mobile/src/features/profile/services/profileApi.ts

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

// ------------------------------------------------------
// Types
// ------------------------------------------------------

export type UserRole = "STUDENT" | "STAFF" | "SECURITY" | "ADMIN";

export type AccountStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  studentId?: string | null;
  employeeId?: string | null;
  department?: string | null;
  faculty?: string | null;
  role: UserRole | string;
  bio?: string | null;
  avatarUrl?: string | null;
  accountStatus?: AccountStatus | string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  studentId?: string;
  employeeId?: string;
  department?: string;
  faculty?: string;
  bio?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileApiError {
  message: string;
  status?: number;
  code?: string;
}

// ------------------------------------------------------
// Request configuration
// ------------------------------------------------------

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT";
  token?: string | null;
  body?: unknown;
  signal?: AbortSignal;
}

// ------------------------------------------------------
// Error handling
// ------------------------------------------------------

function getErrorMessage(data: unknown): string {
  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    if (typeof record.message === "string") {
      return record.message;
    }

    if (typeof record.error === "string") {
      return record.error;
    }

    if (Array.isArray(record.errors)) {
      return record.errors
        .map((error) => {
          if (typeof error === "string") {
            return error;
          }

          if (error && typeof error === "object" && "message" in error) {
            return String(error.message);
          }

          return "";
        })
        .filter(Boolean)
        .join("\n");
    }
  }

  return "An unexpected error occurred. Please try again.";
}

// ------------------------------------------------------
// API request helper
// ------------------------------------------------------

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let body: string | undefined;

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method ?? "GET",
      headers,
      body,
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw {
      message:
        "Unable to connect to the server. Please check your internet connection.",
      code: "NETWORK_ERROR",
    } satisfies ProfileApiError;
  }

  const responseText = await response.text();

  let responseData: unknown = null;

  if (responseText.trim()) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    throw {
      message: getErrorMessage(responseData),
      status: response.status,
      code: "REQUEST_FAILED",
    } satisfies ProfileApiError;
  }

  return responseData as T;
}

// ------------------------------------------------------
// Response helpers
// ------------------------------------------------------

function unwrapResponse(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;

  if (record.data !== undefined) {
    return record.data;
  }

  return value;
}

function normalizeProfile(value: unknown): UserProfile {
  const unwrapped = unwrapResponse(value);

  const outer = (unwrapped ?? {}) as Record<string, unknown>;

  // Support both { user: {...} } and direct user objects.
  const record =
    outer.user && typeof outer.user === "object"
      ? (outer.user as Record<string, unknown>)
      : outer;

  const firstName = String(record.firstName ?? record.first_name ?? "");

  const lastName = String(record.lastName ?? record.last_name ?? "");

  return {
    id: String(record.id ?? record._id ?? ""),
    firstName,
    lastName,
    email: String(record.email ?? ""),
    phoneNumber:
      record.phoneNumber != null
        ? String(record.phoneNumber)
        : record.phone != null
          ? String(record.phone)
          : null,
    studentId: record.studentId != null ? String(record.studentId) : null,
    employeeId: record.employeeId != null ? String(record.employeeId) : null,
    department: record.department != null ? String(record.department) : null,
    faculty: record.faculty != null ? String(record.faculty) : null,
    role: String(record.role ?? "STUDENT"),
    bio: record.bio != null ? String(record.bio) : null,
    avatarUrl:
      record.avatarUrl != null
        ? String(record.avatarUrl)
        : record.profileImage != null
          ? String(record.profileImage)
          : null,
    accountStatus: record.accountStatus
      ? String(record.accountStatus)
      : "ACTIVE",
    emailVerified: Boolean(record.emailVerified ?? false),
    phoneVerified: Boolean(record.phoneVerified ?? false),
    createdAt: record.createdAt ? String(record.createdAt) : undefined,
    updatedAt: record.updatedAt ? String(record.updatedAt) : undefined,
  };
}

// ------------------------------------------------------
// Validation
// ------------------------------------------------------

export function validateProfile(
  payload: UpdateProfilePayload,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();

  if (!firstName) {
    errors.firstName = "First name is required.";
  } else if (firstName.length < 2) {
    errors.firstName = "First name must contain at least 2 characters.";
  } else if (firstName.length > 50) {
    errors.firstName = "First name cannot exceed 50 characters.";
  }

  if (!lastName) {
    errors.lastName = "Last name is required.";
  } else if (lastName.length < 2) {
    errors.lastName = "Last name must contain at least 2 characters.";
  } else if (lastName.length > 50) {
    errors.lastName = "Last name cannot exceed 50 characters.";
  }

  const phone = payload.phoneNumber?.trim();

  if (phone && !/^[+]?[\d\s()-]{7,20}$/.test(phone)) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  if ((payload.bio?.length ?? 0) > 300) {
    errors.bio = "Bio cannot exceed 300 characters.";
  }

  if ((payload.department?.length ?? 0) > 100) {
    errors.department = "Department cannot exceed 100 characters.";
  }

  return errors;
}

export function validatePasswordChange(
  payload: ChangePasswordPayload,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!payload.currentPassword) {
    errors.currentPassword = "Current password is required.";
  }

  if (!payload.newPassword) {
    errors.newPassword = "New password is required.";
  } else if (payload.newPassword.length < 8) {
    errors.newPassword = "Password must contain at least 8 characters.";
  }

  if (!payload.confirmPassword) {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (payload.confirmPassword !== payload.newPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (
    payload.currentPassword &&
    payload.currentPassword === payload.newPassword
  ) {
    errors.newPassword =
      "New password must be different from the current password.";
  }

  return errors;
}

// ------------------------------------------------------
// Profile API
// ------------------------------------------------------

const profileApi = {
  /**
   * Retrieve the currently authenticated user's profile.
   */
  async getMyProfile(
    token: string,
    signal?: AbortSignal,
  ): Promise<UserProfile> {
    const response = await apiRequest<unknown>("/users/me", {
      token,
      signal,
    });

    return normalizeProfile(response);
  },

  /**
   * Retrieve a profile by user ID.
   * Use this only when the backend authorizes the request.
   */
  async getProfileById(userId: string, token: string): Promise<UserProfile> {
    if (!userId.trim()) {
      throw new Error("User ID is required.");
    }

    const response = await apiRequest<unknown>(
      `/users/${encodeURIComponent(userId)}`,
      { token },
    );

    return normalizeProfile(response);
  },

  /**
   * Update the authenticated user's profile.
   */
  async updateMyProfile(
    payload: UpdateProfilePayload,
    token: string,
  ): Promise<UserProfile> {
    const errors = validateProfile(payload);

    if (Object.keys(errors).length > 0) {
      throw {
        message: Object.values(errors).join("\n"),
        code: "VALIDATION_ERROR",
      } satisfies ProfileApiError;
    }

    const cleanedPayload: UpdateProfilePayload = {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      phoneNumber: payload.phoneNumber?.trim() || undefined,
      studentId: payload.studentId?.trim() || undefined,
      employeeId: payload.employeeId?.trim() || undefined,
      department: payload.department?.trim() || undefined,
      faculty: payload.faculty?.trim() || undefined,
      bio: payload.bio?.trim() || undefined,
    };

    const response = await apiRequest<unknown>("/users/me", {
      method: "PATCH",
      token,
      body: cleanedPayload,
    });

    return normalizeProfile(response);
  },

  /**
   * Change the authenticated user's password.
   * The backend must implement this endpoint.
   */
  async changePassword(
    payload: ChangePasswordPayload,
    token: string,
  ): Promise<void> {
    const errors = validatePasswordChange(payload);

    if (Object.keys(errors).length > 0) {
      throw {
        message: Object.values(errors).join("\n"),
        code: "VALIDATION_ERROR",
      } satisfies ProfileApiError;
    }

    await apiRequest("/users/me/change-password", {
      method: "POST",
      token,
      body: {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      },
    });
  },

  /**
   * Request account deletion.
   * This only works when the backend supports this endpoint.
   */
  async requestAccountDeletion(token: string, reason?: string): Promise<void> {
    await apiRequest("/users/me/deletion-request", {
      method: "POST",
      token,
      body: {
        reason: reason?.trim() || undefined,
      },
    });
  },
};

// ------------------------------------------------------
// Display helpers
// ------------------------------------------------------

export function getFullName(profile: UserProfile): string {
  return `${profile.firstName} ${profile.lastName}`.trim();
}

export function getInitials(profile: UserProfile): string {
  const first = profile.firstName.trim().charAt(0);
  const last = profile.lastName.trim().charAt(0);

  return `${first}${last}`.toUpperCase() || "U";
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    STUDENT: "Student",
    STAFF: "Staff Member",
    SECURITY: "Security Officer",
    ADMIN: "Administrator",
  };

  return labels[role.toUpperCase()] ?? role.replace(/_/g, " ");
}

export function getAccountStatusColor(status?: string): string {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "#16A34A";

    case "SUSPENDED":
      return "#DC2626";

    case "PENDING":
      return "#D97706";

    case "INACTIVE":
      return "#64748B";

    default:
      return "#64748B";
  }
}

export function formatMemberSince(dateValue?: string): string {
  if (!dateValue) {
    return "Member";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Member";
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default profileApi;
