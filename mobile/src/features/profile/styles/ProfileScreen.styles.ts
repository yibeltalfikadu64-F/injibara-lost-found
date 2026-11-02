// mobile/src/features/profile/styles/ProfileScreen.styles.ts

import { StyleSheet } from "react-native";

export const COLORS = {
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

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

const styles = StyleSheet.create({
  // ----------------------------------------------------
  // Main screen
  // ----------------------------------------------------

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screenContent: {
    paddingBottom: 40,
  },

  contentContainer: {
    paddingHorizontal: SPACING.xl,
  },

  // ----------------------------------------------------
  // Profile header
  // ----------------------------------------------------

  profileHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: 34,
    overflow: "hidden",
    position: "relative",
  },

  profileHeaderDecorationOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -90,
    right: -40,
  },

  profileHeaderDecorationTwo: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -75,
    left: -45,
  },

  profileHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1,
  },

  profileHeaderHeading: {
    flex: 1,
  },

  profileHeaderTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  profileHeaderSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 5,
  },

  editProfileButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  editProfileButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.75,
  },

  // ----------------------------------------------------
  // Avatar and identity
  // ----------------------------------------------------

  profileAvatarSection: {
    alignItems: "center",
    marginTop: SPACING.xxl,
    zIndex: 1,
  },

  profileAvatarWrapper: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
    position: "relative",
    marginBottom: SPACING.md,
  },

  profileAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 52,
  },

  profileAvatarFallback: {
    flex: 1,
    borderRadius: 52,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  profileAvatarInitials: {
    color: COLORS.primary,
    fontSize: 34,
    fontWeight: "900",
  },

  profileAvatarStatus: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  profileFullName: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
    marginTop: SPACING.xs,
  },

  profileEmail: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 5,
    maxWidth: "90%",
  },

  profileRoleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginTop: SPACING.md,
    gap: 6,
  },

  profileRoleText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  // ----------------------------------------------------
  // Statistics
  // ----------------------------------------------------

  statsContainer: {
    flexDirection: "row",
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    alignItems: "center",
    minHeight: 100,
    justifyContent: "center",
  },

  statIconContainer: {
    width: 35,
    height: 35,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },

  statValue: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
  },

  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
    textAlign: "center",
  },

  // ----------------------------------------------------
  // Section headers
  // ----------------------------------------------------

  sectionContainer: {
    marginTop: SPACING.xxl,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },

  // ----------------------------------------------------
  // Information cards
  // ----------------------------------------------------

  infoCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  infoIconContainer: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  infoTextContainer: {
    flex: 1,
    justifyContent: "center",
    minHeight: 38,
  },

  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 5,
  },

  infoValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },

  infoValueMuted: {
    color: COLORS.textMuted,
    fontWeight: "500",
  },

  // ----------------------------------------------------
  // Account status
  // ----------------------------------------------------

  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
  },

  statusLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },

  statusLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },

  // ----------------------------------------------------
  // Menu
  // ----------------------------------------------------

  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    minHeight: 62,
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },

  menuTextContainer: {
    flex: 1,
  },

  menuTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },

  menuDescription: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },

  menuArrow: {
    marginLeft: SPACING.sm,
  },

  menuDangerTitle: {
    color: COLORS.danger,
  },

  // ----------------------------------------------------
  // Footer
  // ----------------------------------------------------

  profileFooter: {
    alignItems: "center",
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
  },

  profileFooterText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },

  // ----------------------------------------------------
  // Loading
  // ----------------------------------------------------

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxl,
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: SPACING.md,
  },

  // ----------------------------------------------------
  // Error
  // ----------------------------------------------------

  errorContainer: {
    margin: SPACING.xl,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
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

  // ----------------------------------------------------
  // Edit screen header
  // ----------------------------------------------------

  editHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },

  editHeaderTextContainer: {
    flex: 1,
  },

  editHeaderTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "800",
  },

  editHeaderSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 3,
  },

  // ----------------------------------------------------
  // Edit form
  // ----------------------------------------------------

  formContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: 40,
  },

  formIntro: {
    marginBottom: SPACING.xl,
  },

  formIntroTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },

  formIntroText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: SPACING.sm,
  },

  formSection: {
    marginBottom: SPACING.xl,
  },

  formSectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: SPACING.lg,
  },

  inputGroup: {
    marginBottom: SPACING.lg,
  },

  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },

  requiredMark: {
    color: COLORS.danger,
  },

  inputWrapper: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
  },

  inputWrapperFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },

  inputWrapperDisabled: {
    backgroundColor: COLORS.background,
  },

  inputIcon: {
    marginRight: SPACING.sm,
  },

  textInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    paddingVertical: SPACING.md,
    minWidth: 0,
  },

  textInputDisabled: {
    color: COLORS.textMuted,
  },

  textAreaWrapper: {
    minHeight: 110,
    alignItems: "flex-start",
    paddingTop: SPACING.sm,
  },

  textArea: {
    minHeight: 95,
    textAlignVertical: "top",
  },

  inputError: {
    borderColor: COLORS.danger,
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 10,
    marginTop: 5,
    lineHeight: 15,
  },

  inputHelper: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 5,
  },

  // ----------------------------------------------------
  // Read-only fields
  // ----------------------------------------------------

  readOnlyNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },

  readOnlyNoticeText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },

  readOnlyField: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.borderLight,
  },

  // ----------------------------------------------------
  // Save button
  // ----------------------------------------------------

  saveButton: {
    minHeight: 52,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  saveButtonDisabled: {
    opacity: 0.55,
  },

  saveButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },

  cancelButton: {
    minHeight: 48,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.md,
  },

  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },

  // ----------------------------------------------------
  // Success message
  // ----------------------------------------------------

  successContainer: {
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },

  successText: {
    flex: 1,
    color: "#166534",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default styles;
