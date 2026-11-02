// mobile/src/features/security/styles/SecurityScreen.styles.ts

import { StyleSheet } from "react-native";

export const COLORS = {
  primary: "#1D4ED8",
  primaryDark: "#1E40AF",
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

  warning: "#D97706",
  warningLight: "#FEF3C7",

  danger: "#DC2626",
  dangerLight: "#FEE2E2",

  purple: "#7E22CE",
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
  // ====================================================
  // SCREEN
  // ====================================================

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  content: {
    paddingHorizontal: SPACING.lg,
  },

  // ====================================================
  // DASHBOARD HEADER
  // ====================================================

  header: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 6,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerAction: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ====================================================
  // SUBSCREEN HEADER
  // ====================================================

  subHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },

  subHeaderContent: {
    flex: 1,
  },

  subHeaderTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },

  subHeaderSubtitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 3,
  },

  // ====================================================
  // SECTION
  // ====================================================

  section: {
    marginTop: SPACING.xxl,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },

  sectionDescription: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
  },

  // ====================================================
  // SUMMARY CARDS
  // ====================================================

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },

  summaryCard: {
    flexGrow: 1,
    flexBasis: "45%",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    minHeight: 112,
  },

  summaryIcon: {
    width: 35,
    height: 35,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },

  summaryValue: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "900",
  },

  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },

  // ====================================================
  // FILTERS
  // ====================================================

  filterContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },

  filterTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: SPACING.sm,
  },

  filterList: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },

  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },

  filterChipTextActive: {
    color: COLORS.white,
  },

  // ====================================================
  // SEARCH
  // ====================================================

  searchContainer: {
    height: 48,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },

  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    paddingVertical: 0,
  },

  // ====================================================
  // CLAIM CARD
  // ====================================================

  claimCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: SPACING.md,
  },

  cardTitleContainer: {
    flex: 1,
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },

  cardSubtitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 5,
  },

  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    marginTop: SPACING.md,
  },

  cardDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  // ====================================================
  // STATUS BADGES
  // ====================================================

  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  // ====================================================
  // USER INFORMATION
  // ====================================================

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  userInitials: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  userInfoContent: {
    flex: 1,
  },

  userName: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
  },

  userEmail: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 3,
  },

  // ====================================================
  // ITEM INFORMATION
  // ====================================================

  itemPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    marginTop: SPACING.md,
  },

  itemImage: {
    width: 55,
    height: 55,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.borderLight,
  },

  itemImagePlaceholder: {
    width: 55,
    height: 55,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  itemPreviewContent: {
    flex: 1,
  },

  itemTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  itemDescription: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },

  // ====================================================
  // DETAIL ROWS
  // ====================================================

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },

  detailLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    flex: 1,
  },

  detailValue: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "700",
    flex: 1.5,
    textAlign: "right",
  },

  // ====================================================
  // ACTION BUTTONS
  // ====================================================

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  primaryButton: {
    minHeight: 47,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },

  successButton: {
    minHeight: 45,
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: SPACING.xs,
  },

  dangerButton: {
    minHeight: 45,
    flex: 1,
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: SPACING.xs,
  },

  warningButton: {
    minHeight: 45,
    flex: 1,
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: SPACING.xs,
  },

  buttonText: {
    fontSize: 10,
    fontWeight: "800",
  },

  successButtonText: {
    color: COLORS.white,
  },

  dangerButtonText: {
    color: COLORS.danger,
  },

  warningButtonText: {
    color: COLORS.warning,
  },

  disabledButton: {
    opacity: 0.5,
  },

  // ====================================================
  // FORM
  // ====================================================

  formSection: {
    marginTop: SPACING.xl,
  },

  formLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: SPACING.sm,
  },

  inputContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    paddingVertical: SPACING.md,
  },

  textArea: {
    minHeight: 110,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    color: COLORS.text,
    fontSize: 12,
    padding: SPACING.md,
    textAlignVertical: "top",
  },

  helperText: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: SPACING.sm,
  },

  // ====================================================
  // CUSTODY CARD
  // ====================================================

  custodyCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },

  custodyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  custodyNumber: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
  },

  custodyLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },

  custodyLocationText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    flex: 1,
  },

  // ====================================================
  // SCANNER
  // ====================================================

  scannerContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
  },

  camera: {
    flex: 1,
  },

  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },

  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: COLORS.white,
    borderRadius: RADIUS.xl,
    backgroundColor: "transparent",
  },

  scannerHint: {
    color: COLORS.white,
    fontSize: 12,
    textAlign: "center",
    marginTop: SPACING.xxl,
    lineHeight: 20,
    maxWidth: 280,
  },

  scannerTopBar: {
    position: "absolute",
    top: 20,
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  scannerBottomBar: {
    position: "absolute",
    bottom: 35,
    left: SPACING.xl,
    right: SPACING.xl,
    alignItems: "center",
  },

  scannerButton: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ====================================================
  // VERIFICATION CARD
  // ====================================================

  verificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },

  verificationTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },

  verificationDescription: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    marginTop: SPACING.sm,
  },

  verificationSuccess: {
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  verificationSuccessText: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
  },

  verificationWarning: {
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },

  verificationWarningText: {
    color: "#92400E",
    fontSize: 11,
    lineHeight: 17,
    flex: 1,
  },

  // ====================================================
  // EMPTY / ERROR / LOADING
  // ====================================================

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxxl,
    minHeight: 250,
  },

  emptyIcon: {
    width: 65,
    height: 65,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: SPACING.lg,
  },

  emptyDescription: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 18,
    marginTop: SPACING.sm,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxl,
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: SPACING.md,
  },

  errorCard: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "center",
    marginTop: SPACING.lg,
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 11,
    lineHeight: 17,
    flex: 1,
  },

  // ====================================================
  // FOOTER
  // ====================================================

  footer: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
  },

  footerText: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 17,
    textAlign: "center",
  },
});

export default styles;
