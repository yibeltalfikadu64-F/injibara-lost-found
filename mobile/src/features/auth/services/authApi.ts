// mobile/src/features/auth/services/authApi.ts

/**
 * Injibara Campus Lost & Found
 * Authentication API Service
 *
 * Responsibilities:
 * - User login
 * - User registration
 * - Retrieve authenticated user
 * - Refresh access tokens
 * - Logout
 * - Normalize backend responses
 */

export type UserRole =
  | 'STUDENT'
  | 'STAFF'
  | 'SECURITY'
  | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;

  phone?: string | null;
  studentId?: string | null;
  department?: string | null;
  avatarUrl?: string | null;

  isEmailVerified?: boolean;
  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;

  phone?: string;
  studentId?: string;
  department?: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export class AuthApiError extends Error {
  statusCode?: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode?: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);

    this.name = 'AuthApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Configure this variable in your mobile/.env file.
 *
 * Example:
 * EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
 *
 * For a physical phone, use your computer's LAN IP address:
 * EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api/v1
 */

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:5000/api/v1'
).replace(/\/+$/, '');

/**
 * Authentication endpoint configuration.
 *
 * Change these paths if your backend uses different routes.
 */

export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  currentUser: '/auth/me',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
} as const;

/**
 * Safely converts an unknown value to an object.
 */
function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

/**
 * Extracts the useful data from common API response formats.
 *
 * Supports:
 * { data: { user: ... } }
 * { success: true, data: { user: ... } }
 * { user: ... }
 */

function extractResponseData(
  response: unknown,
): Record<string, unknown> {
  if (!isObject(response)) {
    throw new AuthApiError(
      'Invalid response received from the server.',
    );
  }

  if (isObject(response.data)) {
    return response.data;
  }

  return response;
}

/**
 * Extracts an error message from the backend.
 */
async function getErrorMessage(
  response: Response,
): Promise<AuthApiError> {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (isObject(body)) {
    const message =
      typeof body.message === 'string'
        ? body.message
        : typeof body.error === 'string'
          ? body.error
          : 'Something went wrong. Please try again.';

    const errors = isObject(body.errors)
      ? (body.errors as Record<string, string[]>)
      : undefined;

    return new AuthApiError(
      message,
      response.status,
      errors,
    );
  }

  return new AuthApiError(
    'Unable to communicate with the server.',
    response.status,
  );
}

/**
 * Main HTTP request function.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set('Accept', 'application/json');

  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set(
      'Authorization',
      `Bearer ${accessToken}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        ...options,
        headers,
      },
    );
  } catch {
    throw new AuthApiError(
      'Network connection failed. Check your internet connection and try again.',
    );
  }

  if (!response.ok) {
    throw await getErrorMessage(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new AuthApiError(
      'The server returned an invalid response.',
      response.status,
    );
  }
}

/**
 * Normalizes a backend user object.
 */
function normalizeUser(value: unknown): AuthUser {
  if (!isObject(value)) {
    throw new AuthApiError(
      'The server did not return valid user information.',
    );
  }

  const role = String(value.role || 'STUDENT').toUpperCase();

  const validRoles: UserRole[] = [
    'STUDENT',
    'STAFF',
    'SECURITY',
    'ADMIN',
  ];

  if (!validRoles.includes(role as UserRole)) {
    throw new AuthApiError(
      'The account has an unsupported user role.',
    );
  }

  const id = value.id ?? value.userId;
  const fullName =
    value.fullName ??
    value.name ??
    value.firstName ??
    '';

  if (
    typeof id !== 'string' &&
    typeof id !== 'number'
  ) {
    throw new AuthApiError(
      'The server returned an invalid user ID.',
    );
  }

  if (typeof value.email !== 'string') {
    throw new AuthApiError(
      'The server returned an invalid email address.',
    );
  }

  return {
    id: String(id),
    email: value.email,
    fullName: String(fullName),
    role: role as UserRole,

    phone:
      typeof value.phone === 'string'
        ? value.phone
        : null,

    studentId:
      typeof value.studentId === 'string'
        ? value.studentId
        : null,

    department:
      typeof value.department === 'string'
        ? value.department
        : null,

    avatarUrl:
      typeof value.avatarUrl === 'string'
        ? value.avatarUrl
        : typeof value.avatar === 'string'
          ? value.avatar
          : null,

    isEmailVerified:
      typeof value.isEmailVerified === 'boolean'
        ? value.isEmailVerified
        : undefined,

    isActive:
      typeof value.isActive === 'boolean'
        ? value.isActive
        : undefined,

    createdAt:
      typeof value.createdAt === 'string'
        ? value.createdAt
        : undefined,

    updatedAt:
      typeof value.updatedAt === 'string'
        ? value.updatedAt
        : undefined,
  };
}

