// mobile/src/theme/colors.ts

// ============================================================
// COLOR TYPES
// ============================================================

export type ColorScheme = "light" | "dark";

export interface ThemeColors {
  // Brand
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  accent: string;
  accentLight: string;

  // Backgrounds
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  surface: string;
  surfaceElevated: string;
  surfaceSecondary: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textDisabled: string;
  textOnPrimary: string;

  // Borders
  border: string;
  borderLight: string;
  borderStrong: string;
  divider: string;
  outline: string;

  // Inputs
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;
  inputText: string;

  // Buttons
  buttonPrimary: string;
  buttonPrimaryPressed: string;
  buttonSecondary: string;
  buttonDisabled: string;

  // Status
  success: string;
  successLight: string;
  successBackground: string;
  warning: string;
  warningLight: string;
  warningBackground: string;
  error: string;
  errorLight: string;
  errorBackground: string;
  info: string;
  infoLight: string;
  infoBackground: string;

  // Item types
  lost: string;
  lostBackground: string;
  found: string;
  foundBackground: string;
  claimed: string;
  claimedBackground: string;
  returned: string;
  returnedBackground: string;
  pending: string;
  pendingBackground: string;

  // Navigation
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarInactive: string;
  tabBarActive: string;

  // Overlays
  overlay: string;
  modalBackground: string;
  backdrop: string;

  // Miscellaneous
  skeleton: string;
  skeletonHighlight: string;
  shimmer: string;
  shadow: string;
  transparent: string;
}

// ============================================================
// BRAND COLORS
// ============================================================

export const brandColors = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#60A5FA",
  primarySoft: "#DBEAFE",

  secondary: "#0F766E",
  secondaryDark: "#115E59",
  secondaryLight: "#5EEAD4",

  accent: "#F59E0B",
  accentLight: "#FDE68A",

  navy: "#172554",
  royalBlue: "#1E40AF",
  skyBlue: "#38BDF8",

  white: "#FFFFFF",
  black: "#000000",
} as const;

// ============================================================
// NEUTRAL COLORS
// ============================================================

export const neutralColors = {
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",
  black: "#000000",
} as const;

// ============================================================
// STATUS COLORS
// ============================================================

export const statusColors = {
  success: "#16A34A",
  successLight: "#4ADE80",
  successBackground: "#DCFCE7",

  warning: "#D97706",
  warningLight: "#FBBF24",
  warningBackground: "#FEF3C7",

  error: "#DC2626",
  errorLight: "#F87171",
  errorBackground: "#FEE2E2",

  info: "#2563EB",
  infoLight: "#60A5FA",
  infoBackground: "#DBEAFE",

  neutral: "#6B7280",
  neutralBackground: "#F3F4F6",
} as const;

// ============================================================
// LOST AND FOUND COLORS
// ============================================================

export const itemColors = {
  lost: "#DC2626",
  lostBackground: "#FEE2E2",

  found: "#16A34A",
  foundBackground: "#DCFCE7",

  claimed: "#7C3AED",
  claimedBackground: "#EDE9FE",

  returned: "#0F766E",
  returnedBackground: "#CCFBF1",

  pending: "#D97706",
  pendingBackground: "#FEF3C7",
} as const;

// ============================================================
// LIGHT THEME
// ============================================================

export const lightColors: ThemeColors = {
  // Brand
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#60A5FA",
  primarySoft: "#DBEAFE",

  secondary: "#0F766E",
  secondaryDark: "#115E59",
  secondaryLight: "#5EEAD4",

  accent: "#F59E0B",
  accentLight: "#FDE68A",

  // Backgrounds
  background: "#F8FAFC",
  backgroundSecondary: "#F1F5F9",
  backgroundTertiary: "#E2E8F0",

  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceSecondary: "#F8FAFC",

  // Text
  text: "#111827",
  textSecondary: "#4B5563",
  textTertiary: "#6B7280",
  textInverse: "#FFFFFF",
  textDisabled: "#9CA3AF",
  textOnPrimary: "#FFFFFF",

  // Borders
  border: "#E5E7EB",
  borderLight: "#F1F5F9",
  borderStrong: "#CBD5E1",
  divider: "#E5E7EB",
  outline: "#94A3B8",

  // Inputs
  inputBackground: "#FFFFFF",
  inputBorder: "#D1D5DB",
  inputPlaceholder: "#9CA3AF",
  inputText: "#111827",

  // Buttons
  buttonPrimary: "#2563EB",
  buttonPrimaryPressed: "#1D4ED8",
  buttonSecondary: "#E2E8F0",
  buttonDisabled: "#CBD5E1",

  // Status
  success: "#16A34A",
  successLight: "#4ADE80",
  successBackground: "#DCFCE7",

  warning: "#D97706",
  warningLight: "#FBBF24",
  warningBackground: "#FEF3C7",

  error: "#DC2626",
  errorLight: "#F87171",
  errorBackground: "#FEE2E2",

  info: "#2563EB",
  infoLight: "#60A5FA",
  infoBackground: "#DBEAFE",

  // Item types
  lost: "#DC2626",
  lostBackground: "#FEE2E2",

  found: "#16A34A",
  foundBackground: "#DCFCE7",

  claimed: "#7C3AED",
  claimedBackground: "#EDE9FE",

  returned: "#0F766E",
  returnedBackground: "#CCFBF1",

  pending: "#D97706",
  pendingBackground: "#FEF3C7",

  // Navigation
  tabBarBackground: "#FFFFFF",
  tabBarBorder: "#E5E7EB",
  tabBarInactive: "#9CA3AF",
  tabBarActive: "#2563EB",

  // Overlays
  overlay: "rgba(15, 23, 42, 0.45)",
  modalBackground: "#FFFFFF",
  backdrop: "rgba(15, 23, 42, 0.50)",

  // Miscellaneous
  skeleton: "#E5E7EB",
  skeletonHighlight: "#F8FAFC",
  shimmer: "#F1F5F9",
  shadow: "#0F172A",
  transparent: "transparent",
};

