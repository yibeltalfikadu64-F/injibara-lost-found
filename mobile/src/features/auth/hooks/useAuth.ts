// mobile/src/features/auth/hooks/useAuth.ts

/**
 * Injibara Campus Lost & Found
 * useAuth Custom Hook
 *
 * Provides:
 * - Current user
 * - Login
 * - Registration
 * - Logout
 * - Authentication status
 * - User role
 * - Loading state
 * - Error handling
 */

import { useCallback, useMemo } from "react";

import { useAuthStore } from "../store/authStore";

import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  UserRole,
} from "../services/authApi";

/**
 * Authentication hook return type.
 */
export interface UseAuthReturn {
  user: AuthUser | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  isInitialized: boolean;

  error: string | null;

  role: UserRole | null;

  isStudent: boolean;

  isStaff: boolean;

  isSecurity: boolean;

  isAdmin: boolean;

  login: (credentials: LoginCredentials) => Promise<AuthUser>;

  register: (credentials: RegisterCredentials) => Promise<AuthUser>;

  logout: () => Promise<void>;

  refreshSession: () => Promise<boolean>;

  loadUser: () => Promise<void>;

  clearError: () => void;

  updateUser: (updates: Partial<AuthUser>) => void;
}

/**
 * Main authentication hook.
 */
export function useAuth(): UseAuthReturn {
  const user = useAuthStore((state) => state.user);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isLoading = useAuthStore((state) => state.isLoading);

  const isInitialized = useAuthStore((state) => state.isInitialized);

  const error = useAuthStore((state) => state.error);

  const loginAction = useAuthStore((state) => state.login);

  const registerAction = useAuthStore((state) => state.register);

  const logoutAction = useAuthStore((state) => state.logout);

  const refreshSessionAction = useAuthStore((state) => state.refreshSession);

  const loadUserAction = useAuthStore((state) => state.loadUser);

  const clearErrorAction = useAuthStore((state) => state.clearError);

  const updateUserAction = useAuthStore((state) => state.updateUser);

  /**
   * LOGIN
   */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      return loginAction(credentials);
    },
    [loginAction],
  );

  /**
   * REGISTER
   */
  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      return registerAction(credentials);
    },
    [registerAction],
  );

  /**
   * LOGOUT
   */
  const logout = useCallback(async () => {
    await logoutAction();
  }, [logoutAction]);

  /**
   * REFRESH SESSION
   */
  const refreshSession = useCallback(async () => {
    return refreshSessionAction();
  }, [refreshSessionAction]);

  /**
   * RESTORE USER
   */
  const loadUser = useCallback(async () => {
    await loadUserAction();
  }, [loadUserAction]);

  /**
   * CLEAR ERROR
   */
  const clearError = useCallback(() => {
    clearErrorAction();
  }, [clearErrorAction]);

  /**
   * UPDATE PROFILE
   */
  const updateUser = useCallback(
    (updates: Partial<AuthUser>) => {
      updateUserAction(updates);
    },
    [updateUserAction],
  );

  /**
   * Derive role information.
   */
  const role = user?.role ?? null;

  const roleInformation = useMemo(
    () => ({
      isStudent: role === "STUDENT",
      isStaff: role === "STAFF",
      isSecurity: role === "SECURITY",
      isAdmin: role === "ADMIN",
    }),
    [role],
  );

  return {
    user,

    isAuthenticated,

    isLoading,

    isInitialized,

    error,

    role,

    ...roleInformation,

    login,

    register,

    logout,

    refreshSession,

    loadUser,

    clearError,

    updateUser,
  };
}

export default useAuth;
