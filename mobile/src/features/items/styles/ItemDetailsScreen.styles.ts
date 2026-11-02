// mobile/src/features/items/styles/ItemDetailsScreen.styles.ts

import { Dimensions, Platform, StyleSheet } from "react-native";

/* =========================================================
   SCREEN DIMENSIONS
========================================================= */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* =========================================================
   COLORS
========================================================= */

export const ItemDetailsColors = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#EFF6FF",

  success: "#16A34A",
  successLight: "#DCFCE7",

  danger: "#DC2626",
  dangerLight: "#FEE2E2",

  warning: "#D97706",
  warningLight: "#FEF3C7",

  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceSecondary: "#F1F5F9",

  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  border: "#E2E8F0",
  divider: "#F1F5F9",

  white: "#FFFFFF",
  black: "#020617",

  overlay: "rgba(2, 6, 23, 0.55)",
};

/* =========================================================
   SPACING
========================================================= */

export const ItemDetailsSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/* =========================================================
   TYPOGRAPHY
========================================================= */

export const ItemDetailsTypography = {
  tiny: 9,
  small: 10,
  caption: 11,
  body: 13,
  subtitle: 15,
  heading: 18,
  title: 22,
  largeTitle: 27,
};

/* =========================================================
   SHADOWS
========================================================= */

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  android: {
    elevation: 2,
  },

  default: {},
});

/* =========================================================
   MAIN STYLES
========================================================= */

