// mobile/src/theme/index.ts

// ============================================================
// THEME SYSTEM
// Injibara Campus Lost & Found
// ============================================================

import {
  lightColors,
  darkColors,
  brandColors,
  neutralColors,
  statusColors,
  itemColors,
  getColors,
  withOpacity,
} from "./colors";

import type { ColorScheme, ThemeColors } from "./colors";

import {
  typography,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  display,
  heading,
  body,
  label,
  buttonText,
  caption,
  formTypography,
  cardTypography,
  navigationTypography,
  badgeTypography,
  screenTypography,
  statisticsTypography,
  monospaceTypography,
} from "./typography";

import {
  spacing,
  borderRadius,
  borderWidth,
  componentHeight,
  componentWidth,
  screenSpacing,
  cardSpacing,
  formSpacing,
  buttonSpacing,
  listSpacing,
  gridSpacing,
  modalSpacing,
  badgeSpacing,
  avatarSpacing,
  iconSize,
  avatarSize,
  buttonSize,
  inputSize,
  layout,
  safeAreaSpacing,
} from "./spacing";

import {
  shadows,
  createShadow,
  shadowNone,
  shadowXS,
  shadowSM,
  shadowMD,
  shadowLG,
  shadowXL,
  shadow2XL,
  cardShadows,
  buttonShadows,
  headerShadow,
  tabBarShadow,
  modalShadow,
  dropdownShadow,
  floatingActionShadow,
  imageShadow,
  avatarShadow,
  searchBarShadow,
  statusCardShadow,
  getShadow,
  getCustomShadow,
} from "./shadows";

import type { ShadowLevel, ShadowConfiguration } from "./shadows";

// ============================================================
// THEME TYPES
// ============================================================

export type { ColorScheme, ThemeColors, ShadowLevel, ShadowConfiguration };

export interface AppTheme {
  mode: ColorScheme;

  isDark: boolean;

  colors: ThemeColors;

  typography: typeof typography;

  spacing: typeof spacing;

  borderRadius: typeof borderRadius;

  borderWidth: typeof borderWidth;

  shadows: typeof shadows;
}

// ============================================================
// CREATE THEME
// ============================================================

export function createTheme(mode: ColorScheme = "light"): AppTheme {
  const isDark = mode === "dark";

  return {
    mode,

    isDark,

    colors: getColors(mode),

    typography,

    spacing,

    borderRadius,

    borderWidth,

    shadows,
  };
}

// ============================================================
// LIGHT THEME
// ============================================================

export const lightTheme: AppTheme = createTheme("light");

// ============================================================
// DARK THEME
// ============================================================

export const darkTheme: AppTheme = createTheme("dark");

// ============================================================
// DEFAULT THEME
// ============================================================

export const defaultTheme = lightTheme;

// ============================================================
// THEME UTILITIES
// ============================================================

export function getTheme(mode: ColorScheme): AppTheme {
  return mode === "dark" ? darkTheme : lightTheme;
}

// ============================================================
// GET THEME COLORS
// ============================================================

export function getThemeColors(mode: ColorScheme): ThemeColors {
  return mode === "dark" ? darkColors : lightColors;
}

// ============================================================
// CHECK THEME MODE
// ============================================================

export function isDarkMode(mode: ColorScheme): boolean {
  return mode === "dark";
}

// ============================================================
// GET STATUS COLOR
// ============================================================

export type StatusColorType = "success" | "warning" | "error" | "info";

export function getStatusColor(
  status: StatusColorType,
  mode: ColorScheme = "light",
): string {
  const colors = getThemeColors(mode);

  switch (status) {
    case "success":
      return colors.success;

    case "warning":
      return colors.warning;

    case "error":
      return colors.error;

    case "info":
      return colors.info;

    default:
      return colors.info;
  }
}

// ============================================================
// GET ITEM TYPE COLOR
// ============================================================

export type ItemColorType =
  | "lost"
  | "found"
  | "claimed"
  | "returned"
  | "pending";

export function getItemColor(
  type: ItemColorType,
  mode: ColorScheme = "light",
): string {
  const colors = getThemeColors(mode);

  switch (type) {
    case "lost":
      return colors.lost;

    case "found":
      return colors.found;

    case "claimed":
      return colors.claimed;

    case "returned":
      return colors.returned;

    case "pending":
      return colors.pending;

    default:
      return colors.textSecondary;
  }
}

// ============================================================
// GET ITEM BACKGROUND COLOR
// ============================================================

