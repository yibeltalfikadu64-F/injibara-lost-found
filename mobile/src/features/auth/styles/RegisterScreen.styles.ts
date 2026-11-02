// mobile/src/features/auth/styles/RegisterScreen.styles.ts

import { Dimensions, StyleSheet } from "react-native";

const { height } = Dimensions.get("window");

const isSmallScreen = height < 700;

export const registerColors = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  placeholder: "#94A3B8",
  danger: "#DC2626",
  dangerBackground: "#FEF2F2",
  success: "#16A34A",
  successBackground: "#F0FDF4",
  lightBlue: "#EFF6FF",
  lightGreen: "#DCFCE7",
};

export const registerScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: registerColors.background,
  },

  container: {
    flex: 1,
    backgroundColor: registerColors.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  header: {
    paddingTop: isSmallScreen ? 18 : 30,
    marginBottom: 28,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: registerColors.white,
    borderWidth: 1,
    borderColor: registerColors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 23,
  },

  backButtonText: {
    fontSize: 24,
    color: registerColors.text,
    fontWeight: "600",
  },

  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: registerColors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  logo: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },

  logoText: {
    fontSize: 22,
    fontWeight: "900",
    color: registerColors.primary,
  },

  title: {
    fontSize: 29,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -0.7,
    color: registerColors.text,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: registerColors.textSecondary,
    marginTop: 9,
  },

  formContainer: {
    width: "100%",
  },

  sectionContainer: {
    marginBottom: 27,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  sectionNumber: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: registerColors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sectionNumberText: {
    fontSize: 12,
    fontWeight: "900",
    color: registerColors.primary,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: registerColors.text,
  },

  sectionDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: registerColors.textSecondary,
    marginTop: 3,
  },

  fieldContainer: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: registerColors.text,
    marginBottom: 8,
  },

  optionalLabel: {
    fontSize: 11,
    color: registerColors.textSecondary,
    fontWeight: "400",
  },

  inputContainer: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: registerColors.white,
    borderWidth: 1,
    borderColor: registerColors.border,
    borderRadius: 13,
    paddingHorizontal: 14,
  },

  inputContainerFocused: {
    borderColor: registerColors.primary,
    borderWidth: 1.5,
  },

  inputContainerError: {
    borderColor: registerColors.danger,
    backgroundColor: "#FFFAFA",
  },

  inputIconContainer: {
    width: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  inputIcon: {
    fontSize: 17,
    color: registerColors.textSecondary,
  },

  input: {
    flex: 1,
    minHeight: 53,
    fontSize: 14,
    color: registerColors.text,
    paddingVertical: 11,
  },

  inputPlaceholder: {
    color: registerColors.placeholder,
  },

  passwordToggle: {
    padding: 8,
    marginLeft: 4,
  },

  passwordToggleText: {
    fontSize: 11,
    fontWeight: "800",
    color: registerColors.primary,
  },

  fieldError: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    color: registerColors.danger,
  },

  fieldHint: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 16,
    color: registerColors.textSecondary,
  },

  twoColumnRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  halfField: {
    flex: 1,
  },

  selectContainer: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: registerColors.white,
    borderWidth: 1,
    borderColor: registerColors.border,
    borderRadius: 13,
    paddingHorizontal: 14,
  },

  selectText: {
    flex: 1,
    fontSize: 14,
    color: registerColors.text,
  },

  selectPlaceholder: {
    color: registerColors.placeholder,
  },

  selectArrow: {
    fontSize: 15,
    color: registerColors.textSecondary,
  },

  passwordRequirements: {
    backgroundColor: registerColors.white,
    borderWidth: 1,
    borderColor: registerColors.border,
    borderRadius: 13,
    padding: 14,
    marginTop: 3,
    marginBottom: 18,
  },

  passwordRequirementsTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: registerColors.text,
    marginBottom: 11,
  },

  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  requirementItemLast: {
    marginBottom: 0,
  },

  requirementIcon: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  requirementIconValid: {
    backgroundColor: registerColors.lightGreen,
  },

  requirementCheckmark: {
    fontSize: 11,
    fontWeight: "900",
    color: registerColors.success,
  },

  requirementText: {
    flex: 1,
    fontSize: 11,
    color: registerColors.textSecondary,
  },

  requirementTextValid: {
    color: registerColors.success,
    fontWeight: "600",
  },

  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
    marginBottom: 22,
  },

  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: registerColors.border,
    backgroundColor: registerColors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    marginTop: 1,
  },

  checkboxChecked: {
    backgroundColor: registerColors.primary,
    borderColor: registerColors.primary,
  },

  checkboxCheckmark: {
    fontSize: 13,
    fontWeight: "900",
    color: registerColors.white,
  },

  termsTextContainer: {
    flex: 1,
  },

  termsText: {
    fontSize: 12,
    lineHeight: 19,
    color: registerColors.textSecondary,
  },

  termsLink: {
    fontWeight: "800",
    color: registerColors.primary,
  },

  termsError: {
    marginTop: 6,
    fontSize: 11,
    color: registerColors.danger,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: registerColors.dangerBackground,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 13,
    borderRadius: 12,
    marginBottom: 20,
  },

  errorIcon: {
    fontSize: 17,
    color: registerColors.danger,
    marginRight: 9,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: registerColors.danger,
  },

  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: registerColors.successBackground,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 13,
    borderRadius: 12,
    marginBottom: 20,
  },

  successIcon: {
    fontSize: 18,
    color: registerColors.success,
    marginRight: 9,
  },

  successText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: registerColors.success,
  },

  submitButton: {
    minHeight: 56,
    borderRadius: 15,
    backgroundColor: registerColors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: registerColors.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 4,
  },

  submitButtonDisabled: {
    opacity: 0.55,
  },

  submitButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: registerColors.white,
  },

  submitButtonIcon: {
    fontSize: 18,
    color: registerColors.white,
    marginLeft: 9,
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 23,
  },

  loginPrompt: {
    fontSize: 13,
    color: registerColors.textSecondary,
  },

  loginLink: {
    fontSize: 13,
    fontWeight: "800",
    color: registerColors.primary,
    marginLeft: 5,
  },

  footer: {
    marginTop: 30,
    alignItems: "center",
  },

  footerText: {
    fontSize: 11,
    lineHeight: 18,
    color: registerColors.textSecondary,
    textAlign: "center",
  },

  divider: {
    height: 1,
    backgroundColor: registerColors.border,
    marginVertical: 23,
  },

  requiredNote: {
    fontSize: 11,
    color: registerColors.textSecondary,
    marginBottom: 15,
  },
});

export default registerScreenStyles;
