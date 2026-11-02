import { authApi } from "../features/auth/services/authApi";

import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from "../features/auth/types/auth.types";

import { useAuthStore } from "../features/auth/store/authStore";

/**
 * Authentication service.
 *
 * Uses the existing authApi service and Zustand store.
 * This prevents duplicate authentication logic.
 */
export const authService = {
  /**
   * Sign in an existing user.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await authApi.login(credentials);

    if (!response.accessToken || !response.user) {
      throw new Error("The server returned an invalid login response.");
    }

    useAuthStore.getState().setAuth(response);

    return response;
  },

  /**
   * Register a new account.
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await authApi.register(credentials);

    if (response.accessToken && response.user) {
      useAuthStore.getState().setAuth(response);
    }

    return response;
  },

  /**
   * Get the currently authenticated user.
   */
  async getCurrentUser(): Promise<AuthUser> {
    const user = await authApi.getCurrentUser();

    useAuthStore.getState().setUser(user);

    return user;
  },

  /**
   * Refresh authentication tokens.
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await authApi.refreshToken(refreshToken);

    if (response.accessToken && response.user) {
      useAuthStore.getState().setAuth(response);
    }

    return response;
  },

  /**
   * Sign out the current user.
   */
  async logout(): Promise<void> {
    const currentRefreshToken = useAuthStore.getState().refreshToken;

    try {
      await authApi.logout(currentRefreshToken ?? undefined);
    } finally {
      useAuthStore.getState().clearAuth();
    }
  },

  /**
   * Sign out all sessions.
   */
  async logoutAll(): Promise<void> {
    try {
      await authApi.logoutAll();
    } finally {
      useAuthStore.getState().clearAuth();
    }
  },

  /**
   * Request a password reset.
   */
  async forgotPassword(
    payload: ForgotPasswordPayload,
  ): Promise<{ message: string }> {
    return authApi.forgotPassword(payload);
  },

  /**
   * Reset a forgotten password.
   */
  async resetPassword(
    payload: ResetPasswordPayload,
  ): Promise<{ message: string }> {
    return authApi.resetPassword(payload);
  },

  /**
   * Change the authenticated user's password.
   */
  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<{ message: string }> {
    return authApi.changePassword(payload);
  },

  /**
   * Return the current authentication state.
   */
  getAuthState() {
    const state = useAuthStore.getState();

    return {
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      isAuthenticated: state.isAuthenticated,
    };
  },

  /**
   * Get the current user without making an API request.
   */
  getCurrentUserFromStore(): AuthUser | null {
    return useAuthStore.getState().user;
  },

  /**
   * Check whether the current user has a particular role.
   */
  hasRole(roles: AuthUser["role"][]): boolean {
    const user = useAuthStore.getState().user;

    if (!user || !user.isActive) {
      return false;
    }

    return roles.includes(user.role);
  },

  /**
   * Check whether the current user is an administrator.
   */
  isAdmin(): boolean {
    return this.hasRole(["ADMIN"]);
  },

  /**
   * Check whether the current user is security staff.
   */
  isSecurity(): boolean {
    return this.hasRole(["SECURITY"]);
  },

  /**
   * Check whether the current session is authenticated.
   */
  isAuthenticated(): boolean {
    const state = useAuthStore.getState();

    return (
      state.isAuthenticated &&
      Boolean(state.accessToken) &&
      Boolean(state.user?.isActive)
    );
  },

  /**
   * Clear local authentication state.
   */
  clearSession(): void {
    useAuthStore.getState().clearAuth();
  },
};

export default authService;
