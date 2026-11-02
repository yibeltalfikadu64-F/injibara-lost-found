// mobile/src/features/auth/styles/LoginScreen.styles.ts

import { Dimensions, StyleSheet } from "react-native";

const { height } = Dimensions.get("window");

const isSmallScreen = height < 700;

export const loginColors = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  inputBackground: "#FFFFFF",
  placeholder: "#94A3B8",
  danger: "#DC2626",
  dangerBackground: "#FEF2F2",
  success: "#16A34A",
  lightBlue: "#EFF6FF",
};

export const loginScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: loginColors.background,
  },

  container: {
    flex: 1,
    backgroundColor: loginColors.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },

  header: {
    paddingTop: isSmallScreen ? 20 : 35,
    marginBottom: 30,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: loginColors.white,
    borderWidth: 1,
    borderColor: loginColors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },

  backButtonText: {
    fontSize: 24,
    color: loginColors.text,
    fontWeight: "600",
  },

  logoContainer: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: loginColors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  logo: {
    width: 46,
    height: 46,
    resizeMode: "contain",
  },

  logoText: {
    fontSize: 23,
    fontWeight: "900",
    color: loginColors.primary,
  },

  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.7,
    color: loginColors.text,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 23,
    color: loginColors.textSecondary,
    marginTop: 9,
  },

  formContainer: {
    width: "100%",
  },

  fieldContainer: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: loginColors.text,
    marginBottom: 9,
  },

  inputContainer: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: loginColors.inputBackground,
    borderWidth: 1,
    borderColor: loginColors.border,
    borderRadius: 14,
    paddingHorizontal: 15,
  },

  inputContainerFocused: {
    borderColor: loginColors.primary,
    borderWidth: 1.5,
  },

  inputContainerError: {
    borderColor: loginColors.danger,
    backgroundColor: "#FFFAFA",
  },

  inputIconContainer: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  inputIcon: {
    fontSize: 18,
    color: loginColors.textSecondary,
  },

  input: {
    flex: 1,
    minHeight: 54,
    paddingVertical: 12,
    fontSize: 15,
    color: loginColors.text,
  },

  inputPlaceholder: {
    color: loginColors.placeholder,
  },

  passwordToggle: {
    padding: 8,
    marginLeft: 5,
  },

  passwordToggleText: {
    fontSize: 12,
    fontWeight: "700",
    color: loginColors.primary,
  },

  fieldError: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 17,
    color: loginColors.danger,
  },

  formOptions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: 26,
  },

  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: loginColors.border,
    backgroundColor: loginColors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  checkboxChecked: {
    backgroundColor: loginColors.primary,
    borderColor: loginColors.primary,
  },

  checkboxCheckmark: {
    fontSize: 13,
    color: loginColors.white,
    fontWeight: "900",
  },

  rememberMeText: {
    fontSize: 12,
    color: loginColors.textSecondary,
    fontWeight: "500",
  },

  forgotPasswordButton: {
    paddingVertical: 5,
    paddingLeft: 8,
  },

  forgotPasswordText: {
    fontSize: 12,
    fontWeight: "700",
    color: loginColors.primary,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: loginColors.dangerBackground,
    borderColor: "#FECACA",
    borderWidth: 1,
    padding: 13,
    borderRadius: 12,
    marginBottom: 20,
  },

  errorIcon: {
    fontSize: 17,
    color: loginColors.danger,
    marginRight: 9,
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: loginColors.danger,
  },

  submitButton: {
    minHeight: 56,
    borderRadius: 15,
    backgroundColor: loginColors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: loginColors.primary,
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
    fontSize: 16,
    fontWeight: "800",
    color: loginColors.white,
  },

  submitButtonIcon: {
    fontSize: 18,
    color: loginColors.white,
    marginLeft: 9,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },

  divider: {
    height: 1,
    flex: 1,
    backgroundColor: loginColors.border,
  },

  dividerText: {
    paddingHorizontal: 13,
    fontSize: 12,
    color: loginColors.textSecondary,
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },

  registerPrompt: {
    fontSize: 13,
    color: loginColors.textSecondary,
  },

  registerLink: {
    fontSize: 13,
    fontWeight: "800",
    color: loginColors.primary,
    marginLeft: 5,
  },

  securityNote: {
    marginTop: 30,
    padding: 15,
    borderRadius: 14,
    backgroundColor: loginColors.lightBlue,
    flexDirection: "row",
    alignItems: "center",
  },

  securityIcon: {
    fontSize: 20,
    marginRight: 11,
  },

  securityTextContainer: {
    flex: 1,
  },

  securityTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: loginColors.text,
  },

  securityDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: loginColors.textSecondary,
    marginTop: 3,
  },

  footer: {
    marginTop: 35,
    alignItems: "center",
  },

  footerText: {
    fontSize: 11,
    color: loginColors.textSecondary,
    textAlign: "center",
  },
});

export default loginScreenStyles;
