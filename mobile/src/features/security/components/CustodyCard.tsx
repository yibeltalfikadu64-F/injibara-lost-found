// mobile/src/features/security/components/CustodyCard.tsx

import React, { memo } from "react";

import { Image, Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { CustodyRecord, securityApi } from "../services/securityApi";

import styles, { COLORS } from "../styles/SecurityScreen.styles";

// ======================================================
// PROPS
// ======================================================

interface CustodyCardProps {
  record: CustodyRecord;

  onPress?: (record: CustodyRecord) => void;

  onRelease?: (record: CustodyRecord) => void;

  disabled?: boolean;
}

// ======================================================
// STATUS CONFIGURATION
// ======================================================

const CUSTODY_STATUS: Record<
  string,
  {
    label: string;
    color: string;
    background: string;
  }
> = {
  IN_CUSTODY: {
    label: "In Custody",
    color: COLORS.success,
    background: COLORS.successLight,
  },

  RELEASED: {
    label: "Released",
    color: COLORS.textMuted,
    background: COLORS.borderLight,
  },

  TRANSFERRED: {
    label: "Transferred",
    color: COLORS.primary,
    background: COLORS.primaryLight,
  },

  PENDING_VERIFICATION: {
    label: "Pending Verification",
    color: COLORS.warning,
    background: COLORS.warningLight,
  },
};

// ======================================================
// COMPONENT
// ======================================================

const CustodyCard: React.FC<CustodyCardProps> = ({
  record,
  onPress,
  onRelease,
  disabled = false,
}) => {
  const itemTitle = record.item?.title ?? "Unknown item";

  const imageUrl = record.item?.imageUrls?.[0];

  const status =
    CUSTODY_STATUS[record.status] ?? CUSTODY_STATUS.PENDING_VERIFICATION;

  const receivedBy = securityApi.getPersonName(record.receivedBy);

  const canRelease = record.status === "IN_CUSTODY";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open custody record for ${itemTitle}`}
      disabled={!onPress || disabled}
      onPress={() => onPress?.(record)}
      style={({ pressed }) => [
        styles.custodyCard,
        pressed && onPress && { opacity: 0.85 },
      ]}
    >
      {/* Header */}
      <View style={styles.custodyHeader}>
        <Text style={styles.custodyNumber}>
          {record.custodyNumber ?? `CUSTODY-${record.id.slice(0, 8)}`}
        </Text>

        <View
          style={[styles.statusBadge, { backgroundColor: status.background }]}
        >
          <Text style={[styles.statusBadgeText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* Item */}
      <View style={styles.itemPreview}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Ionicons name="cube-outline" size={25} color={COLORS.primary} />
          </View>
        )}

        <View style={styles.itemPreviewContent}>
          <Text style={styles.itemTitle}>{itemTitle}</Text>

          <Text style={styles.itemDescription} numberOfLines={2}>
            {record.item?.description ?? "No item description available."}
          </Text>
        </View>
      </View>

      {/* Location */}
      <View style={styles.custodyLocation}>
        <Ionicons name="location-outline" size={16} color={COLORS.primary} />

        <Text style={styles.custodyLocationText}>
          Storage: {record.storageLocation || "Not specified"}
        </Text>
      </View>

      {/* Custody details */}
      <View style={styles.cardDivider} />

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Received by</Text>

        <Text style={styles.detailValue}>{receivedBy}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Received date</Text>

        <Text style={styles.detailValue}>
          {securityApi.formatSecurityDate(record.receivedAt)}
        </Text>
      </View>

      {record.claimId ? (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Related claim</Text>

          <Text style={styles.detailValue}>{record.claimId}</Text>
        </View>
      ) : null}

      {record.notes ? (
        <Text style={styles.cardDescription} numberOfLines={3}>
          {record.notes}
        </Text>
      ) : null}

      {/* Release */}
      {canRelease && onRelease ? (
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={(event) => {
            event.stopPropagation();
            onRelease(record);
          }}
          style={[
            styles.primaryButton,
            disabled && styles.disabledButton,
            { marginTop: 15 },
          ]}
        >
          <Ionicons name="log-out-outline" size={17} color={COLORS.white} />

          <Text style={styles.primaryButtonText}>Record Release</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
};

export default memo(CustodyCard);
