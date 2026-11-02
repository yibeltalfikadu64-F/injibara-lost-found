// mobile/src/theme/typography.ts

import type { TextStyle } from "react-native";

// ============================================================
// FONT FAMILY
// ============================================================

export const fontFamily = {
  regular: "System",
  medium: "System",
  semiBold: "System",
  bold: "System",
  extraBold: "System",
  light: "System",
  monospace: "monospace",
} as const;

// ============================================================
// FONT SIZE
// ============================================================

export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
  "5xl": 36,
  "6xl": 40,
  "7xl": 48,
  "8xl": 56,
} as const;

// ============================================================
// FONT WEIGHT
// ============================================================

export const fontWeight = {
  light: "300",
  regular: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
  extraBold: "800",
  black: "900",
} as const satisfies Record<string, TextStyle["fontWeight"]>;

// ============================================================
// LINE HEIGHT
// ============================================================

export const lineHeight = {
  none: 1,
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.625,
  loose: 1.8,

  xs: 14,
  sm: 18,
  base: 22,
  md: 24,
  lg: 28,
  xl: 30,
  "2xl": 32,
  "3xl": 36,
  "4xl": 40,
  "5xl": 44,
  "6xl": 52,
} as const;

// ============================================================
// LETTER SPACING
// ============================================================

export const letterSpacing = {
  tighter: -1,
  tight: -0.5,
  normal: 0,
  wide: 0.3,
  wider: 0.5,
  widest: 1,
  extraWide: 1.5,
} as const;

// ============================================================
// FONT STYLE HELPERS
// ============================================================

type FontWeight = "300" | "400" | "500" | "600" | "700" | "800" | "900";

function createTextStyle(
  size: number,
  weight: FontWeight = "400",
  height?: number,
  spacing = 0,
): TextStyle {
  return {
    fontFamily: fontFamily.regular,
    fontSize: size,
    fontWeight: weight,
    lineHeight: height ? Math.round(size * height) : Math.round(size * 1.5),
    letterSpacing: spacing,
  };
}

// ============================================================
// DISPLAY STYLES
// ============================================================

export const display = {
  large: createTextStyle(48, "800", 1.15, -1.5),

  medium: createTextStyle(40, "800", 1.2, -1),

  small: createTextStyle(36, "700", 1.2, -0.8),
} as const;

// ============================================================
// HEADING STYLES
// ============================================================

export const heading = {
  h1: createTextStyle(32, "700", 1.25, -0.5),

  h2: createTextStyle(28, "700", 1.25, -0.4),

  h3: createTextStyle(24, "700", 1.3, -0.3),

  h4: createTextStyle(20, "700", 1.35),

  h5: createTextStyle(18, "600", 1.4),

  h6: createTextStyle(16, "600", 1.4),
} as const;

// ============================================================
// BODY TEXT STYLES
// ============================================================

export const body = {
  large: createTextStyle(18, "400", 1.6),

  medium: createTextStyle(16, "400", 1.5),

  regular: createTextStyle(14, "400", 1.5),

  small: createTextStyle(12, "400", 1.5),

  extraSmall: createTextStyle(10, "400", 1.4),
} as const;

// ============================================================
// LABEL STYLES
// ============================================================

export const label = {
  large: createTextStyle(16, "600", 1.4),

  medium: createTextStyle(14, "600", 1.4),

  small: createTextStyle(12, "600", 1.4),

  extraSmall: createTextStyle(10, "600", 1.3),
} as const;

// ============================================================
// BUTTON TEXT STYLES
// ============================================================

export const buttonText = {
  large: createTextStyle(18, "600", 1.3),

  medium: createTextStyle(16, "600", 1.3),

  small: createTextStyle(14, "600", 1.3),

  compact: createTextStyle(12, "600", 1.3),
} as const;

// ============================================================
// CAPTION STYLES
// ============================================================

export const caption = {
  regular: createTextStyle(12, "400", 1.4),

  medium: createTextStyle(12, "500", 1.4),

  strong: createTextStyle(12, "600", 1.4),

  tiny: createTextStyle(10, "400", 1.3),
} as const;

// ============================================================
// FORM TYPOGRAPHY
// ============================================================

export const formTypography = {
  label: createTextStyle(14, "600", 1.4),

  input: createTextStyle(16, "400", 1.5),

  placeholder: createTextStyle(16, "400", 1.5),

  helper: createTextStyle(12, "400", 1.4),

  error: createTextStyle(12, "500", 1.4),

  required: createTextStyle(14, "600", 1.4),
} as const;

// ============================================================
// CARD TYPOGRAPHY
// ============================================================

export const cardTypography = {
  title: createTextStyle(18, "700", 1.4),

  subtitle: createTextStyle(14, "400", 1.5),

  description: createTextStyle(14, "400", 1.5),

  metadata: createTextStyle(12, "400", 1.4),

  price: createTextStyle(20, "700", 1.3),
} as const;

// ============================================================
// NAVIGATION TYPOGRAPHY
// ============================================================

export const navigationTypography = {
  header: createTextStyle(20, "700", 1.4),

  tab: createTextStyle(11, "600", 1.3),

  drawerTitle: createTextStyle(18, "700", 1.4),

  drawerItem: createTextStyle(15, "500", 1.4),
} as const;

// ============================================================
// BADGE TYPOGRAPHY
// ============================================================

export const badgeTypography = {
  large: createTextStyle(13, "600", 1.3),

  medium: createTextStyle(12, "600", 1.3),

  small: createTextStyle(10, "600", 1.3),
} as const;

// ============================================================
// SCREEN TYPOGRAPHY
// ============================================================

export const screenTypography = {
  title: createTextStyle(28, "700", 1.3, -0.4),

  subtitle: createTextStyle(15, "400", 1.5),

  sectionTitle: createTextStyle(20, "700", 1.4),

  sectionDescription: createTextStyle(13, "400", 1.5),
} as const;

// ============================================================
// STATISTICS TYPOGRAPHY
// ============================================================

export const statisticsTypography = {
  value: createTextStyle(30, "800", 1.2, -0.5),

  label: createTextStyle(13, "500", 1.4),

  change: createTextStyle(12, "600", 1.3),
} as const;

// ============================================================
// MONOSPACE TYPOGRAPHY
// ============================================================

export const monospaceTypography = {
  code: {
    fontFamily: fontFamily.monospace,
    fontSize: 14,
    lineHeight: 21,
  } satisfies TextStyle,

  identifier: {
    fontFamily: fontFamily.monospace,
    fontSize: 12,
    lineHeight: 18,
  } satisfies TextStyle,
} as const;

// ============================================================
// COMPLETE TYPOGRAPHY SYSTEM
// ============================================================

export const typography = {
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

  form: formTypography,
  card: cardTypography,
  navigation: navigationTypography,
  badge: badgeTypography,
  screen: screenTypography,
  statistics: statisticsTypography,
  monospace: monospaceTypography,
} as const;

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default typography;
