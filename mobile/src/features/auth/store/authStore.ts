// mobile/src/features/auth/store/authStore.ts

/**
 * Injibara Campus Lost & Found
 * Authentication Zustand Store
 *
 * Responsibilities:
 * - Maintain authenticated user information
 * - Login and registration
 * - Store access and refresh tokens
 * - Restore authentication after app restart
 * - Refresh expired access tokens
 * - Logout and clear local credentials
 */

import { Platform } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { create } from "zustand";

import {
  authApi,
  AuthUser,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  AuthSession,
} from "../services/authApi";

/**
 * Storage keys.
 */
const ACCESS_TOKEN_KEY = "injibara_access_token";

const REFRESH_TOKEN_KEY = "injibara_refresh_token";

/**
 * Store state.
 */
interface AuthState {
  user: AuthUser | null;

  accessToken: string | null;

  refreshToken: string | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  isInitialized: boolean;

  error: string | null;

  /**
   * Authentication actions.
   */
  login: (credentials: LoginCredentials) => Promise<AuthUser>;

  register: (credentials: RegisterCredentials) => Promise<AuthUser>;

  logout: () => Promise<void>;

  loadUser: () => Promise<void>;

  refreshSession: () => Promise<boolean>;

  setUser: (user: AuthUser | null) => void;

  clearError: () => void;

  setLoading: (loading: boolean) => void;

  updateUser: (updates: Partial<AuthUser>) => void;
}

/**
 * Storage helper functions.
 *
 * Native:
 * Expo SecureStore
 *
 * Web:
 * AsyncStorage
 */

async function saveStorageValue(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getStorageValue(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function removeStorageValue(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

/**
 * Save authentication tokens.
 */
async function saveTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    saveStorageValue(ACCESS_TOKEN_KEY, tokens.accessToken),
    saveStorageValue(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

/**
 * Read stored authentication tokens.
 */
async function getStoredTokens(): Promise<AuthTokens | null> {
  const [accessToken, refreshToken] = await Promise.all([
    getStorageValue(ACCESS_TOKEN_KEY),
    getStorageValue(REFRESH_TOKEN_KEY),
  ]);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * Remove stored authentication tokens.
 */
async function clearStoredTokens(): Promise<void> {
  await Promise.all([
    removeStorageValue(ACCESS_TOKEN_KEY),
    removeStorageValue(REFRESH_TOKEN_KEY),
  ]);
}

/**
 * Converts unknown errors into readable messages.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Build an authenticated store state.
 */
function createAuthenticatedState(session: AuthSession) {
  return {
    user: session.user,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    isAuthenticated: true,
    isLoading: false,
    isInitialized: true,
    error: null,
  };
}

/**
 * Zustand authentication store.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,

  accessToken: null,

  refreshToken: null,

  isAuthenticated: false,

  isLoading: false,

  isInitialized: false,

  error: null,

  /**
   * LOGIN
   */
  login: async (credentials) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const session = await authApi.login(credentials);

      await saveTokens({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      });

      set(createAuthenticatedState(session));

      return session.user;
    } catch (error) {
      const message = getErrorMessage(error);

      set({
        isLoading: false,
        isAuthenticated: false,
        error: message,
      });

      throw error;
    }
  },

  /**
   * REGISTER
   *
   * If the backend automatically logs in new users,
   * the returned session is stored immediately.
   *
   * If registration only creates an account, this
   * method signs in using the supplied credentials.
   */
  register: async (credentials) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const result = await authApi.register(credentials);

      if ("accessToken" in result && "refreshToken" in result) {
        await saveTokens({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });

        set(createAuthenticatedState(result));

        return result.user;
      }

      const session = await authApi.login({
        email: credentials.email,
        password: credentials.password,
      });

      await saveTokens({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      });

      set(createAuthenticatedState(session));

      return session.user;
    } catch (error) {
      set({
        isLoading: false,
        isAuthenticated: false,
        error: getErrorMessage(error),
      });

      throw error;
    }
  },

  /**
   * LOGOUT
   *
   * Always clears local credentials, even when
   * the backend logout request fails.
   */
  logout: async () => {
    const { accessToken, refreshToken } = get();

    set({
      isLoading: true,
      error: null,
    });

    try {
      if (accessToken) {
        await authApi.logout(accessToken, refreshToken ?? undefined);
      }
    } catch {
      // Continue with local logout.
    } finally {
      await clearStoredTokens();

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

  /**
   * REFRESH SESSION
   *
   * Uses the stored refresh token to obtain
   * a new access token.
   */
  refreshSession: async () => {
    const currentRefreshToken = get().refreshToken;

    if (!currentRefreshToken) {
      return false;
    }

    try {
      const tokens = await authApi.refreshToken(currentRefreshToken);

      const updatedTokens = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };

      await saveTokens(updatedTokens);

      set({
        ...updatedTokens,
        isAuthenticated: true,
        error: null,
      });

      return true;
    } catch {
      await clearStoredTokens();

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true,
      });

      return false;
    }
  },

  /**
   * RESTORE USER AFTER APP RESTART
   */
  loadUser: async () => {
    if (get().isLoading) {
      return;
    }

    set({
      isLoading: true,
      error: null,
    });

    try {
      const storedTokens = await getStoredTokens();

      if (!storedTokens) {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });

        return;
      }

      set({
        accessToken: storedTokens.accessToken,
        refreshToken: storedTokens.refreshToken,
      });

      try {
        const user = await authApi.getCurrentUser(storedTokens.accessToken);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        });

        return;
      } catch {
        // Try refreshing the access token.
      }

      const refreshed = await authApi.refreshToken(storedTokens.refreshToken);

      await saveTokens(refreshed);

      const user = await authApi.getCurrentUser(refreshed.accessToken);

      set({
        user,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    } catch {
      await clearStoredTokens();

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

  /**
   * SET USER
   */
  setUser: (user) => {
    set({
      user,
      isAuthenticated: user !== null,
    });
  },

  /**
   * UPDATE USER PROFILE
   */
  updateUser: (updates) => {
    const currentUser = get().user;

    if (!currentUser) {
      return;
    }

    set({
      user: {
        ...currentUser,
        ...updates,
      },
    });
  },

  /**
   * CLEAR AUTHENTICATION ERROR
   */
  clearError: () => {
    set({
      error: null,
    });
  },

  /**
   * SET LOADING STATE
   */
  setLoading: (loading) => {
    set({
      isLoading: loading,
    });
  },
}));

/**
 * Convenient selectors.
 */
export const selectAuthUser = (state: AuthState) => state.user;

export const selectIsAuthenticated = (state: AuthState) =>
  state.isAuthenticated;

export const selectAuthLoading = (state: AuthState) => state.isLoading;

export const selectAuthRole = (state: AuthState) => state.user?.role ?? null;

export default useAuthStore;