const styles = StyleSheet.create({
  /* -------------------------------------------------------
     SCREEN
  ------------------------------------------------------- */

  container: {
    flex: 1,
    backgroundColor: ItemDetailsColors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 35,
  },

  content: {
    paddingHorizontal: 17,
  },

  section: {
    marginTop: 17,
    padding: 16,
    borderRadius: 16,
    backgroundColor: ItemDetailsColors.surface,
    borderWidth: 1,
    borderColor: ItemDetailsColors.border,
    ...cardShadow,
  },

  sectionWithoutCard: {
    marginTop: 20,
    paddingHorizontal: 17,
  },

  /* -------------------------------------------------------
     HEADER
  ------------------------------------------------------- */

  header: {
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: ItemDetailsColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: ItemDetailsColors.border,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ItemDetailsColors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },

  headerBackText: {
    fontSize: 23,
    color: ItemDetailsColors.text,
    lineHeight: 26,
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: ItemDetailsTypography.subtitle,
    fontWeight: "900",
    color: ItemDetailsColors.text,
  },

  headerSubtitle: {
    fontSize: ItemDetailsTypography.tiny,
    color: ItemDetailsColors.textSecondary,
    marginTop: 3,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerActionButton: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: ItemDetailsColors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },

  headerActionText: {
    fontSize: 17,
    color: ItemDetailsColors.text,
  },

  /* -------------------------------------------------------
     IMAGE GALLERY
  ------------------------------------------------------- */

  galleryContainer: {
    width: SCREEN_WIDTH,
    backgroundColor: ItemDetailsColors.surfaceSecondary,
  },

  galleryImage: {
    width: SCREEN_WIDTH,
    height: 285,
    resizeMode: "cover",
  },

  galleryPlaceholder: {
    width: SCREEN_WIDTH,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ItemDetailsColors.surfaceSecondary,
  },

  galleryPlaceholderIcon: {
    fontSize: 45,
    marginBottom: 10,
  },

  galleryPlaceholderText: {
    fontSize: ItemDetailsTypography.caption,
    fontWeight: "700",
    color: ItemDetailsColors.textSecondary,
  },

  galleryCounter: {
    position: "absolute",
    right: 15,
    bottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: ItemDetailsColors.overlay,
  },

  galleryCounterText: {
    color: ItemDetailsColors.white,
    fontSize: ItemDetailsTypography.small,
    fontWeight: "800",
  },

  galleryThumbnailList: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 9,
  },

  galleryThumbnail: {
    width: 58,
    height: 58,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },

  galleryThumbnailActive: {
    borderColor: ItemDetailsColors.primary,
  },

  galleryThumbnailImage: {
    width: "100%",
    height: "100%",
  },

  /* -------------------------------------------------------
     ITEM HEADING
  ------------------------------------------------------- */

  itemHeading: {
    marginTop: 18,
  },

  itemTitle: {
    fontSize: ItemDetailsTypography.title,
    lineHeight: 30,
    fontWeight: "900",
    color: ItemDetailsColors.text,
  },

  itemReference: {
    fontSize: ItemDetailsTypography.small,
    color: ItemDetailsColors.textMuted,
    marginTop: 7,
  },

  itemHeadingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  itemHeadingContent: {
    flex: 1,
  },

  itemBadgeContainer: {
    alignSelf: "flex-start",
    marginTop: 12,
  },

  itemTypeBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
  },

  lostBadge: {
    backgroundColor: ItemDetailsColors.dangerLight,
  },

  foundBadge: {
    backgroundColor: ItemDetailsColors.successLight,
  },

  itemTypeText: {
    fontSize: ItemDetailsTypography.tiny,
    fontWeight: "900",
  },

  lostBadgeText: {
    color: ItemDetailsColors.danger,
  },

  foundBadgeText: {
    color: ItemDetailsColors.success,
  },

  /* -------------------------------------------------------
     STATUS
  ------------------------------------------------------- */

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 14,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  statusText: {
    fontSize: ItemDetailsTypography.small,
    fontWeight: "800",
  },

  categoryBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: ItemDetailsColors.primaryLight,
  },

  categoryText: {
    fontSize: ItemDetailsTypography.small,
    fontWeight: "800",
    color: ItemDetailsColors.primary,
  },

  /* -------------------------------------------------------
     SECTION HEADINGS
  ------------------------------------------------------- */

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionHeadingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  sectionHeadingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: ItemDetailsColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionHeadingIconText: {
    fontSize: 16,
    color: ItemDetailsColors.primary,
  },

  sectionTitle: {
    fontSize: ItemDetailsTypography.subtitle,
    fontWeight: "900",
    color: ItemDetailsColors.text,
  },

  sectionSubtitle: {
    fontSize: ItemDetailsTypography.tiny,
    color: ItemDetailsColors.textSecondary,
    marginTop: 4,
  },

  /* -------------------------------------------------------
     DESCRIPTION
  ------------------------------------------------------- */

  descriptionContainer: {
    marginTop: 19,
  },

  descriptionText: {
    fontSize: ItemDetailsTypography.body,
    lineHeight: 22,
    color: ItemDetailsColors.textSecondary,
  },

  readMoreButton: {
    alignSelf: "flex-start",
    marginTop: 9,
    paddingVertical: 4,
  },

  readMoreText: {
    fontSize: ItemDetailsTypography.caption,
    fontWeight: "900",
    color: ItemDetailsColors.primary,
  },

  /* -------------------------------------------------------
     ITEM INFORMATION
  ------------------------------------------------------- */

  infoList: {
    marginTop: 7,
  },

  infoRow: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: ItemDetailsColors.divider,
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoIconContainer: {
    width: 37,
    height: 37,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ItemDetailsColors.surfaceSecondary,
    marginRight: 12,
  },

  infoIcon: {
    fontSize: 16,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: ItemDetailsTypography.tiny,
    color: ItemDetailsColors.textMuted,
    marginBottom: 5,
  },

  infoValue: {
    fontSize: ItemDetailsTypography.caption,
    fontWeight: "800",
    color: ItemDetailsColors.text,
  },

  infoArrow: {
    fontSize: 19,
    color: ItemDetailsColors.textMuted,
    marginLeft: 8,
  },

  /* -------------------------------------------------------
     IDENTIFYING FEATURES
  ------------------------------------------------------- */

  featuresContainer: {
    padding: 14,
    borderRadius: 13,
    backgroundColor: ItemDetailsColors.warningLight,
    marginTop: 17,
  },

  featuresTitle: {
    fontSize: ItemDetailsTypography.caption,
    fontWeight: "900",
    color: "#92400E",
    marginBottom: 8,
  },

  featuresText: {
    fontSize: ItemDetailsTypography.small,
    lineHeight: 18,
    color: "#92400E",
  },

  /* -------------------------------------------------------
     REPORTER
  ------------------------------------------------------- */

  reporterContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: ItemDetailsColors.surfaceSecondary,
    marginTop: 18,
  },

  reporterAvatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: ItemDetailsColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  reporterAvatarText: {
    fontSize: 15,
    fontWeight: "900",
    color: ItemDetailsColors.primary,
  },

  reporterDetails: {
    flex: 1,
    marginLeft: 11,
  },

  reporterLabel: {
    fontSize: ItemDetailsTypography.tiny,
    color: ItemDetailsColors.textSecondary,
  },

  reporterName: {
    fontSize: ItemDetailsTypography.caption,
    fontWeight: "900",
    color: ItemDetailsColors.text,
    marginTop: 4,
  },

  reporterDepartment: {
    fontSize: ItemDetailsTypography.tiny,
    color: ItemDetailsColors.textSecondary,
    marginTop: 4,
  },

  /* -------------------------------------------------------
     CLAIM INFORMATION
  ------------------------------------------------------- */

  claimCard: {
    padding: 15,
    borderRadius: 14,
    backgroundColor: ItemDetailsColors.primaryLight,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginTop: 18,
  },

  claimCardTitle: {
    fontSize: ItemDetailsTypography.subtitle,
    fontWeight: "900",
    color: ItemDetailsColors.text,
  },

  claimCardDescription: {
    fontSize: ItemDetailsTypography.small,
    lineHeight: 18,
    color: ItemDetailsColors.textSecondary,
    marginTop: 8,
  },

  claimStatus: {
    alignSelf: "flex-start",
    marginTop: 11,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: ItemDetailsColors.white,
  },

  claimStatusText: {
    fontSize: ItemDetailsTypography.tiny,
    fontWeight: "900",
    color: ItemDetailsColors.primary,
  },

  /* -------------------------------------------------------
     TIMELINE
  ------------------------------------------------------- */

  timelineContainer: {
    marginTop: 18,
  },

  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  timelineEvent: {
    flexDirection: "row",
    minHeight: 85,
  },

  timelineColumn: {
    width: 31,
    alignItems: "center",
  },

  timelineDot: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: ItemDetailsColors.primary,
    backgroundColor: ItemDetailsColors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  timelineDotText: {
    color: ItemDetailsColors.white,
    fontSize: 10,
    fontWeight: "900",
  },

  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 55,
    backgroundColor: ItemDetailsColors.border,
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },

  timelineTitle: {
    fontSize: ItemDetailsTypography.caption,
    fontWeight: "900",
    color: ItemDetailsColors.text,
  },

  timelineDescription: {
    fontSize: ItemDetailsTypography.small,
    lineHeight: 17,
    color: ItemDetailsColors.textSecondary,
    marginTop: 5,
  },

  timelineDate: {
    fontSize: ItemDetailsTypography.tiny,
    color: ItemDetailsColors.textMuted,
    marginTop: 6,
  },

  /* -------------------------------------------------------
     ACTION BUTTONS
  ------------------------------------------------------- */

  actionContainer: {
    paddingHorizontal: 17,
    paddingTop: 13,
    paddingBottom: Platform.OS === "ios" ? 25 : 15,
    backgroundColor: ItemDetailsColors.surface,
    borderTopWidth: 1,
    borderTopColor: ItemDetailsColors.border,
  },

  primaryActionButton: {
    minHeight: 51,
    borderRadius: 13,
    backgroundColor: ItemDetailsColors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 15,
  },

  primaryActionText: {
    color: ItemDetailsColors.white,
    fontSize: ItemDetailsTypography.caption,
    fontWeight: "900",
  },

  secondaryActionButton: {
    minHeight: 49,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: ItemDetailsColors.primary,
    backgroundColor: ItemDetailsColors.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
  },

  secondaryActionText: {
    color: ItemDetailsColors.primary,
    fontSize: ItemDetailsTypography.caption,
    fontWeight: "900",
  },

  dangerActionButton: {
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: ItemDetailsColors.danger,
    backgroundColor: ItemDetailsColors.dangerLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
  },

  dangerActionText: {
    color: ItemDetailsColors.danger,
    fontSize: ItemDetailsTypography.caption,
    fontWeight: "900",
  },

  disabledActionButton: {
    opacity: 0.5,
  },

  actionButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ItemDetailsColors.background,
    padding: 25,
  },

  loadingText: {
    fontSize: ItemDetailsTypography.caption,
    color: ItemDetailsColors.textSecondary,
    marginTop: 13,
  },

  loadingPlaceholder: {
    height: 240,
    borderRadius: 15,
    backgroundColor: ItemDetailsColors.surfaceSecondary,
    marginBottom: 15,
  },

  /* -------------------------------------------------------
     ERROR
  ------------------------------------------------------- */

  errorContainer: {
    flex: 1,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ItemDetailsColors.background,
  },

  errorIcon: {
    fontSize: 45,
    marginBottom: 14,
  },

  errorTitle: {
    fontSize: ItemDetailsTypography.heading,
    fontWeight: "900",
    color: ItemDetailsColors.text,
    textAlign: "center",
  },

  errorDescription: {
    fontSize: ItemDetailsTypography.caption,
    lineHeight: 19,
    color: ItemDetailsColors.textSecondary,
    textAlign: "center",
    marginTop: 9,
  },

  retryButton: {
    minWidth: 145,
    minHeight: 45,
    paddingHorizontal: 20,
    borderRadius: 11,
    backgroundColor: ItemDetailsColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 19,
  },

  retryButtonText: {
    fontSize: ItemDetailsTypography.caption,
    fontWeight: "900",
    color: ItemDetailsColors.white,
  },

  /* -------------------------------------------------------
     EMPTY STATE
  ------------------------------------------------------- */

  emptyContainer: {
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: ItemDetailsTypography.subtitle,
    fontWeight: "900",
    color: ItemDetailsColors.text,
  },

  emptyDescription: {
    fontSize: ItemDetailsTypography.small,
    lineHeight: 17,
    color: ItemDetailsColors.textSecondary,
    textAlign: "center",
    marginTop: 7,
  },

  /* -------------------------------------------------------
     FOOTER
  ------------------------------------------------------- */

  footer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  footerText: {
    fontSize: ItemDetailsTypography.tiny,
    color: ItemDetailsColors.textMuted,
    textAlign: "center",
    lineHeight: 16,
  },

  /* -------------------------------------------------------
     RESPONSIVE
  ------------------------------------------------------- */

  responsiveContent: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },

  responsiveGallery: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const itemDetailsStyles = styles;

export default styles;
