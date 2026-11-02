import { apiClient } from "../../../lib/apiClient";

import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from "../types/auth.types";

interface ApiEnvelope<T> {
  data?: T;
  message?: string;
}

function unwrap<T>(responseData: unknown): T {
  const response = responseData as ApiEnvelope<T>;

  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    response.data !== undefined
  ) {
    return response.data;
  }

  return responseData as T;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/login", credentials);

    return unwrap<AuthResponse>(response.data);
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/register", credentials);

    return unwrap<AuthResponse>(response.data);
  },

  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get("/auth/me");

    const result = unwrap<AuthUser | { user: AuthUser }>(response.data);

    return "user" in result ? result.user : result;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/refresh", {
      refreshToken,
    });

    return unwrap<AuthResponse>(response.data);
  },

  async logout(refreshToken?: string): Promise<void> {
    await apiClient.post("/auth/logout", {
      refreshToken,
    });
  },

  async logoutAll(): Promise<void> {
    await apiClient.post("/auth/logout-all");
  },

  async forgotPassword(
    payload: ForgotPasswordPayload,
  ): Promise<{ message: string }> {
    const response = await apiClient.post("/auth/forgot-password", payload);

    return unwrap<{ message: string }>(response.data);
  },

  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<{ message: string }> {
    const response = await apiClient.post("/auth/reset-password", payload);

    return unwrap<{ message: string }>(response.data);
  },

  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<{ message: string }> {
    const response = await apiClient.post("/auth/change-password", payload);

    return unwrap<{ message: string }>(response.data);
  },
};
