// mobile/src/types/auth.types.ts

import type {
  User,
  UserRole,
  StudentDetails,
  StaffDetails,
} from "./user.types";

// ============================================================
// AUTHENTICATION ENUMS
// ============================================================

export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
  APPLE = "APPLE",
}

export enum AuthStatus {
  IDLE = "IDLE",
  LOADING = "LOADING",
  AUTHENTICATED = "AUTHENTICATED",
  UNAUTHENTICATED = "UNAUTHENTICATED",
  ERROR = "ERROR",
}

export enum TokenType {
  BEARER = "Bearer",
}

// ============================================================
// AUTHENTICATION TOKENS
// ============================================================

export interface AuthTokens {
  accessToken: string;

  refreshToken: string;

  tokenType: TokenType | "Bearer";

  expiresIn: number;

  expiresAt?: string;
}

// ============================================================
// TOKEN PAYLOAD
// ============================================================

export interface JwtPayload {
  sub: string;

  userId?: string;

  email?: string;

  role?: UserRole;

  iat?: number;

  exp?: number;

  iss?: string;

  aud?: string;

  jti?: string;
}

// ============================================================
// LOGIN REQUEST
// ============================================================

export interface LoginRequest {
  email: string;

  password: string;

  rememberMe?: boolean;

  deviceName?: string;

  deviceType?: "ANDROID" | "IOS" | "WEB" | "OTHER";
}

// ============================================================
// LOGIN RESPONSE
// ============================================================

export interface LoginResponse {
  success: boolean;

  message: string;

  user: User;

  tokens: AuthTokens;
}

// ============================================================
// REGISTRATION REQUEST
// ============================================================

export interface RegisterRequest {
  firstName: string;

  lastName: string;

  email: string;

  password: string;

  confirmPassword: string;

  role?: UserRole.STUDENT | UserRole.STAFF;

  phoneNumber?: string;

  studentDetails?: StudentDetails;

  staffDetails?: StaffDetails;

  acceptTerms: boolean;
}

// ============================================================
// REGISTRATION RESPONSE
// ============================================================

export interface RegisterResponse {
  success: boolean;

  message: string;

  user: User;

  requiresEmailVerification: boolean;
}

// ============================================================
// LOGOUT REQUEST
// ============================================================

export interface LogoutRequest {
  refreshToken?: string;

  allDevices?: boolean;
}

// ============================================================
// LOGOUT RESPONSE
// ============================================================

export interface LogoutResponse {
  success: boolean;

  message: string;
}

// ============================================================
// REFRESH TOKEN REQUEST
// ============================================================

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ============================================================
// REFRESH TOKEN RESPONSE
// ============================================================

export interface RefreshTokenResponse {
  success: boolean;

  accessToken: string;

  refreshToken?: string;

  tokenType: TokenType | "Bearer";

  expiresIn: number;
}

// ============================================================
// CURRENT USER RESPONSE
// ============================================================

export interface CurrentUserResponse {
  success: boolean;

  user: User;
}

// ============================================================
// EMAIL VERIFICATION REQUEST
// ============================================================

export interface VerifyEmailRequest {
  token: string;
}

// ============================================================
// EMAIL VERIFICATION RESPONSE
// ============================================================

export interface VerifyEmailResponse {
  success: boolean;

  message: string;

  user?: User;
}

// ============================================================
// RESEND VERIFICATION REQUEST
// ============================================================

export interface ResendVerificationRequest {
  email: string;
}

// ============================================================
// RESEND VERIFICATION RESPONSE
// ============================================================

export interface ResendVerificationResponse {
  success: boolean;

  message: string;
}

// ============================================================
// FORGOT PASSWORD REQUEST
// ============================================================

export interface ForgotPasswordRequest {
  email: string;
}

// ============================================================
// FORGOT PASSWORD RESPONSE
// ============================================================

export interface ForgotPasswordResponse {
  success: boolean;

  message: string;
}

// ============================================================
// RESET PASSWORD REQUEST
// ============================================================

export interface ResetPasswordRequest {
  token: string;

  newPassword: string;

  confirmPassword: string;
}

// ============================================================
// RESET PASSWORD RESPONSE
// ============================================================

export interface ResetPasswordResponse {
  success: boolean;

  message: string;
}

// ============================================================
// CHANGE PASSWORD REQUEST
// ============================================================

export interface AuthChangePasswordRequest {
  currentPassword: string;

  newPassword: string;

  confirmPassword: string;
}

// ============================================================
// CHANGE PASSWORD RESPONSE
// ============================================================

export interface AuthChangePasswordResponse {
  success: boolean;

  message: string;
}

