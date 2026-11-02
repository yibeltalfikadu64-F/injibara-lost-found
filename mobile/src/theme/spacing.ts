// mobile/src/theme/spacing.ts

// ============================================================
// SPACING SCALE
// Base unit: 4 points
// ============================================================

export const spacing = {
  none: 0,

  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
  "6xl": 64,
  "7xl": 72,
  "8xl": 80,
  "9xl": 96,
  "10xl": 112,
  "11xl": 128,
} as const;

// ============================================================
// BORDER RADIUS
// ============================================================

export const borderRadius = {
  none: 0,

  xs: 2,
  sm: 4,
  md: 8,
  base: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,

  round: 999,
  full: 9999,
} as const;

// ============================================================
// COMPONENT HEIGHTS
// ============================================================

export const componentHeight = {
  // Buttons
  buttonSmall: 36,
  buttonMedium: 44,
  buttonLarge: 52,
  buttonExtraLarge: 60,

  // Inputs
  inputSmall: 40,
  inputMedium: 48,
  inputLarge: 56,

  // Navigation
  header: 56,
  headerLarge: 64,
  tabBar: 64,
  bottomNavigation: 72,

  // Lists
  listItemSmall: 48,
  listItemMedium: 64,
  listItemLarge: 80,

  // Badges
  badgeSmall: 20,
  badgeMedium: 24,
  badgeLarge: 30,

  // Avatars
  avatarSmall: 32,
  avatarMedium: 44,
  avatarLarge: 56,
  avatarExtraLarge: 72,
  avatarProfile: 104,

  // Icons
  iconSmall: 16,
  iconMedium: 20,
  iconLarge: 24,
  iconExtraLarge: 32,

  // Search
  searchBar: 48,

  // Cards
  cardMinimum: 100,
} as const;

// ============================================================
// COMPONENT WIDTHS
// ============================================================

export const componentWidth = {
  buttonSmall: 96,
  buttonMedium: 140,
  buttonLarge: 180,

  iconButton: 44,
  iconButtonSmall: 36,

  avatarSmall: 32,
  avatarMedium: 44,
  avatarLarge: 56,

  drawer: 280,
  modalSmall: 280,
  modalMedium: 340,
  modalLarge: 420,

  inputMinimum: 120,
} as const;

// ============================================================
// SCREEN SPACING
// ============================================================

export const screenSpacing = {
  horizontal: 20,
  horizontalSmall: 16,
  horizontalLarge: 24,

  vertical: 20,
  verticalSmall: 12,
  verticalLarge: 32,

  top: 16,
  bottom: 24,

  sectionGap: 28,
  sectionTitleBottom: 12,

  headerBottom: 20,
  contentTop: 16,

  cardGap: 16,
  listGap: 12,
} as const;

// ============================================================
// CARD SPACING
// ============================================================

export const cardSpacing = {
  padding: 16,
  paddingSmall: 12,
  paddingLarge: 20,

  horizontal: 16,
  vertical: 16,

  gap: 12,
  contentGap: 8,

  imageGap: 12,

  titleBottom: 8,
  descriptionBottom: 12,

  footerTop: 12,
} as const;

// ============================================================
// FORM SPACING
// ============================================================

export const formSpacing = {
  fieldGap: 18,
  fieldGapSmall: 12,
  fieldGapLarge: 24,

  labelBottom: 8,
  inputPaddingHorizontal: 14,
  inputPaddingVertical: 12,

  helperTop: 6,
  errorTop: 6,

  sectionGap: 28,

  buttonTop: 20,
  buttonBottom: 12,

  groupGap: 16,
} as const;

// ============================================================
// BUTTON SPACING
// ============================================================

export const buttonSpacing = {
  smallHorizontal: 12,
  smallVertical: 8,

  mediumHorizontal: 18,
  mediumVertical: 12,

  largeHorizontal: 24,
  largeVertical: 16,

  iconGap: 8,

  groupGap: 12,
} as const;

// ============================================================
// LIST SPACING
// ============================================================

export const listSpacing = {
  itemGap: 12,
  itemPadding: 12,
  itemPaddingHorizontal: 16,

  separatorHeight: 1,

  sectionGap: 24,

  headerBottom: 12,
  footerTop: 16,

  emptyStateTop: 48,
  emptyStateBottom: 48,
} as const;

// ============================================================
// GRID SPACING
// ============================================================

