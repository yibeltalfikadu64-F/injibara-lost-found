// mobile/src/features/search/styles/SearchScreen.styles.ts

import { Dimensions, Platform, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* =========================================================
   COLORS
========================================================= */

export const SearchColors = {
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
};

/* =========================================================
   SHADOW
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
    backgroundColor: SearchColors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 35,
  },

  contentWrapper: {
    width: "100%",
    maxWidth: 850,
    alignSelf: "center",
  },

  contentPadding: {
    paddingHorizontal: 17,
  },

  /* -------------------------------------------------------
     HEADER
  ------------------------------------------------------- */

  header: {
    minHeight: 70,
    backgroundColor: SearchColors.surface,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: SearchColors.border,
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: SearchColors.text,
  },

  headerSubtitle: {
    fontSize: 10,
    color: SearchColors.textSecondary,
    marginTop: 5,
  },

  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: SearchColors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },

  headerActionText: {
    fontSize: 19,
    color: SearchColors.text,
  },

  /* -------------------------------------------------------
     SEARCH AREA
  ------------------------------------------------------- */

  searchArea: {
    paddingHorizontal: 17,
    paddingTop: 18,
    paddingBottom: 17,
    backgroundColor: SearchColors.surface,
  },

  searchHint: {
    fontSize: 10,
    color: SearchColors.textSecondary,
    marginTop: 9,
    marginLeft: 3,
  },

  /* -------------------------------------------------------
     QUICK TYPE FILTER
  ------------------------------------------------------- */

  typeFilterContainer: {
    paddingHorizontal: 17,
    paddingTop: 15,
    paddingBottom: 12,
    backgroundColor: SearchColors.surface,
  },

  typeFilterHeading: {
    fontSize: 13,
    fontWeight: "900",
    color: SearchColors.text,
    marginBottom: 11,
  },

  typeFilterList: {
    flexDirection: "row",
    gap: 9,
  },

  typeFilterButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: SearchColors.border,
    backgroundColor: SearchColors.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },

  typeFilterButtonSelected: {
    backgroundColor: SearchColors.primary,
    borderColor: SearchColors.primary,
  },

  typeFilterText: {
    fontSize: 10,
    fontWeight: "800",
    color: SearchColors.textSecondary,
  },

  typeFilterTextSelected: {
    color: SearchColors.white,
  },

  /* -------------------------------------------------------
     CATEGORY AREA
  ------------------------------------------------------- */

  categoryContainer: {
    paddingHorizontal: 17,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: SearchColors.surface,
  },

  categoryDivider: {
    height: 1,
    backgroundColor: SearchColors.divider,
  },

  /* -------------------------------------------------------
     RESULT HEADER
  ------------------------------------------------------- */

  resultsHeader: {
    paddingHorizontal: 17,
    paddingTop: 21,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultsHeadingContainer: {
    flex: 1,
  },

  resultsTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: SearchColors.text,
  },

  resultsSubtitle: {
    fontSize: 10,
    color: SearchColors.textSecondary,
    marginTop: 4,
  },

  resultsCount: {
    minWidth: 35,
    height: 29,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: SearchColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  resultsCountText: {
    fontSize: 11,
    fontWeight: "900",
    color: SearchColors.primary,
  },

  /* -------------------------------------------------------
     ACTIVE FILTERS
  ------------------------------------------------------- */

  activeFiltersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 17,
    paddingBottom: 13,
    gap: 7,
  },

  activeFilterChip: {
    minHeight: 29,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: SearchColors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
  },

  activeFilterText: {
    fontSize: 9,
    fontWeight: "800",
    color: SearchColors.primary,
  },

  activeFilterRemove: {
    fontSize: 14,
    color: SearchColors.primary,
    marginLeft: 6,
  },

  clearFiltersButton: {
    minHeight: 29,
    paddingHorizontal: 9,
    justifyContent: "center",
  },

  clearFiltersText: {
    fontSize: 9,
    fontWeight: "900",
    color: SearchColors.danger,
  },

  /* -------------------------------------------------------
     ITEM LIST
  ------------------------------------------------------- */

  itemList: {
    paddingHorizontal: 17,
    gap: 13,
  },

  itemCard: {
    backgroundColor: SearchColors.surface,
    borderWidth: 1,
    borderColor: SearchColors.border,
    borderRadius: 16,
    overflow: "hidden",
    ...cardShadow,
  },

  itemCardContent: {
    flexDirection: "row",
    padding: 11,
  },

  itemImageContainer: {
    width: 106,
    height: 111,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: SearchColors.surfaceSecondary,
  },

  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  itemImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  itemImagePlaceholderIcon: {
    fontSize: 29,
  },

  itemImagePlaceholderText: {
    fontSize: 8,
    color: SearchColors.textMuted,
    marginTop: 5,
  },

  itemDetails: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "center",
  },

  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },

  itemTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
    color: SearchColors.text,
    lineHeight: 18,
  },

  itemDescription: {
    fontSize: 10,
    lineHeight: 16,
    color: SearchColors.textSecondary,
    marginTop: 6,
  },

  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },

  itemMetaText: {
    fontSize: 9,
    color: SearchColors.textSecondary,
  },

  itemMetaIcon: {
    fontSize: 10,
    marginRight: 3,
  },

  itemBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 9,
  },

  itemDate: {
    fontSize: 8,
    color: SearchColors.textMuted,
  },

  itemArrow: {
    fontSize: 17,
    fontWeight: "900",
    color: SearchColors.primary,
  },

  /* -------------------------------------------------------
     ITEM BADGES
  ------------------------------------------------------- */

  itemTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    alignSelf: "flex-start",
  },

  lostBadge: {
    backgroundColor: SearchColors.dangerLight,
  },

  foundBadge: {
    backgroundColor: SearchColors.successLight,
  },

  lostBadgeText: {
    color: SearchColors.danger,
  },

  foundBadgeText: {
    color: SearchColors.success,
  },

  itemTypeText: {
    fontSize: 8,
    fontWeight: "900",
  },

  itemStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: SearchColors.warningLight,
  },

  itemStatusText: {
    fontSize: 8,
    fontWeight: "800",
    color: SearchColors.warning,
  },

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  loadingContainer: {
    paddingVertical: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: SearchColors.text,
    marginTop: 12,
  },

  loadingDescription: {
    fontSize: 10,
    color: SearchColors.textSecondary,
    marginTop: 5,
  },

  loadingCard: {
    height: 130,
    borderRadius: 15,
    backgroundColor: SearchColors.surface,
    marginHorizontal: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: SearchColors.border,
  },

  /* -------------------------------------------------------
     EMPTY STATE
  ------------------------------------------------------- */

  emptyContainer: {
    paddingHorizontal: 28,
    paddingVertical: 55,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIconContainer: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: SearchColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  emptyIcon: {
    fontSize: 37,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: SearchColors.text,
    textAlign: "center",
  },

  emptyDescription: {
    fontSize: 11,
    lineHeight: 19,
    color: SearchColors.textSecondary,
    textAlign: "center",
    marginTop: 9,
  },

  emptyButton: {
    minHeight: 43,
    paddingHorizontal: 20,
    borderRadius: 11,
    backgroundColor: SearchColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
  },

  emptyButtonText: {
    fontSize: 10,
    fontWeight: "900",
    color: SearchColors.white,
  },

  /* -------------------------------------------------------
     ERROR STATE
  ------------------------------------------------------- */

  errorContainer: {
    paddingHorizontal: 25,
    paddingVertical: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  errorIcon: {
    fontSize: 39,
    marginBottom: 13,
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: SearchColors.text,
    textAlign: "center",
  },

  errorDescription: {
    fontSize: 10,
    lineHeight: 18,
    color: SearchColors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },

  retryButton: {
    minWidth: 125,
    minHeight: 43,
    borderRadius: 11,
    backgroundColor: SearchColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
  },

  retryButtonText: {
    fontSize: 10,
    fontWeight: "900",
    color: SearchColors.white,
  },

  /* -------------------------------------------------------
     PAGINATION
  ------------------------------------------------------- */

  paginationContainer: {
    paddingHorizontal: 17,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 13,
  },

  paginationButton: {
    minWidth: 105,
    minHeight: 42,
    borderRadius: 11,
    backgroundColor: SearchColors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  paginationButtonDisabled: {
    backgroundColor: SearchColors.surfaceSecondary,
  },

  paginationButtonText: {
    fontSize: 10,
    fontWeight: "900",
    color: SearchColors.white,
  },

  paginationButtonTextDisabled: {
    color: SearchColors.textMuted,
  },

  paginationInfo: {
    fontSize: 10,
    color: SearchColors.textSecondary,
    fontWeight: "700",
  },

  /* -------------------------------------------------------
     FOOTER
  ------------------------------------------------------- */

  footer: {
    paddingVertical: 19,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  footerText: {
    fontSize: 9,
    lineHeight: 15,
    textAlign: "center",
    color: SearchColors.textMuted,
  },

  /* -------------------------------------------------------
     RESPONSIVE
  ------------------------------------------------------- */

  responsiveContent: {
    width: "100%",
    maxWidth: 850,
    alignSelf: "center",
  },

  responsiveItemImage: {
    width: SCREEN_WIDTH >= 600 ? 130 : 106,
    height: SCREEN_WIDTH >= 600 ? 120 : 111,
  },
});

export const searchScreenStyles = styles;

export default styles;
