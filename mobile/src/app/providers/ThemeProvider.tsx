import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Appearance,
  ColorSchemeName,
  StatusBar,
  useColorScheme,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

// Theme definitions
import { colors as defaultColors } from "../../theme/colors";

const THEME_STORAGE_KEY = "@injibara_lost_found_theme";

export type ThemeMode = "light" | "dark" | "system";

export interface AppThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  white: string;
  black: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: AppThemeColors;
  isThemeLoading: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const lightColors: AppThemeColors = {
  primary: defaultColors.primary,
  primaryDark: "#10513F",
  primaryLight: "#E2F2EB",
  secondary: "#D69E36",
  background: "#F7F9F8",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  text: "#172B24",
  textSecondary: "#718078",
  border: "#E5EBE7",
  error: "#DC3545",
  success: "#198754",
  warning: "#F0AD4E",
  white: "#FFFFFF",
  black: "#000000",
};

const darkColors: AppThemeColors = {
  primary: "#4CAF88",
  primaryDark: "#287654",
  primaryLight: "#244A3A",
  secondary: "#E6B65C",
  background: "#101A16",
  surface: "#192720",
  card: "#1E3027",
  text: "#F3F7F4",
  textSecondary: "#A7B8AD",
  border: "#34483C",
  error: "#FF6B75",
  success: "#50C98B",
  warning: "#F4C36A",
  white: "#FFFFFF",
  black: "#000000",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const resolveTheme = (
  mode: ThemeMode,
  systemScheme: ColorSchemeName,
): boolean => {
  if (mode === "dark") {
    return true;
  }

  if (mode === "light") {
    return false;
  }

  return systemScheme === "dark";
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemScheme = useColorScheme();

  const [mode, setMode] = useState<ThemeMode>("system");
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // Load the user's saved theme.
  useEffect(() => {
    let mounted = true;

    const loadTheme = async (): Promise<void> => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (
          mounted &&
          (savedTheme === "light" ||
            savedTheme === "dark" ||
            savedTheme === "system")
        ) {
          setMode(savedTheme);
        }
      } catch (error) {
        console.warn("Unable to load saved theme:", error);
      } finally {
        if (mounted) {
          setIsThemeLoading(false);
        }
      }
    };

    void loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  const isDark = resolveTheme(mode, systemScheme);

  const colors = useMemo<AppThemeColors>(
    () => (isDark ? darkColors : lightColors),
    [isDark],
  );

  // Change and persist the selected theme.
  const setTheme = useCallback(async (newMode: ThemeMode): Promise<void> => {
    setMode(newMode);

    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.warn("Unable to save theme:", error);
    }
  }, []);

  // Switch between light and dark themes.
  const toggleTheme = useCallback(async (): Promise<void> => {
    const nextMode = isDark ? "light" : "dark";
    await setTheme(nextMode);
  }, [isDark, setTheme]);

  // Update the status bar appearance.
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content", true);
  }, [isDark]);

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      mode,
      isDark,
      colors,
      isThemeLoading,
      setTheme,
      toggleTheme,
    }),
    [mode, isDark, colors, isThemeLoading, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme values.
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside a ThemeProvider.");
  }

  return context;
};

export default ThemeProvider;