export const gridSpacing = {
  gap: 12,
  columnGap: 12,
  rowGap: 16,

  twoColumnGap: 12,
  threeColumnGap: 8,

  cardPadding: 12,
} as const;

// ============================================================
// MODAL SPACING
// ============================================================

export const modalSpacing = {
  padding: 24,
  paddingSmall: 16,
  paddingLarge: 32,

  headerBottom: 16,
  contentGap: 16,
  footerTop: 24,

  buttonGap: 12,

  closeButtonOffset: 12,
} as const;

// ============================================================
// BADGE SPACING
// ============================================================

export const badgeSpacing = {
  smallHorizontal: 6,
  smallVertical: 3,

  mediumHorizontal: 10,
  mediumVertical: 5,

  largeHorizontal: 12,
  largeVertical: 7,

  iconGap: 4,
} as const;

// ============================================================
// AVATAR SPACING
// ============================================================

export const avatarSpacing = {
  borderWidth: 2,
  iconPadding: 8,

  groupOverlap: 12,

  statusIndicatorSize: 12,
  statusIndicatorBorder: 2,
} as const;

// ============================================================
// BORDER WIDTH
// ============================================================

export const borderWidth = {
  none: 0,
  hairline: 0.5,
  thin: 1,
  medium: 1.5,
  thick: 2,
  heavy: 3,
} as const;

// ============================================================
// ICON SIZES
// ============================================================

export const iconSize = {
  tiny: 12,
  small: 16,
  medium: 20,
  default: 24,
  large: 28,
  extraLarge: 32,
  huge: 40,
  massive: 48,
} as const;

// ============================================================
// AVATAR SIZES
// ============================================================

export const avatarSize = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 56,
  xl: 72,
  "2xl": 96,
  "3xl": 120,
} as const;

// ============================================================
// BUTTON SIZES
// ============================================================

export const buttonSize = {
  small: {
    height: componentHeight.buttonSmall,
    paddingHorizontal: buttonSpacing.smallHorizontal,
    borderRadius: borderRadius.md,
  },

  medium: {
    height: componentHeight.buttonMedium,
    paddingHorizontal: buttonSpacing.mediumHorizontal,
    borderRadius: borderRadius.base,
  },

  large: {
    height: componentHeight.buttonLarge,
    paddingHorizontal: buttonSpacing.largeHorizontal,
    borderRadius: borderRadius.lg,
  },

  extraLarge: {
    height: componentHeight.buttonExtraLarge,
    paddingHorizontal: buttonSpacing.largeHorizontal,
    borderRadius: borderRadius.lg,
  },
} as const;

// ============================================================
// INPUT SIZES
// ============================================================

export const inputSize = {
  small: {
    height: componentHeight.inputSmall,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
  },

  medium: {
    height: componentHeight.inputMedium,
    paddingHorizontal: 14,
    borderRadius: borderRadius.base,
  },

  large: {
    height: componentHeight.inputLarge,
    paddingHorizontal: 16,
    borderRadius: borderRadius.lg,
  },
} as const;

// ============================================================
// LAYOUT CONSTANTS
// ============================================================

export const layout = {
  maxContentWidth: 1200,
  maxFormWidth: 520,
  maxModalWidth: 480,

  drawerWidth: 280,

  headerHeight: componentHeight.header,
  tabBarHeight: componentHeight.tabBar,

  minimumTouchTarget: 44,

  screenHorizontalPadding: screenSpacing.horizontal,
  screenVerticalPadding: screenSpacing.vertical,

  cardRadius: borderRadius.lg,
  buttonRadius: borderRadius.base,
  inputRadius: borderRadius.base,

  dividerThickness: borderWidth.thin,
} as const;

// ============================================================
// SAFE AREA SPACING
// ============================================================

export const safeAreaSpacing = {
  top: 0,
  bottom: 0,

  additionalTop: 8,
  additionalBottom: 16,

  tabBarBottom: 8,
} as const;

// ============================================================
// COMPLETE SPACING SYSTEM
// ============================================================

const spacingSystem = {
  spacing,
  borderRadius,
  borderWidth,

  componentHeight,
  componentWidth,

  screen: screenSpacing,
  card: cardSpacing,
  form: formSpacing,
  button: buttonSpacing,
  list: listSpacing,
  grid: gridSpacing,
  modal: modalSpacing,
  badge: badgeSpacing,
  avatar: avatarSpacing,

  iconSize,
  avatarSize,
  buttonSize,
  inputSize,

  layout,
  safeArea: safeAreaSpacing,
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default spacingSystem;
