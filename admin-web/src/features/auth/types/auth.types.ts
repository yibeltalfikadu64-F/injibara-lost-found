
export type UserRole =
  | 'STUDENT'
  | 'STAFF'
  | 'SECURITY'
  | 'ADMIN';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  studentId?: string | null;
  department?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  studentId?: string;
  department?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthApiMessage {
  message: string;
}

export interface AuthError {
  message: string;
  statusCode?: number;
}