// ============================================================
// AUTHENTICATION STATE
// ============================================================

export interface AuthState {
  user: User | null;

  tokens: AuthTokens | null;

  accessToken: string | null;

  refreshToken: string | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  isInitializing: boolean;

  status: AuthStatus;

  error: string | null;
}

// ============================================================
// AUTHENTICATION ACTIONS
// ============================================================

export interface AuthActions {
  login: (credentials: LoginRequest) => Promise<LoginResponse>;

  register: (data: RegisterRequest) => Promise<RegisterResponse>;

  logout: (options?: LogoutRequest) => Promise<void>;

  refreshSession: () => Promise<boolean>;

  getCurrentUser: () => Promise<User | null>;

  updateUser: (user: Partial<User>) => void;

  clearError: () => void;

  resetAuth: () => void;
}

// ============================================================
// AUTH STORE TYPE
// ============================================================

export type AuthStore = AuthState & AuthActions;

// ============================================================
// AUTHENTICATION CONTEXT
// ============================================================

export interface AuthContextValue {
  user: User | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  login: (credentials: LoginRequest) => Promise<LoginResponse>;

  register: (data: RegisterRequest) => Promise<RegisterResponse>;

  logout: () => Promise<void>;
}

// ============================================================
// SESSION INFORMATION
// ============================================================

export interface AuthSession {
  userId: string;

  email: string;

  role: UserRole;

  accessTokenExpiresAt: string;

  refreshTokenExpiresAt?: string;

  createdAt: string;

  deviceName?: string;
}

// ============================================================
// AUTHENTICATION ERROR
// ============================================================

export interface AuthError {
  code: string;

  message: string;

  statusCode?: number;

  field?: string;

  details?: Record<string, unknown>;
}

// ============================================================
// AUTHENTICATION API ERROR CODES
// ============================================================

export enum AuthErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",

  ACCOUNT_NOT_FOUND = "ACCOUNT_NOT_FOUND",

  ACCOUNT_DISABLED = "ACCOUNT_DISABLED",

  ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED",

  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",

  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",

  INVALID_TOKEN = "INVALID_TOKEN",

  TOKEN_EXPIRED = "TOKEN_EXPIRED",

  REFRESH_TOKEN_REVOKED = "REFRESH_TOKEN_REVOKED",

  PASSWORD_TOO_WEAK = "PASSWORD_TOO_WEAK",

  PASSWORD_MISMATCH = "PASSWORD_MISMATCH",

  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",

  NETWORK_ERROR = "NETWORK_ERROR",

  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// ============================================================
// AUTHENTICATION VALIDATION
// ============================================================

export interface LoginValidationErrors {
  email?: string;

  password?: string;
}

export interface RegisterValidationErrors {
  firstName?: string;

  lastName?: string;

  email?: string;

  password?: string;

  confirmPassword?: string;

  phoneNumber?: string;

  studentId?: string;

  employeeId?: string;

  department?: string;

  acceptTerms?: string;
}

// ============================================================
// PASSWORD STRENGTH
// ============================================================

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthResult {
  strength: PasswordStrength;

  score: number;

  hasMinimumLength: boolean;

  hasUppercase: boolean;

  hasLowercase: boolean;

  hasNumber: boolean;

  hasSpecialCharacter: boolean;

  isValid: boolean;
}

// ============================================================
// DEVICE AUTHENTICATION
// ============================================================

export interface DeviceAuthentication {
  enabled: boolean;

  biometricEnabled: boolean;

  deviceName?: string;

  deviceType?: "ANDROID" | "IOS" | "WEB" | "OTHER";

  lastAuthenticatedAt?: string;
}

// ============================================================
// AUTHENTICATION HELPERS
// ============================================================

export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt * 1000;
}

export function getTokenExpirationDate(expiresIn: number): Date {
  return new Date(Date.now() + expiresIn * 1000);
}

export function isAuthenticatedUser(user: User | null): user is User {
  return user !== null && Boolean(user.id);
}

// ============================================================
// PASSWORD VALIDATION HELPER
// ============================================================

export function validatePasswordStrength(
  password: string,
): PasswordStrengthResult {
  const hasMinimumLength = password.length >= 8;

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

  let strength: PasswordStrength;

  if (score <= 2) {
    strength = "weak";
  } else if (score === 3) {
    strength = "fair";
  } else if (score === 4) {
    strength = "good";
  } else {
    strength = "strong";
  }

  return {
    strength,

    score,

    hasMinimumLength,

    hasUppercase,

    hasLowercase,

    hasNumber,

    hasSpecialCharacter,

    isValid: score === 5,
  };
}
