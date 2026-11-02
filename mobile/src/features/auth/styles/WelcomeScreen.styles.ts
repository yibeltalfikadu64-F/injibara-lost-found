// mobile/src/features/auth/styles/WelcomeScreen.styles.ts

import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

const isSmallScreen = height < 700;

export const welcomeColors = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  secondary: "#0F172A",
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  lightBlue: "#EFF6FF",
  success: "#16A34A",
};

export const welcomeScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: welcomeColors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: 24,
  },

  topSection: {
    alignItems: "center",
    paddingTop: isSmallScreen ? 30 : 55,
  },

  logoContainer: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: welcomeColors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: welcomeColors.border,
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 5,
  },

  logo: {
    width: 82,
    height: 82,
    resizeMode: "contain",
  },

  logoPlaceholder: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: welcomeColors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    fontSize: 30,
    fontWeight: "900",
    color: welcomeColors.primary,
  },

  universityName: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textAlign: "center",
    color: welcomeColors.textSecondary,
    textTransform: "uppercase",
  },

  heroSection: {
    alignItems: "center",
    paddingHorizontal: 4,
    marginTop: isSmallScreen ? 30 : 45,
  },

  illustrationContainer: {
    width: width * 0.72,
    height: isSmallScreen ? 150 : 190,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  illustrationBackground: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
    backgroundColor: welcomeColors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  illustrationIcon: {
    fontSize: 82,
    color: welcomeColors.primary,
  },

  illustrationCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#DBEAFE",
    opacity: 0.8,
  },

  illustrationCircleSmall: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#BFDBFE",
    top: 14,
    right: 20,
  },

  illustrationCircleBottom: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#BFDBFE",
    bottom: 18,
    left: 22,
  },

  title: {
    fontSize: isSmallScreen ? 29 : 34,
    lineHeight: isSmallScreen ? 37 : 43,
    fontWeight: "900",
    color: welcomeColors.text,
    textAlign: "center",
    letterSpacing: -0.8,
  },

  highlightedTitle: {
    color: welcomeColors.primary,
  },

  description: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 25,
    fontWeight: "400",
    color: welcomeColors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 8,
  },

  featureContainer: {
    marginTop: 30,
    width: "100%",
    gap: 16,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: welcomeColors.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: welcomeColors.border,
  },

  featureIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: welcomeColors.lightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  featureIcon: {
    fontSize: 20,
  },

  featureTextContainer: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: welcomeColors.text,
  },

  featureDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: welcomeColors.textSecondary,
    marginTop: 3,
  },

  bottomSection: {
    width: "100%",
    paddingTop: 30,
    paddingBottom: 12,
  },

  primaryButton: {
    minHeight: 56,
    backgroundColor: welcomeColors.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: welcomeColors.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: welcomeColors.white,
  },

  secondaryButton: {
    minHeight: 56,
    backgroundColor: welcomeColors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: welcomeColors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 13,
  },

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: welcomeColors.text,
  },

  buttonIcon: {
    marginLeft: 10,
    fontSize: 18,
    color: welcomeColors.white,
  },

  footer: {
    marginTop: 22,
    alignItems: "center",
  },

  footerText: {
    fontSize: 11,
    color: welcomeColors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },

  footerLink: {
    color: welcomeColors.primary,
    fontWeight: "700",
  },

  universityFooter: {
    fontSize: 11,
    fontWeight: "600",
    color: welcomeColors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
});

export default welcomeScreenStyles;
