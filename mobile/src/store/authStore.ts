// mobile/src/store/authStore.ts

import { create } from 'zustand';

import api, {
  ApiError,
} from '../services/apiClient';

import tokenService from '../services/tokenService';

// ============================================================
// TYPES
// ============================================================

export type UserRole =
  | 'STUDENT'
  | 'STAFF'
  | 'SECURITY'
  | 'ADMIN';

export type AccountStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'PENDING'
  | 'DELETED';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  profileImage?: string | null;
  role: UserRole;
  status?: AccountStatus;
  studentId?: string;
  department?: string;
  faculty?: string;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'STUDENT' | 'STAFF';
  studentId?: string;
  department?: string;
  faculty?: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  data?: {
    user?: AuthUser;
    accessToken?: string;
    refreshToken?: string;
    tokens?: AuthTokens;
  };
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  tokens?: AuthTokens;
}

export interface AuthState {
  // User state
  user: AuthUser | null;

  // Token state
  accessToken: string | null;

  // Authentication state
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;

  // Error state
  error: string | null;

  // Session state
  lastLoginAt: number | null;

  // Actions
  login: (payload: LoginPayload) => Promise<AuthUser>;

  register: (
    payload: RegisterPayload,
  ) => Promise<AuthUser>;

  logout: () => Promise<void>;

  restoreSession: () => Promise<void>;

  refreshSession: () => Promise<string>;

  setSession: (
    user: AuthUser,
    tokens: AuthTokens,
  ) => Promise<void>;

  setUser: (user: AuthUser | null) => void;

  updateUser: (
    updates: Partial<AuthUser>,
  ) => void;

  setAccessToken: (
    accessToken: string | null,
  ) => void;

  setLoading: (loading: boolean) => void;

  setError: (error: string | null) => void;

  clearError: () => void;

  clearAuthState: () => void;

  isAdmin: () => boolean;

  isSecurity: () => boolean;

  isStudent: () => boolean;

  isStaff: () => boolean;

  hasRole: (roles: UserRole[]) => boolean;
}

// ============================================================
// API RESPONSE HELPERS
// ============================================================

function extractUser(
  response: AuthResponse,
): AuthUser | null {
  const user =
    response.data?.user ??
    response.user ??
    null;

  if (!user || !user.id || !user.email) {
    return null;
  }

  return user;
}

function extractTokens(
  response: AuthResponse,
): AuthTokens | null {
  const accessToken =
    response.data?.tokens?.accessToken ??
    response.data?.accessToken ??
    response.tokens?.accessToken ??
    response.accessToken;

  const refreshToken =
    response.data?.tokens?.refreshToken ??
    response.data?.refreshToken ??
    response.tokens?.refreshToken ??
    response.refreshToken;

  if (
    typeof accessToken !== 'string' ||
    typeof refreshToken !== 'string' ||
    !accessToken ||
    !refreshToken
  ) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

// ============================================================
// ERROR HELPER
// ============================================================

function getAuthErrorMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An authentication error occurred. Please try again.';
}

// ============================================================
// USER VALIDATION
// ============================================================

function validateUser(
  user: AuthUser | null,
): user is AuthUser {
  if (!user) {
    return false;
  }

  return Boolean(
    user.id &&
    user.email &&
    user.firstName &&
    user.lastName &&
    user.role,
  );
}

