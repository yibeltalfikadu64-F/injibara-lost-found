// mobile/src/store/themeStore.ts

import { useEffect } from "react";

import { ColorSchemeName, useColorScheme } from "react-native";

import { create } from "zustand";

import { persist, createJSONStorage } from "zustand/middleware";

import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================
// TYPES
// ============================================================

export type ThemeMode = "LIGHT" | "DARK" | "SYSTEM";

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  danger: string;
  dangerBackground: string;
  info: string;
  infoBackground: string;
  card: string;
  overlay: string;
  inputBackground: string;
  placeholder: string;
  tabBar: string;
  tabBarActive: string;
  tabBarInactive: string;
  statusBar: "light-content" | "dark-content";
}

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;

  setTheme: (mode: ThemeMode) => void;
  setLightTheme: () => void;
  setDarkTheme: () => void;
  setSystemTheme: () => void;
  toggleTheme: () => void;

  updateSystemTheme: (colorScheme: ColorSchemeName) => void;

  getThemeMode: () => ThemeMode;
}

// ============================================================
// LIGHT COLORS
// ============================================================

export const LIGHT_COLORS: ThemeColors = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#DBEAFE",
  secondary: "#64748B",

  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceSecondary: "#F1F5F9",

  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  border: "#E2E8F0",
  divider: "#E5E7EB",

  success: "#16A34A",
  successBackground: "#DCFCE7",

  warning: "#D97706",
  warningBackground: "#FEF3C7",

  danger: "#DC2626",
  dangerBackground: "#FEE2E2",

  info: "#0284C7",
  infoBackground: "#E0F2FE",

  card: "#FFFFFF",
  overlay: "rgba(15, 23, 42, 0.45)",

  inputBackground: "#F8FAFC",
  placeholder: "#94A3B8",

  tabBar: "#FFFFFF",
  tabBarActive: "#2563EB",
  tabBarInactive: "#94A3B8",

  statusBar: "dark-content",
};

// ============================================================
// DARK COLORS
// ============================================================

export const DARK_COLORS: ThemeColors = {
  primary: "#60A5FA",
  primaryDark: "#3B82F6",
  primaryLight: "#1E3A8A",
  secondary: "#94A3B8",

  background: "#0F172A",
  surface: "#1E293B",
  surfaceSecondary: "#334155",

  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",

  border: "#334155",
  divider: "#334155",

  success: "#4ADE80",
  successBackground: "#14532D",

  warning: "#FBBF24",
  warningBackground: "#78350F",

  danger: "#F87171",
  dangerBackground: "#7F1D1D",

  info: "#38BDF8",
  infoBackground: "#0C4A6E",

  card: "#1E293B",
  overlay: "rgba(0, 0, 0, 0.65)",

  inputBackground: "#0F172A",
  placeholder: "#64748B",

  tabBar: "#1E293B",
  tabBarActive: "#60A5FA",
  tabBarInactive: "#94A3B8",

  statusBar: "light-content",
};

// ============================================================
// THEME RESOLVER
// ============================================================

function resolveTheme(
  mode: ThemeMode,
  systemTheme: ColorSchemeName,
): {
  isDark: boolean;
  colors: ThemeColors;
} {
  const isDark =
    mode === "DARK" || (mode === "SYSTEM" && systemTheme === "dark");

  return {
    isDark,
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
  };
}

// ============================================================
// THEME STORE
// ============================================================

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "SYSTEM",
      isDark: false,
      colors: LIGHT_COLORS,

      setTheme: (mode) => {
        const resolved = resolveTheme(mode, get().isDark ? "dark" : "light");

        set({
          mode,
          isDark: resolved.isDark,
          colors: resolved.colors,
        });
      },

      setLightTheme: () => {
        set({
          mode: "LIGHT",
          isDark: false,
          colors: LIGHT_COLORS,
        });
      },

      setDarkTheme: () => {
        set({
          mode: "DARK",
          isDark: true,
          colors: DARK_COLORS,
        });
      },

      setSystemTheme: () => {
        set({ mode: "SYSTEM" });
      },

      toggleTheme: () => {
        const nextMode: ThemeMode = get().isDark ? "LIGHT" : "DARK";

        set({
          mode: nextMode,
          isDark: nextMode === "DARK",
          colors: nextMode === "DARK" ? DARK_COLORS : LIGHT_COLORS,
        });
      },

      updateSystemTheme: (colorScheme) => {
        if (get().mode !== "SYSTEM") {
          return;
        }

        const resolved = resolveTheme("SYSTEM", colorScheme);

        set({
          isDark: resolved.isDark,
          colors: resolved.colors,
        });
      },

      getThemeMode: () => get().mode,
    }),
    {
      name: "campus-lost-found-theme",

      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        mode: state.mode,
      }),

      version: 1,

      onRehydrateStorage: () => (state) => {
        if (state) {
          // Initial system mode is recalculated by the
          // useSystemThemeSync hook after app startup.
          const resolved = resolveTheme(state.mode, "light");

          state.isDark = resolved.isDark;
          state.colors = resolved.colors;
        }
      },
    },
  ),
);

// ============================================================
// SYSTEM THEME SYNCHRONIZATION HOOK
// ============================================================

export function useSystemThemeSync(): void {
  const colorScheme = useColorScheme();

  const updateSystemTheme = useThemeStore((state) => state.updateSystemTheme);

  useEffect(() => {
    updateSystemTheme(colorScheme);
  }, [colorScheme, updateSystemTheme]);
}

// ============================================================
// SELECTORS
// ============================================================

export const selectThemeMode = (state: ThemeState) => state.mode;

export const selectIsDarkTheme = (state: ThemeState) => state.isDark;

export const selectThemeColors = (state: ThemeState) => state.colors;

// ============================================================
// EXPORT
// ============================================================

const themeStore = {
  useThemeStore,
  LIGHT_COLORS,
  DARK_COLORS,
  resolveTheme,
  useSystemThemeSync,
};

export default themeStore;
