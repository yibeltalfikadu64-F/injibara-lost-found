import { useCallback } from "react";

import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";

import type {
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth.types";

import { getApiErrorMessage } from "../../../lib/apiClient";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        setLoading(true);

        const response = await authApi.login(credentials);

        setAuth(response);

        return response;
      } catch (error) {
        setLoading(false);
        throw new Error(getApiErrorMessage(error, "Unable to sign in."));
      }
    },
    [setAuth, setLoading],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      try {
        setLoading(true);

        const response = await authApi.register(credentials);

        if (response.accessToken && response.user) {
          setAuth(response);
        } else {
          setLoading(false);
        }

        return response;
      } catch (error) {
        setLoading(false);
        throw new Error(getApiErrorMessage(error, "Unable to register."));
      }
    },
    [setAuth, setLoading],
  );

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } finally {
      clearAuth();
    }
  }, [refreshToken, clearAuth]);

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const loadCurrentUser = useCallback(async () => {
    if (!accessToken) {
      return null;
    }

    try {
      setLoading(true);

      const currentUser = await authApi.getCurrentUser();

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      clearAuth();

      throw new Error(
        getApiErrorMessage(error, "Unable to load your account."),
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, setUser, clearAuth, setLoading]);

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    logoutAll,
    loadCurrentUser,
    setUser,
    clearAuth,
  };
}
