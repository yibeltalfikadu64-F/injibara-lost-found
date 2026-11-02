// mobile/src/features/items/styles/ReportItemScreen.styles.ts

import { Dimensions, Platform, StyleSheet } from "react-native";

/* =========================================================
   SCREEN DIMENSIONS
========================================================= */

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/* =========================================================
   COLORS
========================================================= */

export const ReportItemColors = {
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

  inputBackground: "#FFFFFF",
  placeholder: "#94A3B8",
};

/* =========================================================
   SPACING
========================================================= */

export const ReportItemSpacing = {
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

export const ReportItemTypography = {
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

const formCardShadow = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
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
    backgroundColor: ReportItemColors.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 45,
  },

  contentWrapper: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
  },

  /* -------------------------------------------------------
     HEADER
  ------------------------------------------------------- */

  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: ReportItemColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: ReportItemColors.border,
  },

  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ReportItemColors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },

  headerBackText: {
    fontSize: 23,
    color: ReportItemColors.text,
    lineHeight: 26,
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: ReportItemTypography.subtitle,
    fontWeight: "900",
    color: ReportItemColors.text,
  },

  headerSubtitle: {
    fontSize: ReportItemTypography.tiny,
    color: ReportItemColors.textSecondary,
    marginTop: 3,
  },

  headerRight: {
    marginLeft: 10,
  },

  /* -------------------------------------------------------
     INTRODUCTION CARD
  ------------------------------------------------------- */

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: ReportItemColors.primaryLight,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    marginBottom: 20,
  },

  introIconContainer: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: ReportItemColors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  introIcon: {
    fontSize: 25,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontSize: ReportItemTypography.subtitle,
    fontWeight: "900",
    color: ReportItemColors.primaryDark,
  },

  introDescription: {
    fontSize: ReportItemTypography.small,
    lineHeight: 17,
    color: ReportItemColors.textSecondary,
    marginTop: 5,
  },

  /* -------------------------------------------------------
     FORM CARD
  ------------------------------------------------------- */

  formCard: {
    padding: 17,
    borderRadius: 16,
    backgroundColor: ReportItemColors.surface,
    borderWidth: 1,
    borderColor: ReportItemColors.border,
    marginBottom: 17,
    ...formCardShadow,
  },

  formCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  formCardIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: ReportItemColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  formCardIconText: {
    fontSize: 16,
  },

  formCardHeading: {
    flex: 1,
  },

  formCardTitle: {
    fontSize: ReportItemTypography.subtitle,
    fontWeight: "900",
    color: ReportItemColors.text,
  },

  formCardSubtitle: {
    fontSize: ReportItemTypography.tiny,
    color: ReportItemColors.textSecondary,
    marginTop: 3,
  },

  /* -------------------------------------------------------
     FORM FIELD
  ------------------------------------------------------- */

  field: {
    marginBottom: 19,
  },

  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  fieldLabel: {
    fontSize: ReportItemTypography.caption,
    fontWeight: "800",
    color: ReportItemColors.text,
  },

  requiredMark: {
    color: ReportItemColors.danger,
    fontSize: ReportItemTypography.caption,
    fontWeight: "900",
  },

  optionalLabel: {
    fontSize: ReportItemTypography.tiny,
    color: ReportItemColors.textMuted,
  },

  fieldHint: {
    fontSize: ReportItemTypography.tiny,
    lineHeight: 15,
    color: ReportItemColors.textSecondary,
    marginTop: 6,
  },

  fieldError: {
    fontSize: ReportItemTypography.tiny,
    color: ReportItemColors.danger,
    marginTop: 6,
    lineHeight: 15,
  },

  /* -------------------------------------------------------
     TEXT INPUT
  ------------------------------------------------------- */

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: ReportItemColors.border,
    borderRadius: 12,
    backgroundColor: ReportItemColors.inputBackground,
    paddingHorizontal: 14,
    color: ReportItemColors.text,
    fontSize: ReportItemTypography.caption,
  },

  inputFocused: {
    borderColor: ReportItemColors.primary,
    borderWidth: 1.5,
  },

  inputError: {
    borderColor: ReportItemColors.danger,
    backgroundColor: "#FFFAFA",
  },

  inputDisabled: {
    backgroundColor: ReportItemColors.surfaceSecondary,
    color: ReportItemColors.textMuted,
  },

  multilineInput: {
    minHeight: 115,
    paddingTop: 13,
    paddingBottom: 13,
    textAlignVertical: "top",
  },

  characterCounter: {
    fontSize: ReportItemTypography.tiny,
    color: ReportItemColors.textMuted,
    textAlign: "right",
    marginTop: 5,
  },

  /* -------------------------------------------------------
     TYPE SELECTOR
  ------------------------------------------------------- */

  typeSelectorContainer: {
    flexDirection: "row",
    padding: 5,
    borderRadius: 13,
    backgroundColor: ReportItemColors.surfaceSecondary,
    gap: 7,
  },

  typeOption: {
    flex: 1,
    minHeight: 47,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  typeOptionSelected: {
    backgroundColor: ReportItemColors.primary,
  },

  lostTypeSelected: {
    backgroundColor: ReportItemColors.danger,
  },

  foundTypeSelected: {
    backgroundColor: ReportItemColors.success,
  },

  typeOptionText: {
    fontSize: ReportItemTypography.caption,
    fontWeight: "800",
    color: ReportItemColors.textSecondary,
  },

  typeOptionTextSelected: {
    color: ReportItemColors.white,
  },

  /* -------------------------------------------------------
     CATEGORY SELECTOR
  ------------------------------------------------------- */

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  categoryOption: {
    minHeight: 38,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ReportItemColors.border,
    backgroundColor: ReportItemColors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryOptionSelected: {
    borderColor: ReportItemColors.primary,
    backgroundColor: ReportItemColors.primaryLight,
  },

  categoryOptionText: {
    fontSize: ReportItemTypography.small,
    fontWeight: "700",
    color: ReportItemColors.textSecondary,
  },

  categoryOptionTextSelected: {
    color: ReportItemColors.primary,
    fontWeight: "900",
  },

  /* -------------------------------------------------------
     LOCATION FIELD
  ------------------------------------------------------- */

  locationInputContainer: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: ReportItemColors.border,
    borderRadius: 12,
    backgroundColor: ReportItemColors.white,
    paddingHorizontal: 13,
  },

  locationIcon: {
    fontSize: 17,
    marginRight: 10,
  },

  locationInput: {
    flex: 1,
    minHeight: 48,
    fontSize: ReportItemTypography.caption,
    color: ReportItemColors.text,
  },

  locationPickerButton: {
    minHeight: 45,
    borderWidth: 1,
    borderColor: ReportItemColors.border,
    borderRadius: 11,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ReportItemColors.white,
  },

  locationPickerText: {
    flex: 1,
    fontSize: ReportItemTypography.caption,
    color: ReportItemColors.text,
  },

  locationPickerArrow: {
    fontSize: 17,
    color: ReportItemColors.textSecondary,
    marginLeft: 8,
  },

  /* -------------------------------------------------------
     DATE FIELD
  ------------------------------------------------------- */

  dateInputContainer: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: ReportItemColors.border,
    borderRadius: 12,
    backgroundColor: ReportItemColors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  dateIcon: {
    fontSize: 17,
    marginRight: 10,
  },

  dateInput: {
    flex: 1,
    minHeight: 48,
    fontSize: ReportItemTypography.caption,
    color: ReportItemColors.text,
  },

  datePickerButton: {
    minHeight: 46,
    paddingHorizontal: 13,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: ReportItemColors.border,
    backgroundColor: ReportItemColors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  datePickerText: {
    fontSize: ReportItemTypography.caption,
    color: ReportItemColors.text,
  },

  /* -------------------------------------------------------
     PHOTO UPLOAD
  ------------------------------------------------------- */

  photoUploadContainer: {
    marginTop: 5,
  },

  photoUploadArea: {
    minHeight: 145,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: ReportItemColors.primary,
    backgroundColor: ReportItemColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  photoUploadIcon: {
    fontSize: 34,
    marginBottom: 10,
  },

  photoUploadTitle: {
    fontSize: ReportItemTypography.caption,
    fontWeight: "900",
    color: ReportItemColors.primary,
  },

  photoUploadDescription: {
    fontSize: ReportItemTypography.tiny,
    color: ReportItemColors.textSecondary,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 16,
  },

  photoActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
  },

  photoActionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ReportItemColors.border,
    backgroundColor: ReportItemColors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  photoActionText: {
    fontSize: ReportItemTypography.small,
    fontWeight: "800",
    color: ReportItemColors.text,
  },

  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },

  photoPreviewContainer: {
    width: 91,
    height: 91,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: ReportItemColors.surfaceSecondary,
    position: "relative",
  },

  photoPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  photoRemoveButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ReportItemColors.danger,
    alignItems: "center",
    justifyContent: "center",
  },

  photoRemoveText: {
    fontSize: 18,
    fontWeight: "900",
    color: ReportItemColors.white,
    lineHeight: 21,
  },

  photoCount: {
    fontSize: ReportItemTypography.tiny,
    color: ReportItemColors.textSecondary,
    marginTop: 9,
  },

  photoLimitReached: {
    opacity: 0.5,
  },

  /* -------------------------------------------------------
     ADDITIONAL DETAILS
  ------------------------------------------------------- */

  additionalDetailsContainer: {
    marginTop: 5,
  },

  optionalSectionLabel: {
    fontSize: ReportItemTypography.small,
    color: ReportItemColors.textSecondary,
    marginBottom: 13,
    lineHeight: 17,
  },

  /* -------------------------------------------------------
     PRIVACY CARD
  ------------------------------------------------------- */

  privacyCard: {
    padding: 14,
    borderRadius: 13,
    backgroundColor: ReportItemColors.warningLight,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginTop: 5,
    marginBottom: 19,
  },

  privacyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  privacyIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  privacyTitle: {
    fontSize: ReportItemTypography.caption,
    fontWeight: "900",
    color: "#92400E",
  },

  privacyText: {
    fontSize: ReportItemTypography.small,
    lineHeight: 17,
    color: "#92400E",
  },

  /* -------------------------------------------------------
     VALIDATION SUMMARY
  ------------------------------------------------------- */

  validationErrorContainer: {
    padding: 13,
    borderRadius: 12,
    backgroundColor: ReportItemColors.dangerLight,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 17,
  },

  validationErrorTitle: {
    fontSize: ReportItemTypography.caption,
    fontWeight: "900",
    color: ReportItemColors.danger,
    marginBottom: 5,
  },

  validationErrorText: {
    fontSize: ReportItemTypography.small,
    lineHeight: 16,
    color: ReportItemColors.danger,
  },

  validationSuccessContainer: {
    padding: 13,
    borderRadius: 12,
    backgroundColor: ReportItemColors.successLight,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 17,
  },

  validationSuccessText: {
    fontSize: ReportItemTypography.small,
    color: ReportItemColors.success,
    fontWeight: "700",
  },

  /* -------------------------------------------------------
     SUBMIT BUTTONS
  ------------------------------------------------------- */

  buttonContainer: {
    marginTop: 5,
    gap: 10,
  },

  submitButton: {
    minHeight: 53,
    borderRadius: 13,
    backgroundColor: ReportItemColors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
  },

  submitButtonLost: {
    backgroundColor: ReportItemColors.danger,
  },

  submitButtonFound: {
    backgroundColor: ReportItemColors.success,
  },

  submitButtonDisabled: {
    opacity: 0.55,
  },

  submitButtonText: {
    fontSize: ReportItemTypography.caption,
    fontWeight: "900",
    color: ReportItemColors.white,
  },

  submitButtonIcon: {
    fontSize: 16,
    marginRight: 9,
  },

  cancelButton: {
    minHeight: 49,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: ReportItemColors.border,
    backgroundColor: ReportItemColors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: ReportItemTypography.caption,
    fontWeight: "800",
    color: ReportItemColors.textSecondary,
  },

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
    backgroundColor: ReportItemColors.background,
  },

  loadingText: {
    fontSize: ReportItemTypography.caption,
    color: ReportItemColors.textSecondary,
    marginTop: 12,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  /* -------------------------------------------------------
     SUCCESS
  ------------------------------------------------------- */

  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
    backgroundColor: ReportItemColors.background,
  },

  successIconContainer: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: ReportItemColors.successLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 19,
  },

  successIcon: {
    fontSize: 39,
    color: ReportItemColors.success,
  },

  successTitle: {
    fontSize: ReportItemTypography.title,
    fontWeight: "900",
    color: ReportItemColors.text,
    textAlign: "center",
  },

  successDescription: {
    fontSize: ReportItemTypography.caption,
    lineHeight: 20,
    color: ReportItemColors.textSecondary,
    textAlign: "center",
    marginTop: 10,
  },

  successButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: ReportItemColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  successButtonText: {
    fontSize: ReportItemTypography.caption,
    fontWeight: "900",
    color: ReportItemColors.white,
  },

  /* -------------------------------------------------------
     FOOTER
  ------------------------------------------------------- */

  footer: {
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 18,
  },

  footerText: {
    fontSize: ReportItemTypography.tiny,
    lineHeight: 16,
    color: ReportItemColors.textMuted,
    textAlign: "center",
  },

  /* -------------------------------------------------------
     RESPONSIVE
  ------------------------------------------------------- */

  responsiveRow: {
    flexDirection: SCREEN_WIDTH >= 600 ? "row" : "column",
    gap: 12,
  },

  responsiveField: {
    flex: 1,
  },

  /* -------------------------------------------------------
     ACCESSIBILITY
  ------------------------------------------------------- */

  accessibilityFocus: {
    borderWidth: 2,
    borderColor: ReportItemColors.primary,
  },

  accessibilityDisabled: {
    opacity: 0.45,
  },
});

/* =========================================================
   EXPORTS
========================================================= */

export const reportItemStyles = styles;

export default styles;
