// mobile/src/theme/shadows.ts

import { Platform } from "react-native";

import type { ViewStyle } from "react-native";

// ============================================================
// SHADOW TYPES
// ============================================================

export interface ShadowConfiguration {
  color?: string;

  opacity?: number;

  radius?: number;

  offsetX?: number;

  offsetY?: number;

  elevation?: number;
}

// ============================================================
// SHADOW COLOR
// ============================================================

const DEFAULT_SHADOW_COLOR = "#0F172A";

// ============================================================
// SHADOW GENERATOR
// ============================================================

export function createShadow(
  configuration: ShadowConfiguration = {},
): ViewStyle {
  const {
    color = DEFAULT_SHADOW_COLOR,
    opacity = 0.12,
    radius = 8,
    offsetX = 0,
    offsetY = 4,
    elevation = 4,
  } = configuration;

  if (Platform.OS === "android") {
    return {
      elevation,
      shadowColor: color,
    };
  }

  return {
    shadowColor: color,
    shadowOffset: {
      width: offsetX,
      height: offsetY,
    },
    shadowOpacity: opacity,
    shadowRadius: radius,
  };
}

// ============================================================
// NO SHADOW
// ============================================================

export const shadowNone: ViewStyle = {
  shadowColor: "transparent",
  shadowOffset: {
    width: 0,
    height: 0,
  },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};

// ============================================================
// EXTRA SMALL SHADOW
// ============================================================

export const shadowXS: ViewStyle = createShadow({
  opacity: 0.06,
  radius: 2,
  offsetY: 1,
  elevation: 1,
});

// ============================================================
// SMALL SHADOW
// ============================================================

export const shadowSM: ViewStyle = createShadow({
  opacity: 0.08,
  radius: 4,
  offsetY: 2,
  elevation: 2,
});

// ============================================================
// MEDIUM SHADOW
// ============================================================

export const shadowMD: ViewStyle = createShadow({
  opacity: 0.12,
  radius: 8,
  offsetY: 4,
  elevation: 4,
});

// ============================================================
// LARGE SHADOW
// ============================================================

export const shadowLG: ViewStyle = createShadow({
  opacity: 0.15,
  radius: 12,
  offsetY: 6,
  elevation: 8,
});

// ============================================================
// EXTRA LARGE SHADOW
// ============================================================

export const shadowXL: ViewStyle = createShadow({
  opacity: 0.18,
  radius: 20,
  offsetY: 10,
  elevation: 12,
});

// ============================================================
// DOUBLE EXTRA LARGE SHADOW
// ============================================================

export const shadow2XL: ViewStyle = createShadow({
  opacity: 0.22,
  radius: 28,
  offsetY: 14,
  elevation: 16,
});

// ============================================================
// CARD SHADOWS
// ============================================================

export const cardShadows = {
  flat: shadowNone,

  subtle: shadowXS,

  normal: shadowSM,

  elevated: shadowMD,

  prominent: shadowLG,

  floating: shadowXL,
} as const;

// ============================================================
// BUTTON SHADOWS
// ============================================================

export const buttonShadows = {
  none: shadowNone,

  subtle: createShadow({
    opacity: 0.08,
    radius: 3,
    offsetY: 2,
    elevation: 2,
  }),

  primary: createShadow({
    color: "#2563EB",
    opacity: 0.24,
    radius: 8,
    offsetY: 4,
    elevation: 5,
  }),

  success: createShadow({
    color: "#16A34A",
    opacity: 0.2,
    radius: 8,
    offsetY: 4,
    elevation: 5,
  }),

  danger: createShadow({
    color: "#DC2626",
    opacity: 0.2,
    radius: 8,
    offsetY: 4,
    elevation: 5,
  }),
} as const;

// ============================================================
// HEADER SHADOW
// ============================================================

export const headerShadow: ViewStyle = createShadow({
  opacity: 0.06,
  radius: 5,
  offsetY: 2,
  elevation: 3,
});

// ============================================================
// TAB BAR SHADOW
// ============================================================

export const tabBarShadow: ViewStyle = createShadow({
  opacity: 0.1,
  radius: 8,
  offsetY: -3,
  elevation: 8,
});

// ============================================================
// MODAL SHADOW
// ============================================================

export const modalShadow: ViewStyle = createShadow({
  opacity: 0.2,
  radius: 24,
  offsetY: 12,
  elevation: 18,
});

// ============================================================
// DROPDOWN SHADOW
// ============================================================

export const dropdownShadow: ViewStyle = createShadow({
  opacity: 0.12,
  radius: 10,
  offsetY: 5,
  elevation: 7,
});

// ============================================================
// FLOATING ACTION BUTTON SHADOW
// ============================================================

export const floatingActionShadow: ViewStyle = createShadow({
  color: "#1D4ED8",
  opacity: 0.25,
  radius: 12,
  offsetY: 6,
  elevation: 8,
});

// ============================================================
// IMAGE SHADOW
// ============================================================

export const imageShadow: ViewStyle = createShadow({
  opacity: 0.1,
  radius: 8,
  offsetY: 4,
  elevation: 4,
});

// ============================================================
// AVATAR SHADOW
// ============================================================

export const avatarShadow: ViewStyle = createShadow({
  opacity: 0.12,
  radius: 6,
  offsetY: 3,
  elevation: 3,
});

// ============================================================
// SEARCH BAR SHADOW
// ============================================================

export const searchBarShadow: ViewStyle = createShadow({
  opacity: 0.05,
  radius: 6,
  offsetY: 2,
  elevation: 2,
});

// ============================================================
// STATUS CARD SHADOW
// ============================================================

export const statusCardShadow: ViewStyle = createShadow({
  opacity: 0.07,
  radius: 8,
  offsetY: 3,
  elevation: 3,
});

// ============================================================
// SHADOW PRESETS
// ============================================================

export const shadows = {
  none: shadowNone,

  xs: shadowXS,
  sm: shadowSM,
  md: shadowMD,
  lg: shadowLG,
  xl: shadowXL,
  "2xl": shadow2XL,

  card: cardShadows,
  button: buttonShadows,

  header: headerShadow,
  tabBar: tabBarShadow,
  modal: modalShadow,
  dropdown: dropdownShadow,

  floatingAction: floatingActionShadow,
  image: imageShadow,
  avatar: avatarShadow,
  searchBar: searchBarShadow,
  statusCard: statusCardShadow,
} as const;

// ============================================================
// GET SHADOW BY LEVEL
// ============================================================

export type ShadowLevel = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export function getShadow(level: ShadowLevel): ViewStyle {
  switch (level) {
    case "none":
      return shadowNone;

    case "xs":
      return shadowXS;

    case "sm":
      return shadowSM;

    case "md":
      return shadowMD;

    case "lg":
      return shadowLG;

    case "xl":
      return shadowXL;

    case "2xl":
      return shadow2XL;

    default:
      return shadowNone;
  }
}

// ============================================================
// CUSTOM SHADOW
// ============================================================

export function getCustomShadow(
  opacity: number,
  radius: number,
  offsetY: number,
  elevation: number,
  color = DEFAULT_SHADOW_COLOR,
): ViewStyle {
  return createShadow({
    color,
    opacity,
    radius,
    offsetY,
    elevation,
  });
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default shadows;
