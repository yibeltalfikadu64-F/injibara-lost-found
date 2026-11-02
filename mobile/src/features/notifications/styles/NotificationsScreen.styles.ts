// mobile/src/features/notifications/styles/NotificationsScreen.styles.ts

import { StyleSheet } from "react-native";

const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#EFF6FF",

  background: "#F8FAFC",
  surface: "#FFFFFF",

  text: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  border: "#E2E8F0",
  borderLight: "#F1F5F9",

  success: "#16A34A",
  successLight: "#DCFCE7",

  danger: "#DC2626",
  dangerLight: "#FEE2E2",

  warning: "#D97706",
  warningLight: "#FEF3C7",

  purple: "#9333EA",
  purpleLight: "#F3E8FF",

  white: "#FFFFFF",
  black: "#000000",
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

const styles = StyleSheet.create({
  // Main screen
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screenContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },

  // Header
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitleContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.6,
  },

  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: SPACING.xs,
    lineHeight: 19,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },

  headerActionButton: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerActionButtonDisabled: {
    opacity: 0.45,
  },

  headerActionButtonPrimary: {
    backgroundColor: COLORS.primaryLight,
    borderColor: "#BFDBFE",
  },

  // Summary section
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },

  summaryCard: {
    flex: 1,
    minHeight: 100,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
    justifyContent: "space-between",
  },

  summaryCardUnread: {
    backgroundColor: COLORS.primaryLight,
    borderColor: "#BFDBFE",
  },

  summaryIconContainer: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryValue: {
    fontSize: 23,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: SPACING.sm,
  },

  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Filters
  filterSection: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.sm,
  },

  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },

  filterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },

  clearFilterText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  filterScrollContent: {
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },

  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },

  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  filterChipTextActive: {
    color: COLORS.white,
  },

  // List section
  listSection: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },

  listTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },

  listCount: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },

  // Notification card
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 1,
  },

  notificationCardUnread: {
    backgroundColor: "#F8FBFF",
    borderColor: "#BFDBFE",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },

  notificationCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.995 }],
  },

  notificationCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },

  notificationIconContainer: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationMain: {
    flex: 1,
    minWidth: 0,
  },

  notificationTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  notificationTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },

  notificationTitle: {
    flexShrink: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  notificationTitleUnread: {
    color: COLORS.text,
    fontWeight: "800",
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },

  notificationMessage: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: SPACING.sm,
  },

  notificationSenderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    gap: 5,
  },

  senderAvatar: {
    width: 18,
    height: 18,
    borderRadius: RADIUS.full,
  },

  notificationSender: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },

  notificationMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },

  notificationTypeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },

  notificationTypeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  notificationPriority: {
    fontSize: 10,
    fontWeight: "700",
  },

  notificationDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 4,
  },

  notificationDate: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "500",
  },

  notificationActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.md,
  },

  notificationActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
  },

  markReadText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
  },

  deleteNotificationButton: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerLight,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxl,
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: SPACING.md,
  },

  loadingMoreContainer: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingMoreText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: SPACING.sm,
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xxl,
    paddingVertical: 55,
  },

  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyMessage: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: SPACING.sm,
    maxWidth: 280,
  },

  emptyActionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xl,
  },

  emptyActionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },

  // Error state
  errorContainer: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
  },

  errorTitle: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "800",
    marginTop: SPACING.md,
  },

  errorMessage: {
    color: "#991B1B",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: SPACING.sm,
  },

  retryButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
  },

  retryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
  },

  // Pagination
  loadMoreButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },

  loadMoreText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },

  footerText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
});

export { COLORS, SPACING, RADIUS };
export default styles;
