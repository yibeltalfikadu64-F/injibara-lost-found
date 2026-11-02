// mobile/src/features/claims/styles/ClaimsScreen.styles.ts

import { StyleSheet } from 'react-native';

export const CLAIM_COLORS = {
  primary: '#2458A6',
  primaryDark: '#183F7A',
  primaryLight: '#EAF1FC',

  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',

  text: '#18243A',
  textSecondary: '#667085',
  textMuted: '#98A2B3',

  border: '#E5EAF1',
  divider: '#EDF0F4',

  success: '#16834B',
  successLight: '#E7F6ED',

  warning: '#A66B00',
  warningLight: '#FFF4D6',

  danger: '#C62828',
  dangerLight: '#FDECEC',

  info: '#2563A6',
  infoLight: '#EAF3FF',

  white: '#FFFFFF',
};

export const CLAIM_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const CLAIM_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 100,
};

export const claimsScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CLAIM_COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
  },

  screenTitle: {
    color: CLAIM_COLORS.text,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  screenSubtitle: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    color: CLAIM_COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },

  card: {
    padding: 15,
    borderRadius: CLAIM_RADIUS.lg,
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    backgroundColor: CLAIM_COLORS.surface,
  },

  cardTitle: {
    color: CLAIM_COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },

  bodyText: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },

  mutedText: {
    color: CLAIM_COLORS.textMuted,
    fontSize: 11,
  },

  divider: {
    height: 1,
    backgroundColor: CLAIM_COLORS.divider,
  },

  inputLabel: {
    color: CLAIM_COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },

  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    borderRadius: CLAIM_RADIUS.md,
    backgroundColor: CLAIM_COLORS.white,
    color: CLAIM_COLORS.text,
    fontSize: 13,
  },

  textArea: {
    minHeight: 120,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    borderRadius: CLAIM_RADIUS.md,
    backgroundColor: CLAIM_COLORS.white,
    color: CLAIM_COLORS.text,
    fontSize: 13,
    lineHeight: 20,
    textAlignVertical: 'top',
  },

  errorText: {
    color: CLAIM_COLORS.danger,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 5,
  },

  primaryButton: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: CLAIM_RADIUS.md,
    backgroundColor: CLAIM_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  primaryButtonText: {
    color: CLAIM_COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },

  secondaryButton: {
    minHeight: 47,
    paddingHorizontal: 16,
    borderRadius: CLAIM_RADIUS.md,
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    backgroundColor: CLAIM_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    color: CLAIM_COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 45,
  },

  emptyIcon: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: CLAIM_COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },

  emptyIconText: {
    fontSize: 30,
  },

  emptyTitle: {
    color: CLAIM_COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyDescription: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },

  errorContainer: {
    padding: 17,
    borderRadius: CLAIM_RADIUS.md,
    borderWidth: 1,
    borderColor: '#F4CACA',
    backgroundColor: CLAIM_COLORS.dangerLight,
  },

  errorTitle: {
    color: CLAIM_COLORS.danger,
    fontSize: 14,
    fontWeight: '800',
  },

  errorDescription: {
    color: '#8C3030',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },

  loadingText: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  gapSmall: {
    gap: 8,
  },

  gapMedium: {
    gap: 12,
  },

  itemImage: {
    width: 76,
    height: 76,
    borderRadius: 13,
    backgroundColor: '#E9EDF3',
  },

  itemImagePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 13,
    backgroundColor: CLAIM_COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemImagePlaceholderText: {
    fontSize: 26,
  },

  itemTitle: {
    color: CLAIM_COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  itemMeta: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: CLAIM_RADIUS.round,
    borderWidth: 1,
    borderColor: CLAIM_COLORS.border,
    backgroundColor: CLAIM_COLORS.white,
  },

  filterChipActive: {
    borderColor: CLAIM_COLORS.primary,
    backgroundColor: CLAIM_COLORS.primary,
  },

  filterChipText: {
    color: CLAIM_COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },

  filterChipTextActive: {
    color: CLAIM_COLORS.white,
  },
});

export default claimsScreenStyles;