export function getItemBackgroundColor(
  type: ItemColorType,
  mode: ColorScheme = "light",
): string {
  const colors = getThemeColors(mode);

  switch (type) {
    case "lost":
      return colors.lostBackground;

    case "found":
      return colors.foundBackground;

    case "claimed":
      return colors.claimedBackground;

    case "returned":
      return colors.returnedBackground;

    case "pending":
      return colors.pendingBackground;

    default:
      return colors.backgroundSecondary;
  }
}

// ============================================================
// GET STATUS BACKGROUND COLOR
// ============================================================

export function getStatusBackgroundColor(
  status: StatusColorType,
  mode: ColorScheme = "light",
): string {
  const colors = getThemeColors(mode);

  switch (status) {
    case "success":
      return colors.successBackground;

    case "warning":
      return colors.warningBackground;

    case "error":
      return colors.errorBackground;

    case "info":
      return colors.infoBackground;

    default:
      return colors.backgroundSecondary;
  }
}

// ============================================================
// GET TEXT COLOR BASED ON THEME
// ============================================================

export function getTextColor(
  mode: ColorScheme,
  variant: "primary" | "secondary" | "tertiary" = "primary",
): string {
  const colors = getThemeColors(mode);

  switch (variant) {
    case "primary":
      return colors.text;

    case "secondary":
      return colors.textSecondary;

    case "tertiary":
      return colors.textTertiary;

    default:
      return colors.text;
  }
}

// ============================================================
// THEME CONSTANTS
// ============================================================

export const themeConstants = {
  defaultMode: "light" as ColorScheme,

  supportedModes: ["light", "dark"] as ColorScheme[],

  minimumTouchTarget: 44,

  animationDuration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },

  opacity: {
    disabled: 0.45,
    pressed: 0.75,
    subtle: 0.08,
    medium: 0.15,
    strong: 0.3,
  },

  zIndex: {
    base: 0,
    card: 1,
    sticky: 10,
    header: 20,
    dropdown: 30,
    overlay: 40,
    modal: 50,
    toast: 60,
    tooltip: 70,
  },
} as const;

// ============================================================
// GROUPED THEME EXPORTS
// ============================================================

export {
  // Colors
  lightColors,
  darkColors,
  brandColors,
  neutralColors,
  statusColors,
  itemColors,
  getColors,
  withOpacity,

  // Typography
  typography,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  display,
  heading,
  body,
  label,
  buttonText,
  caption,
  formTypography,
  cardTypography,
  navigationTypography,
  badgeTypography,
  screenTypography,
  statisticsTypography,
  monospaceTypography,

  // Spacing
  spacing,
  borderRadius,
  borderWidth,
  componentHeight,
  componentWidth,
  screenSpacing,
  cardSpacing,
  formSpacing,
  buttonSpacing,
  listSpacing,
  gridSpacing,
  modalSpacing,
  badgeSpacing,
  avatarSpacing,
  iconSize,
  avatarSize,
  buttonSize,
  inputSize,
  layout,
  safeAreaSpacing,

  // Shadows
  shadows,
  createShadow,
  shadowNone,
  shadowXS,
  shadowSM,
  shadowMD,
  shadowLG,
  shadowXL,
  shadow2XL,
  cardShadows,
  buttonShadows,
  headerShadow,
  tabBarShadow,
  modalShadow,
  dropdownShadow,
  floatingActionShadow,
  imageShadow,
  avatarShadow,
  searchBarShadow,
  statusCardShadow,
  getShadow,
  getCustomShadow,
};

// ============================================================
// DEFAULT THEME EXPORT
// ============================================================

const theme = {
  light: lightTheme,

  dark: darkTheme,

  default: defaultTheme,

  create: createTheme,

  get: getTheme,

  constants: themeConstants,

  colors: {
    light: lightColors,
    dark: darkColors,
    brand: brandColors,
    neutral: neutralColors,
    status: statusColors,
    items: itemColors,
  },

  typography,

  spacing: {
    scale: spacing,
    radius: borderRadius,
    border: borderWidth,
    heights: componentHeight,
    widths: componentWidth,
    screen: screenSpacing,
    card: cardSpacing,
    form: formSpacing,
    button: buttonSpacing,
    list: listSpacing,
    grid: gridSpacing,
    modal: modalSpacing,
    badge: badgeSpacing,
    avatar: avatarSpacing,
    icons: iconSize,
    avatarSizes: avatarSize,
    buttonSizes: buttonSize,
    inputSizes: inputSize,
    layout,
    safeArea: safeAreaSpacing,
  },

  shadows,

  getStatusColor,

  getItemColor,

  getItemBackgroundColor,

  getStatusBackgroundColor,

  getTextColor,

  isDarkMode,
};

export default theme;
