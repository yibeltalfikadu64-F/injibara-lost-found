import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type ClaimStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ClaimCardData {
  id: string;
  itemId?: string;
  itemTitle: string;
  claimantName: string;
  claimantEmail?: string;
  claimantPhone?: string;
  description?: string;
  submittedAt?: string;
  status: ClaimStatus;
  referenceNumber?: string;
}

interface ClaimCardProps {
  claim: ClaimCardData;
  onPress?: (claim: ClaimCardData) => void;
  onApprove?: (claim: ClaimCardData) => void;
  onReject?: (claim: ClaimCardData) => void;
  showReviewActions?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

const STATUS_COLORS: Record<
  ClaimStatus,
  {
    background: string;
    text: string;
    label: string;
  }
> = {
  PENDING: {
    background: '#FFF4D6',
    text: '#A16207',
    label: 'Pending',
  },
  UNDER_REVIEW: {
    background: '#E8F1FF',
    text: '#1D4ED8',
    label: 'Under Review',
  },
  APPROVED: {
    background: '#DCFCE7',
    text: '#15803D',
    label: 'Approved',
  },
  REJECTED: {
    background: '#FEE2E2',
    text: '#B91C1C',
    label: 'Rejected',
  },
  COMPLETED: {
    background: '#CCFBF1',
    text: '#0F766E',
    label: 'Completed',
  },
  CANCELLED: {
    background: '#F1F5F9',
    text: '#64748B',
    label: 'Cancelled',
  },
};

const formatDate = (date?: string) => {
  if (!date) return 'Date unavailable';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString();
};

const getInitials = (name: string) => {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

const ClaimCard: React.FC<ClaimCardProps> = ({
  claim,
  onPress,
  onApprove,
  onReject,
  showReviewActions = false,
  compact = false,
  style,
}) => {
  const status = STATUS_COLORS[claim.status];

  const handlePress = () => {
    onPress?.(claim);
  };

  const handleApprove = () => {
    onApprove?.(claim);
  };

  const handleReject = () => {
    onReject?.(claim);
  };

  const showActions =
    showReviewActions &&
    claim.status === 'PENDING' &&
    (onApprove || onReject);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Claim for ${claim.itemTitle} by ${claim.claimantName}`}
      disabled={!onPress}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(claim.claimantName) || '?'}
          </Text>
        </View>

        <View style={styles.claimantInfo}>
          <Text
            numberOfLines={1}
            style={styles.claimantName}
          >
            {claim.claimantName}
          </Text>

          {claim.claimantEmail ? (
            <Text
              numberOfLines={1}
              style={styles.email}
            >
              {claim.claimantEmail}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: status.background },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: status.text },
            ]}
          >
            {status.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.itemSection}>
        <Text style={styles.sectionLabel}>CLAIMED ITEM</Text>

        <Text
          numberOfLines={2}
          style={styles.itemTitle}
        >
          {claim.itemTitle}
        </Text>

        {claim.description ? (
          <Text
            numberOfLines={compact ? 1 : 3}
            style={styles.description}
          >
            {claim.description}
          </Text>
        ) : null}
      </View>

      {claim.claimantPhone ? (
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>☎</Text>
          <Text style={styles.detailText}>
            {claim.claimantPhone}
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Submitted</Text>
          <Text style={styles.footerValue}>
            {formatDate(claim.submittedAt)}
          </Text>
        </View>

        {claim.referenceNumber ? (
          <View style={styles.referenceContainer}>
            <Text style={styles.footerLabel}>Reference</Text>
            <Text style={styles.footerValue}>
              {claim.referenceNumber}
            </Text>
          </View>
        ) : null}
      </View>

      {showActions ? (
        <View style={styles.actions}>
          {onReject ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleReject}
              style={({ pressed }) => [
                styles.rejectButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </Pressable>
          ) : null}

          {onApprove ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleApprove}
              style={({ pressed }) => [
                styles.approveButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.approveText}>Approve</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 16,
    marginBottom: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EDF4',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  compactCard: {
    padding: 12,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
  },
  claimantInfo: {
    flex: 1,
  },
  claimantName: {
    color: '#172033',
    fontSize: 14,
    fontWeight: '800',
  },
  email: {
    color: '#718096',
    fontSize: 11,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8EDF4',
    marginVertical: 14,
  },
  itemSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  itemTitle: {
    color: '#172033',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  description: {
    color: '#718096',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  detailIcon: {
    color: '#2563EB',
    fontSize: 15,
  },
  detailText: {
    color: '#526078',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8EDF4',
  },
  footerLabel: {
    color: '#94A3B8',
    fontSize: 10,
    marginBottom: 4,
  },
  footerValue: {
    color: '#526078',
    fontSize: 11,
    fontWeight: '600',
  },
  referenceContainer: {
    alignItems: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  rejectButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '800',
  },
  approveButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.75,
  },
});

export default ClaimCard;