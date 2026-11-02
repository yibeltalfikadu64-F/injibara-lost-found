import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthResponse, AuthState, AuthUser } from "../types/auth.types";

interface AuthActions {
  setAuth: (response: AuthResponse) => void;
  setUser: (user: AuthUser) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (response) => {
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken ?? null,
          isAuthenticated: Boolean(response.accessToken),
          isLoading: false,
        });
      },

      setUser: (user) => {
        set({
          user,
          isAuthenticated: Boolean(useAuthStore.getState().accessToken),
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      clearAuth: () => {
        set({
          ...initialState,
        });
      },
    }),
    {
      name: "injibara-admin-auth",

      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