// ============================================================
// DARK THEME
// ============================================================

export const darkColors: ThemeColors = {
  // Brand
  primary: "#60A5FA",
  primaryDark: "#3B82F6",
  primaryLight: "#93C5FD",
  primarySoft: "#1E3A8A",

  secondary: "#2DD4BF",
  secondaryDark: "#14B8A6",
  secondaryLight: "#99F6E4",

  accent: "#FBBF24",
  accentLight: "#FDE68A",

  // Backgrounds
  background: "#0F172A",
  backgroundSecondary: "#111C31",
  backgroundTertiary: "#1E293B",

  surface: "#172033",
  surfaceElevated: "#1E293B",
  surfaceSecondary: "#1E293B",

  // Text
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textTertiary: "#94A3B8",
  textInverse: "#111827",
  textDisabled: "#64748B",
  textOnPrimary: "#0F172A",

  // Borders
  border: "#334155",
  borderLight: "#263449",
  borderStrong: "#475569",
  divider: "#334155",
  outline: "#64748B",

  // Inputs
  inputBackground: "#1E293B",
  inputBorder: "#475569",
  inputPlaceholder: "#94A3B8",
  inputText: "#F8FAFC",

  // Buttons
  buttonPrimary: "#3B82F6",
  buttonPrimaryPressed: "#2563EB",
  buttonSecondary: "#334155",
  buttonDisabled: "#475569",

  // Status
  success: "#4ADE80",
  successLight: "#86EFAC",
  successBackground: "#14532D",

  warning: "#FBBF24",
  warningLight: "#FDE68A",
  warningBackground: "#78350F",

  error: "#F87171",
  errorLight: "#FCA5A5",
  errorBackground: "#7F1D1D",

  info: "#60A5FA",
  infoLight: "#93C5FD",
  infoBackground: "#1E3A8A",

  // Item types
  lost: "#F87171",
  lostBackground: "#7F1D1D",

  found: "#4ADE80",
  foundBackground: "#14532D",

  claimed: "#C4B5FD",
  claimedBackground: "#4C1D95",

  returned: "#5EEAD4",
  returnedBackground: "#134E4A",

  pending: "#FBBF24",
  pendingBackground: "#78350F",

  // Navigation
  tabBarBackground: "#172033",
  tabBarBorder: "#334155",
  tabBarInactive: "#94A3B8",
  tabBarActive: "#60A5FA",

  // Overlays
  overlay: "rgba(0, 0, 0, 0.65)",
  modalBackground: "#1E293B",
  backdrop: "rgba(0, 0, 0, 0.70)",

  // Miscellaneous
  skeleton: "#334155",
  skeletonHighlight: "#475569",
  shimmer: "#263449",
  shadow: "#000000",
  transparent: "transparent",
};

// ============================================================
// COLOR PALETTE SELECTOR
// ============================================================

export function getColors(scheme: ColorScheme): ThemeColors {
  return scheme === "dark" ? darkColors : lightColors;
}

// ============================================================
// COLOR UTILITY
// ============================================================

export function withOpacity(color: string, opacity: number): string {
  const safeOpacity = Math.max(0, Math.min(1, opacity));

  const alpha = Math.round(safeOpacity * 255)
    .toString(16)
    .padStart(2, "0");

  if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return `${color}${alpha}`;
  }

  return color;
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  brand: brandColors,
  neutral: neutralColors,
  status: statusColors,
  items: itemColors,
  light: lightColors,
  dark: darkColors,
  getColors,
  withOpacity,
};
