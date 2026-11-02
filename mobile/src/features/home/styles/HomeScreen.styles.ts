// mobile/src/features/home/styles/HomeScreen.styles.ts

import { Dimensions, StyleSheet } from "react-native";

/* =========================================================
   1. SCREEN DIMENSIONS
========================================================= */

const { width, height } = Dimensions.get("window");

const isSmallScreen = height < 700;

const horizontalPadding = width < 360 ? 16 : 22;

/* =========================================================
   2. APPLICATION COLORS
========================================================= */

export const homeColors = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#EFF6FF",

  secondary: "#0F172A",

  background: "#F8FAFC",
  white: "#FFFFFF",

  text: "#0F172A",
  textSecondary: "#64748B",
  textLight: "#94A3B8",

  border: "#E2E8F0",

  success: "#16A34A",
  successLight: "#DCFCE7",

  warning: "#D97706",
  warningLight: "#FEF3C7",

  danger: "#DC2626",
  dangerLight: "#FEE2E2",

  purple: "#7C3AED",
  purpleLight: "#F5F3FF",

  orange: "#EA580C",
  orangeLight: "#FFF7ED",

  green: "#059669",
  greenLight: "#ECFDF5",

  grayLight: "#F1F5F9",
};

/* =========================================================
   3. MAIN STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     SAFE AREA AND MAIN CONTAINER
  ======================================================= */

  safeArea: {
    flex: 1,
    backgroundColor: homeColors.background,
  },

  container: {
    flex: 1,
    backgroundColor: homeColors.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: horizontalPadding,
    paddingTop: 15,
    paddingBottom: 40,
  },

  /* =======================================================
     PAGE HEADER
  ======================================================= */

  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  pageHeaderTextContainer: {
    flex: 1,
  },

  pageHeaderTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: homeColors.text,
    letterSpacing: -0.5,
  },

  pageHeaderSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: homeColors.textSecondary,
    marginTop: 3,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  connectionStatus: {
    fontSize: 10,
    fontWeight: "700",
    color: homeColors.success,
  },

  headerUniversityBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: homeColors.primaryLight,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  headerUniversityBadgeText: {
    fontSize: 16,
    fontWeight: "900",
    color: homeColors.primary,
  },

  /* =======================================================
     WELCOME CARD
  ======================================================= */

  welcomeCard: {
    width: "100%",
    backgroundColor: homeColors.primary,
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    marginBottom: 28,

    shadowColor: homeColors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },

  welcomeTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  welcomeTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  welcomeEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    color: "#DBEAFE",
    letterSpacing: 1.4,
    marginBottom: 9,
  },

  welcomeTitle: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "900",
    color: homeColors.white,
    letterSpacing: -0.5,
  },

  welcomeSubtitle: {
    fontSize: 12,
    lineHeight: 19,
    color: "#DBEAFE",
    marginTop: 8,
    maxWidth: 240,
  },

  welcomeLogoContainer: {
    width: 57,
    height: 57,
    borderRadius: 18,
    backgroundColor: homeColors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  welcomeLogo: {
    width: 45,
    height: 45,
  },

  welcomeLogoPlaceholder: {
    fontSize: 21,
    fontWeight: "900",
    color: homeColors.primary,
  },

  welcomeNotificationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    gap: 8,
  },

  welcomeNotificationText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 16,
    color: "#DBEAFE",
  },

  notificationAction: {
    fontSize: 11,
    fontWeight: "800",
    color: homeColors.white,
    paddingVertical: 5,
    paddingHorizontal: 9,
    backgroundColor: "rgba(255,255,255,0.17)",
    borderRadius: 8,
    overflow: "hidden",
  },

  /* =======================================================
     STATISTICS
  ======================================================= */

  statisticsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginTop: 22,
  },

  statisticItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  statisticNumber: {
    fontSize: 23,
    fontWeight: "900",
    color: homeColors.white,
  },

  statisticLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#DBEAFE",
    marginTop: 5,
    textAlign: "center",
  },

  statisticDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  /* =======================================================
     SECTION HEADINGS
  ======================================================= */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: homeColors.text,
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: 11,
    lineHeight: 17,
    color: homeColors.textSecondary,
    marginTop: 4,
  },

  seeAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 5,
  },

  seeAllText: {
    fontSize: 12,
    fontWeight: "800",
    color: homeColors.primary,
  },

  /* =======================================================
     QUICK ACTIONS SECTION
  ======================================================= */

  quickActionsSection: {
    marginBottom: 29,
  },

  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  quickActionCard: {
    width: "48.2%",
    minHeight: 130,
    backgroundColor: homeColors.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: homeColors.border,
    padding: 13,
    justifyContent: "space-between",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 2,
  },

  quickActionPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  quickActionDisabled: {
    opacity: 0.5,
  },

  quickActionIconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  quickActionIcon: {
    fontSize: 21,
  },

  quickActionTextContainer: {
    marginTop: 13,
    flex: 1,
  },

  quickActionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: homeColors.text,
  },

  quickActionDescription: {
    fontSize: 10,
    lineHeight: 15,
    color: homeColors.textSecondary,
    marginTop: 5,
  },

  quickActionArrow: {
    position: "absolute",
    right: 13,
    top: 15,
    fontSize: 17,
    color: homeColors.textLight,
  },

  /* =======================================================
     RECENT ITEMS SECTION
  ======================================================= */

  recentItemsSection: {
    marginBottom: 30,
  },

  recentItemsList: {
    gap: 13,
  },

  recentItemCard: {
    flexDirection: "row",
    minHeight: 125,
    backgroundColor: homeColors.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: homeColors.border,
    padding: 10,
    overflow: "hidden",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 2,
  },

  recentItemPressed: {
    opacity: 0.75,
  },

  recentItemImageContainer: {
    width: 105,
    minHeight: 105,
    borderRadius: 13,
    backgroundColor: homeColors.grayLight,
    overflow: "hidden",
    position: "relative",
  },

  recentItemImage: {
    width: "100%",
    height: "100%",
    minHeight: 105,
  },

  recentItemImagePlaceholder: {
    flex: 1,
    minHeight: 105,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: homeColors.primaryLight,
  },

  recentItemPlaceholderIcon: {
    fontSize: 30,
  },

  recentItemPlaceholderText: {
    fontSize: 9,
    color: homeColors.textSecondary,
    marginTop: 5,
  },

  itemTypeBadge: {
    position: "absolute",
    left: 5,
    top: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },

  lostItemBadge: {
    backgroundColor: homeColors.danger,
  },

  foundItemBadge: {
    backgroundColor: homeColors.success,
  },

  itemTypeBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: homeColors.white,
  },

  recentItemDetails: {
    flex: 1,
    justifyContent: "space-between",
    paddingLeft: 12,
    paddingVertical: 3,
    minWidth: 0,
  },

  recentItemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  recentItemTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: homeColors.text,
  },

  recentItemCategory: {
    fontSize: 11,
    color: homeColors.primary,
    fontWeight: "600",
    marginTop: 5,
  },

  recentItemMetadata: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  recentItemMetadataText: {
    flex: 1,
    fontSize: 10,
    color: homeColors.textSecondary,
  },

  recentItemBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 5,
  },

  recentItemDate: {
    flex: 1,
    fontSize: 9,
    color: homeColors.textLight,
  },

  /* =======================================================
     ITEM STATUS BADGES
  ======================================================= */

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: homeColors.text,
  },

  statusReturned: {
    backgroundColor: homeColors.successLight,
  },

  statusActive: {
    backgroundColor: homeColors.primaryLight,
  },

  statusPending: {
    backgroundColor: homeColors.warningLight,
  },

  statusRejected: {
    backgroundColor: homeColors.dangerLight,
  },

  statusClaimed: {
    backgroundColor: homeColors.purpleLight,
  },

  /* =======================================================
     RECENT ITEMS LOADING
  ======================================================= */

  recentLoadingContainer: {
    minHeight: 170,
    backgroundColor: homeColors.white,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  recentLoadingText: {
    fontSize: 12,
    color: homeColors.textSecondary,
    marginTop: 12,
  },

  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },

  inlineLoadingText: {
    fontSize: 11,
    color: homeColors.textSecondary,
    marginLeft: 9,
  },

  /* =======================================================
     RECENT ITEMS EMPTY STATE
  ======================================================= */

  recentEmptyContainer: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: homeColors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderStyle: "dashed",
    padding: 22,
  },

  recentEmptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  recentEmptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: homeColors.text,
  },

  recentEmptyDescription: {
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    color: homeColors.textSecondary,
    marginTop: 7,
  },

  /* =======================================================
     RECENT ITEMS ERROR
  ======================================================= */

  recentErrorContainer: {
    backgroundColor: homeColors.dangerLight,
    borderRadius: 15,
    padding: 18,
    alignItems: "center",
  },

  recentErrorIcon: {
    fontSize: 25,
    marginBottom: 9,
  },

  recentErrorText: {
    fontSize: 12,
    lineHeight: 18,
    color: homeColors.danger,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 13,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: homeColors.white,
  },

  retryButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: homeColors.primary,
  },

  /* =======================================================
     ANNOUNCEMENT SECTION
  ======================================================= */

  announcementSection: {
    marginBottom: 30,
  },

  announcementCard: {
    backgroundColor: homeColors.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: homeColors.border,
    marginBottom: 12,
    overflow: "hidden",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 2,
  },

  announcementPressed: {
    opacity: 0.75,
  },

  announcementImage: {
    width: "100%",
    height: 145,
    backgroundColor: homeColors.grayLight,
  },

  announcementContent: {
    padding: 15,
  },

  announcementTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 11,
  },

  announcementPriorityBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  announcementHighPriority: {
    backgroundColor: homeColors.dangerLight,
  },

  announcementNormalPriority: {
    backgroundColor: homeColors.primaryLight,
  },

  announcementLowPriority: {
    backgroundColor: homeColors.grayLight,
  },

  announcementPriorityText: {
    fontSize: 9,
    fontWeight: "900",
    color: homeColors.text,
  },

  announcementDate: {
    fontSize: 10,
    color: homeColors.textLight,
  },

  announcementTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
    color: homeColors.text,
  },

  announcementMessage: {
    fontSize: 11,
    lineHeight: 19,
    color: homeColors.textSecondary,
    marginTop: 7,
  },

  announcementCategory: {
    fontSize: 10,
    fontWeight: "700",
    color: homeColors.primary,
    marginTop: 11,
  },

  /* =======================================================
     ANNOUNCEMENT EMPTY STATE
  ======================================================= */

  announcementEmpty: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    backgroundColor: homeColors.white,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderStyle: "dashed",
  },

  announcementEmptyIcon: {
    fontSize: 37,
    marginBottom: 11,
  },

  announcementEmptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: homeColors.text,
  },

  announcementEmptyDescription: {
    fontSize: 11,
    lineHeight: 18,
    color: homeColors.textSecondary,
    textAlign: "center",
    marginTop: 7,
  },

  announcementLoading: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: homeColors.white,
    borderRadius: 16,
  },

  announcementLoadingText: {
    fontSize: 12,
    color: homeColors.textSecondary,
  },

  /* =======================================================
     DASHBOARD ERROR BANNER
  ======================================================= */

  dashboardErrorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: homeColors.dangerLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 13,
    marginBottom: 17,
  },

  dashboardErrorIcon: {
    fontSize: 19,
    marginRight: 10,
  },

  dashboardErrorContent: {
    flex: 1,
  },

  dashboardErrorTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: homeColors.danger,
  },

  dashboardErrorMessage: {
    fontSize: 11,
    lineHeight: 17,
    color: "#991B1B",
    marginTop: 4,
  },

  dashboardRetryText: {
    fontSize: 11,
    fontWeight: "900",
    color: homeColors.primary,
    marginTop: 8,
  },

  /* =======================================================
     INITIAL LOADING SCREEN
  ======================================================= */

  initialLoadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: homeColors.background,
  },

  loadingLogoContainer: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: homeColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },

  loadingLogoText: {
    fontSize: 31,
    fontWeight: "900",
    color: homeColors.primary,
  },

  initialLoadingIndicator: {
    marginBottom: 18,
  },

  initialLoadingTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: homeColors.text,
  },

  initialLoadingDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: homeColors.textSecondary,
    textAlign: "center",
    marginTop: 9,
  },

  /* =======================================================
     HOME FOOTER
  ======================================================= */

  homeFooter: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 15,
  },

  footerDivider: {
    width: "100%",
    height: 1,
    backgroundColor: homeColors.border,
    marginBottom: 20,
  },

  footerTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: homeColors.text,
  },

  footerDescription: {
    fontSize: 10,
    lineHeight: 17,
    color: homeColors.textSecondary,
    textAlign: "center",
    marginTop: 7,
  },

  footerCopyright: {
    fontSize: 10,
    fontWeight: "600",
    color: homeColors.textLight,
    marginTop: 10,
  },
});

export default styles;
