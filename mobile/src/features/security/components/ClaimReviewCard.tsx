// mobile/src/features/security/components/ClaimReviewCard.tsx

import React, { memo } from 'react';

import {
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  SecurityClaim,
  securityApi,
} from '../services/securityApi';

import styles, {
  COLORS,
} from '../styles/SecurityScreen.styles';

// ======================================================
// PROPS
// ======================================================

interface ClaimReviewCardProps {
  claim: SecurityClaim;

  onPress?: (claim: SecurityClaim) => void;

  onApprove?: (claim: SecurityClaim) => void;

  onReject?: (claim: SecurityClaim) => void;

  onRequestInformation?: (claim: SecurityClaim) => void;

  disabled?: boolean;
}

// ======================================================
// STATUS CONFIGURATION
// ======================================================

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    background: string;
    color: string;
  }
> = {
  PENDING: {
    label: 'Pending',
    background: COLORS.warningLight,
    color: COLORS.warning,
  },

  UNDER_REVIEW: {
    label: 'Under Review',
    background: COLORS.primaryLight,
    color: COLORS.primary,
  },

  APPROVED: {
    label: 'Approved',
    background: COLORS.successLight,
    color: COLORS.success,
  },

  REJECTED: {
    label: 'Rejected',
    background: COLORS.dangerLight,
    color: COLORS.danger,
  },

  ADDITIONAL_INFORMATION_REQUIRED: {
    label: 'More Information',
    background: COLORS.warningLight,
    color: COLORS.warning,
  },

  HANDED_OVER: {
    label: 'Handed Over',
    background: COLORS.successLight,
    color: COLORS.success,
  },

  CANCELLED: {
    label: 'Cancelled',
    background: COLORS.borderLight,
    color: COLORS.textMuted,
  },
};

// ======================================================
// COMPONENT
// ======================================================

const ClaimReviewCard: React.FC<ClaimReviewCardProps> = ({
  claim,
  onPress,
  onApprove,
  onReject,
  onRequestInformation,
  disabled = false,
}) => {
  const claimantName = securityApi.getPersonName(
    claim.claimant,
  );

  const itemTitle =
    claim.item?.title ?? 'Unknown item';

  const itemImage = claim.item?.imageUrls?.[0];

  const status =
    STATUS_CONFIG[claim.status] ??
    STATUS_CONFIG.PENDING;

  const canReview =
    claim.status === 'PENDING' ||
    claim.status === 'UNDER_REVIEW';

  const createdDate = securityApi.formatSecurityDate(
    claim.createdAt,
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open claim for ${itemTitle}`}
      disabled={!onPress || disabled}
      onPress={() => onPress?.(claim)}
      style={({ pressed }) => [
        styles.claimCard,
        pressed && onPress && { opacity: 0.85 },
      ]}
    >
      {/* Header */}
      <View style={styles.cardTop}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>
            {itemTitle}
          </Text>

          <Text style={styles.cardSubtitle}>
            Claim ID: {claim.claimNumber ?? claim.id}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: status.background },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              { color: status.color },
            ]}
          >
            {status.label}
          </Text>
        </View>
      </View>

      {/* Item preview */}
      <View style={styles.itemPreview}>
        {itemImage ? (
          <Image
            source={{ uri: itemImage }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Ionicons
              name="cube-outline"
              size={25}
              color={COLORS.primary}
            />
          </View>
        )}

        <View style={styles.itemPreviewContent}>
          <Text style={styles.itemTitle}>
            {claim.item?.category &&
            typeof claim.item.category === 'object'
              ? claim.item.category.name ?? 'Uncategorized'
              : claim.item?.category ?? 'Uncategorized'}
          </Text>

          <Text
            style={styles.itemDescription}
            numberOfLines={2}
          >
            {claim.item?.description ??
              claim.description ??
              'No item description available.'}
          </Text>
        </View>
      </View>

      {/* Claimant */}
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.userInitials}>
            {claimantName
              .split(' ')
              .map((part) => part[0])
              .filter(Boolean)
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </Text>
        </View>

        <View style={styles.userInfoContent}>
          <Text style={styles.userName}>
            {claimantName}
          </Text>

          <Text style={styles.userEmail}>
            {claim.claimant?.email ?? 'No email available'}
          </Text>
        </View>
      </View>

      {/* Description */}
      {claim.reason || claim.description ? (
        <Text
          style={styles.cardDescription}
          numberOfLines={3}
        >
          {claim.reason ?? claim.description}
        </Text>
      ) : null}

      {/* Date */}
      <View style={styles.cardDivider} />

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>
          Submitted
        </Text>

        <Text style={styles.detailValue}>
          {createdDate}
        </Text>
      </View>

      {claim.verificationAnswers?.length ? (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>
            Verification Questions
          </Text>

          <Text style={styles.detailValue}>
            {claim.verificationAnswers.length} answers
          </Text>
        </View>
      ) : null}

      {/* Actions */}
      {canReview ? (
        <View style={styles.actionRow}>
          {onApprove ? (
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={(event) => {
                event.stopPropagation();
                onApprove(claim);
              }}
              style={[
                styles.successButton,
                disabled && styles.disabledButton,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={COLORS.white}
              />

              <Text
                style={[
                  styles.buttonText,
                  styles.successButtonText,
                ]}
              >
                Approve
              </Text>
            </Pressable>
          ) : null}

          {onRequestInformation ? (
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={(event) => {
                event.stopPropagation();
                onRequestInformation(claim);
              }}
              style={[
                styles.warningButton,
                disabled && styles.disabledButton,
              ]}
            >
              <Ionicons
                name="help-circle-outline"
                size={16}
                color={COLORS.warning}
              />

              <Text
                style={[
                  styles.buttonText,
                  styles.warningButtonText,
                ]}
              >
                Request Info
              </Text>
            </Pressable>
          ) : null}

          {onReject ? (
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={(event) => {
                event.stopPropagation();
                onReject(claim);
              }}
              style={[
                styles.dangerButton,
                disabled && styles.disabledButton,
              ]}
            >
              <Ionicons
                name="close-circle-outline"
                size={16}
                color={COLORS.danger}
              />

              <Text
                style={[
                  styles.buttonText,
                  styles.dangerButtonText,
                ]}
              >
                Reject
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
};

export default memo(ClaimReviewCard);