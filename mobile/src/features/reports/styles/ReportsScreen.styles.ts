// mobile/src/features/reports/styles/ReportsScreen.styles.ts

import { StyleSheet } from "react-native";

export const REPORT_COLORS = {
  primary: "#2458A6",
  primaryDark: "#183F7A",
  primaryLight: "#EAF1FC",

  background: "#F5F7FB",
  surface: "#FFFFFF",
  surfaceSecondary: "#F8FAFC",

  text: "#18243A",
  textSecondary: "#667085",
  textMuted: "#98A2B3",

  border: "#E5EAF1",
  divider: "#EDF0F4",

  success: "#16834B",
  successLight: "#E7F6ED",

  warning: "#A66B00",
  warningLight: "#FFF4D6",

  danger: "#C62828",
  dangerLight: "#FDECEC",

  info: "#2563A6",
  infoLight: "#EAF3FF",

  white: "#FFFFFF",
};

export const REPORT_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const REPORT_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 100,
};

export const reportsScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: REPORT_COLORS.background,
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 15,
  },

  eyebrow: {
    color: REPORT_COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 8,
  },

  title: {
    color: REPORT_COLORS.text,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: REPORT_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 35,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    color: REPORT_COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 11,
  },

  card: {
    padding: 15,
    borderRadius: REPORT_RADIUS.lg,
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    backgroundColor: REPORT_COLORS.surface,
  },

  bodyText: {
    color: REPORT_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
  },

  mutedText: {
    color: REPORT_COLORS.textMuted,
    fontSize: 10,
  },

  divider: {
    height: 1,
    backgroundColor: REPORT_COLORS.divider,
  },

  primaryButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: REPORT_RADIUS.md,
    backgroundColor: REPORT_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  primaryButtonText: {
    color: REPORT_COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },

  secondaryButton: {
    minHeight: 45,
    paddingHorizontal: 15,
    borderRadius: REPORT_RADIUS.md,
    borderWidth: 1,
    borderColor: REPORT_COLORS.border,
    backgroundColor: REPORT_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonText: {
    color: REPORT_COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 45,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: REPORT_COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  emptyIconText: {
    fontSize: 30,
  },

  emptyTitle: {
    color: REPORT_COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyDescription: {
    color: REPORT_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 7,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  loadingText: {
    color: REPORT_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 12,
  },

  errorContainer: {
    padding: 15,
    borderRadius: REPORT_RADIUS.md,
    borderWidth: 1,
    borderColor: "#F4CACA",
    backgroundColor: REPORT_COLORS.dangerLight,
  },

  errorTitle: {
    color: REPORT_COLORS.danger,
    fontSize: 13,
    fontWeight: "800",
  },

  errorDescription: {
    color: "#8C3030",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  spaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  gapSmall: {
    gap: 8,
  },

  gapMedium: {
    gap: 12,
  },
});

export default reportsScreenStyles;