/**
 * Extracts access and refresh tokens.
 */
function normalizeTokens(
  value: Record<string, unknown>,
): AuthTokens {
  const tokens = isObject(value.tokens)
    ? value.tokens
    : value;

  const accessToken =
    tokens.accessToken ??
    tokens.access_token;

  const refreshToken =
    tokens.refreshToken ??
    tokens.refresh_token;

  if (
    typeof accessToken !== 'string' ||
    typeof refreshToken !== 'string'
  ) {
    throw new AuthApiError(
      'The server did not return valid authentication tokens.',
    );
  }

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * Extracts a complete authentication session.
 */
function normalizeSession(
  response: unknown,
): AuthSession {
  const data = extractResponseData(response);

  const user = normalizeUser(data.user);

  const tokens = normalizeTokens(data);

  return {
    user,
    ...tokens,
  };
}

/**
 * LOGIN
 *
 * POST /auth/login
 */
export async function loginApi(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const response = await request<unknown>(
    AUTH_ENDPOINTS.login,
    {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }),
    },
  );

  return normalizeSession(response);
}

/**
 * REGISTER
 *
 * POST /auth/register
 *
 * confirmPassword is intentionally excluded because
 * password confirmation is a client-side validation field.
 */
export async function registerApi(
  credentials: RegisterCredentials,
): Promise<AuthSession | { user: AuthUser }> {
  const response = await request<unknown>(
    AUTH_ENDPOINTS.register,
    {
      method: 'POST',
      body: JSON.stringify({
        fullName: credentials.fullName.trim(),
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        phone: credentials.phone?.trim(),
        studentId: credentials.studentId?.trim(),
        department: credentials.department?.trim(),
      }),
    },
  );

  const data = extractResponseData(response);

  const user = normalizeUser(data.user);

  const accessToken =
    data.accessToken ??
    (isObject(data.tokens)
      ? data.tokens.accessToken
      : undefined);

  const refreshToken =
    data.refreshToken ??
    (isObject(data.tokens)
      ? data.tokens.refreshToken
      : undefined);

  if (
    typeof accessToken === 'string' &&
    typeof refreshToken === 'string'
  ) {
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  return { user };
}

/**
 * GET CURRENT USER
 *
 * GET /auth/me
 */
export async function getCurrentUserApi(
  accessToken: string,
): Promise<AuthUser> {
  const response = await request<unknown>(
    AUTH_ENDPOINTS.currentUser,
    {
      method: 'GET',
    },
    accessToken,
  );

  const data = extractResponseData(response);

  return normalizeUser(data.user ?? data);
}

/**
 * REFRESH TOKEN
 *
 * POST /auth/refresh
 */
export async function refreshTokenApi(
  refreshToken: string,
): Promise<AuthTokens> {
  const response = await request<unknown>(
    AUTH_ENDPOINTS.refresh,
    {
      method: 'POST',
      body: JSON.stringify({
        refreshToken,
      }),
    },
  );

  const data = extractResponseData(response);

  return normalizeTokens(data);
}

/**
 * LOGOUT
 *
 * POST /auth/logout
 */
export async function logoutApi(
  accessToken: string,
  refreshToken?: string,
): Promise<void> {
  await request<void>(
    AUTH_ENDPOINTS.logout,
    {
      method: 'POST',
      body: JSON.stringify({
        refreshToken,
      }),
    },
    accessToken,
  );
}

/**
 * Export API configuration for other authentication files.
 */
export const authApi = {
  login: loginApi,
  register: registerApi,
  getCurrentUser: getCurrentUserApi,
  refreshToken: refreshTokenApi,
  logout: logoutApi,
};

export default authApi;