// ============================================================
// AUTH STORE
// ============================================================

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    // --------------------------------------------------------
    // INITIAL STATE
    // --------------------------------------------------------

    user: null,

    accessToken: null,

    isAuthenticated: false,

    isInitialized: false,

    isLoading: false,

    error: null,

    lastLoginAt: null,

    // --------------------------------------------------------
    // LOGIN
    // --------------------------------------------------------

    login: async (payload) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const email = payload.email
          .trim()
          .toLowerCase();

        if (!email || !payload.password) {
          throw new Error(
            'Email and password are required.',
          );
        }

        const response =
          await api.postWithoutAuth<AuthResponse>(
            '/auth/login',
            {
              email,
              password: payload.password,
            },
          );

        const user = extractUser(response);

        const tokens = extractTokens(response);

        if (!validateUser(user)) {
          throw new Error(
            'The server did not return a valid user profile.',
          );
        }

        if (!tokens) {
          throw new Error(
            'The server did not return valid authentication tokens.',
          );
        }

        await tokenService.saveTokens(tokens);

        set({
          user,

          accessToken: tokens.accessToken,

          isAuthenticated: true,

          isInitialized: true,

          isLoading: false,

          error: null,

          lastLoginAt: Date.now(),
        });

        return user;
      } catch (error) {
        const message = getAuthErrorMessage(error);

        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: message,
        });

        throw error;
      }
    },

    // --------------------------------------------------------
    // REGISTER
    // --------------------------------------------------------

    register: async (payload) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const email = payload.email
          .trim()
          .toLowerCase();

        if (
          !payload.firstName.trim() ||
          !payload.lastName.trim() ||
          !email ||
          !payload.password
        ) {
          throw new Error(
            'Please complete all required registration fields.',
          );
        }

        const response =
          await api.postWithoutAuth<AuthResponse>(
            '/auth/register',
            {
              ...payload,
              email,
              firstName: payload.firstName.trim(),
              lastName: payload.lastName.trim(),
            },
          );

        const user = extractUser(response);

        const tokens = extractTokens(response);

        if (!validateUser(user)) {
          throw new Error(
            'Registration succeeded without a valid user profile.',
          );
        }

        // Some applications require email verification before
        // granting an authenticated session. In that case, the
        // backend should return the user without tokens.
        if (tokens) {
          await tokenService.saveTokens(tokens);

          set({
            user,
            accessToken: tokens.accessToken,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
            error: null,
            lastLoginAt: Date.now(),
          });
        } else {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
            error: null,
          });
        }

        return user;
      } catch (error) {
        const message = getAuthErrorMessage(error);

        set({
          isLoading: false,
          error: message,
        });

        throw error;
      }
    },

    // --------------------------------------------------------
    // LOGOUT
    // --------------------------------------------------------

    logout: async () => {
      const refreshToken =
        await tokenService.getRefreshToken();

      set({
        isLoading: true,
        error: null,
      });

      try {
        // Ask the server to revoke the refresh token.
        // Local session cleanup still happens if the server
        // cannot be reached.
        if (refreshToken) {
          try {
            await api.instance.post(
              '/auth/logout',
              {
                refreshToken,
              },
              {
                skipAuthRefresh: true,
              } as never,
            );
          } catch (error) {
            console.warn(
              'Server logout request failed. Clearing local session.',
              error,
            );
          }
        }
      } finally {
        await tokenService.clearTokens();

        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          error: null,
          lastLoginAt: null,
        });
      }
    },

    // --------------------------------------------------------
    // RESTORE SESSION
    // --------------------------------------------------------

    restoreSession: async () => {
      if (get().isLoading) {
        return;
      }

      set({
        isLoading: true,
        error: null,
      });

      try {
        const tokens = await tokenService.getTokens();

        if (!tokens) {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
          });

          return;
        }

        let accessToken = tokens.accessToken;

        if (
          tokenService.isTokenExpired(accessToken)
        ) {
          try {
            accessToken =
              await get().refreshSession();
          } catch {
            await tokenService.clearTokens();

            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isInitialized: true,
              isLoading: false,
            });

            return;
          }
        }

        // Verify the saved session with the backend.
        const response =
          await api.get<AuthResponse>(
            '/auth/me',
          );

        const user = extractUser(response);

        if (!validateUser(user)) {
          throw new Error(
            'Unable to restore the user profile.',
          );
        }

        set({
          user,
          accessToken,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        await tokenService.clearTokens();

        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
          error: getAuthErrorMessage(error),
        });
      }
    },

    // --------------------------------------------------------
    // REFRESH SESSION
    // --------------------------------------------------------

    refreshSession: async () => {
      try {
        const accessToken =
          await api.refreshAccessToken();

        set({
          accessToken,
          isAuthenticated: true,
          error: null,
        });

        return accessToken;
      } catch (error) {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          error: getAuthErrorMessage(error),
        });

        throw error;
      }
    },

    // --------------------------------------------------------
    // SET SESSION
    // --------------------------------------------------------

    setSession: async (user, tokens) => {
      if (!validateUser(user)) {
        throw new Error(
          'Cannot create a session with an invalid user.',
        );
      }

      await tokenService.saveTokens(tokens);

      set({
        user,
        accessToken: tokens.accessToken,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
        error: null,
        lastLoginAt: Date.now(),
      });
    },

    // --------------------------------------------------------
    // SET USER
    // --------------------------------------------------------

    setUser: (user) => {
      set({
        user,

        isAuthenticated:
          user !== null &&
          get().accessToken !== null,
      });
    },

    // --------------------------------------------------------
    // UPDATE USER
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // SET ACCESS TOKEN
    // --------------------------------------------------------

    setAccessToken: (accessToken) => {
      set({
        accessToken,

        isAuthenticated:
          Boolean(accessToken && get().user),
      });

      if (accessToken) {
        void tokenService.updateAccessToken(
          accessToken,
        ).catch((error) => {
          console.error(
            'Unable to store access token:',
            error,
          );
        });
      } else {
        void tokenService.removeAccessToken();
      }
    },

    // --------------------------------------------------------
    // LOADING
    // --------------------------------------------------------

    setLoading: (isLoading) => {
      set({ isLoading });
    },

    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    setError: (error) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },

    // --------------------------------------------------------
    // CLEAR AUTH STATE
    // --------------------------------------------------------

    clearAuthState: () => {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastLoginAt: null,
      });

      void tokenService.clearTokens();
    },

    // --------------------------------------------------------
    // ROLE HELPERS
    // --------------------------------------------------------

    isAdmin: () => {
      return get().user?.role === 'ADMIN';
    },

    isSecurity: () => {
      return get().user?.role === 'SECURITY';
    },

    isStudent: () => {
      return get().user?.role === 'STUDENT';
    },

    isStaff: () => {
      return get().user?.role === 'STAFF';
    },

    hasRole: (roles) => {
      const role = get().user?.role;

      return role
        ? roles.includes(role)
        : false;
    },
  }),
);

// ============================================================
// SELECTORS
// ============================================================

export const selectCurrentUser = (
  state: AuthState,
) => state.user;

export const selectAccessToken = (
  state: AuthState,
) => state.accessToken;

export const selectIsAuthenticated = (
  state: AuthState,
) => state.isAuthenticated;

export const selectIsAuthInitialized = (
  state: AuthState,
) => state.isInitialized;

export const selectAuthLoading = (
  state: AuthState,
) => state.isLoading;

export const selectAuthError = (
  state: AuthState,
) => state.error;

// ============================================================
// NON-REACT ACCESS
// ============================================================

export const getCurrentAuthUser = () =>
  useAuthStore.getState().user;

export const getCurrentAccessToken = () =>
  useAuthStore.getState().accessToken;

export const isUserAuthenticated = () =>
  useAuthStore.getState().isAuthenticated;

export default useAuthStore;