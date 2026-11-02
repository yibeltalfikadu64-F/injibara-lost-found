// mobile/src/features/settings/styles/SettingsScreen.styles.ts

import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',

  background: '#F8FAFC',
  surface: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  success: '#16A34A',
  successLight: '#DCFCE7',

  danger: '#DC2626',
  dangerLight: '#FEE2E2',

  warning: '#D97706',
  warningLight: '#FEF3C7',

  purple: '#9333EA',
  purpleLight: '#F3E8FF',

  white: '#FFFFFF',
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

  scrollContent: {
    paddingBottom: 40,
  },

  content: {
    paddingHorizontal: SPACING.xl,
  },

  // ----------------------------------------------------
  // Screen header
  // ----------------------------------------------------

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.17)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ----------------------------------------------------
  // Settings section
  // ----------------------------------------------------

  section: {
    marginTop: SPACING.xxl,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },

  sectionDescription: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },

  sectionCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },

  // ----------------------------------------------------
  // Settings row
  // ----------------------------------------------------

  settingsRowWrapper: {
    backgroundColor: COLORS.white,
  },

  settingsRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },

  settingsRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  settingsRowPressed: {
    backgroundColor: '#F8FAFC',
  },

  settingsRowDisabled: {
    opacity: 0.5,
  },

  settingsRowIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingsRowDangerIcon: {
    backgroundColor: COLORS.dangerLight,
  },

  settingsRowContent: {
    flex: 1,
    minWidth: 0,
  },

  settingsRowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  settingsRowTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },

  settingsRowDangerText: {
    color: COLORS.danger,
  },

  settingsRowDescription: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  settingsRowValue: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 100,
    textAlign: 'right',
  },

  settingsBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },

  settingsBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
  },

  // ----------------------------------------------------
  // Settings screen intro card
  // ----------------------------------------------------

  introCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },

  introIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },

  introDescription: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 4,
  },

  // ----------------------------------------------------
  // Subscreen header
  // ----------------------------------------------------

  subHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },

  subHeaderContent: {
    flex: 1,
  },

  subHeaderTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },

  subHeaderSubtitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 3,
  },

  // ----------------------------------------------------
  // Language options
  // ----------------------------------------------------

  languageCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.lg,
  },

  languageOption: {
    minHeight: 75,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },

  languageOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  languageFlag: {
    width: 43,
    height: 43,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  languageFlagText: {
    fontSize: 23,
  },

  languageContent: {
    flex: 1,
  },

  languageName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },

  languageNativeName: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },

  languageSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },

  languageCheck: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ----------------------------------------------------
  // Notification settings
  // ----------------------------------------------------

  notificationSummary: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },

  notificationSummaryText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },

  // ----------------------------------------------------
  // Privacy
  // ----------------------------------------------------

  privacyNotice: {
    backgroundColor: COLORS.successLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },

  privacyNoticeText: {
    flex: 1,
    color: '#166534',
    fontSize: 11,
    lineHeight: 17,
  },

  privacyInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },

  privacyInfoTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },

  privacyInfoText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 19,
  },

  // ----------------------------------------------------
  // About screen
  // ----------------------------------------------------

  aboutHero: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },

  aboutLogo: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },

  aboutTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },

  aboutSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: SPACING.sm,
  },

  versionBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginTop: SPACING.md,
  },

  versionText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  aboutFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  aboutFeatureIcon: {
    width: 35,
    height: 35,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  aboutFeatureContent: {
    flex: 1,
  },

  aboutFeatureTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },

  aboutFeatureDescription: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 17,
    marginTop: 4,
  },

  // ----------------------------------------------------
  // Buttons
  // ----------------------------------------------------

  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    minHeight: 49,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },

  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    minHeight: 47,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },

  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  // ----------------------------------------------------
  // Footer
  // ----------------------------------------------------

  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },

  footerText: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 17,
  },

  // ----------------------------------------------------
  // Loading
  // ----------------------------------------------------

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },

  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: SPACING.md,
  },

  // ----------------------------------------------------
  // Empty / error
  // ----------------------------------------------------

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: SPACING.md,
  },

  emptyDescription: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // ----------------------------------------------------
  // Confirmation / helper
  // ----------------------------------------------------

  helperText: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: SPACING.md,
  },
});

export default styles;