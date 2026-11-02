// mobile/src/features/reports/components/ReportCard.tsx

import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

import type {
  Report,
  ReportPriority,
  ReportStatus,
  ReportType,
} from "../services/reportsApi";

interface ReportCardProps {
  report: Report;
  onPress?: (report: Report) => void;
  onWithdraw?: (report: Report) => void;
  showWithdrawButton?: boolean;
  compact?: boolean;
  style?: ViewStyle;
}

interface Appearance {
  label: string;
  color: string;
  background: string;
}

const STATUS_APPEARANCE: Record<ReportStatus, Appearance> = {
  PENDING: {
    label: "Pending",
    color: "#956300",
    background: "#FFF4D6",
  },
  UNDER_REVIEW: {
    label: "Under review",
    color: "#2459A6",
    background: "#E8F1FF",
  },
  RESOLVED: {
    label: "Resolved",
    color: "#167647",
    background: "#E4F7ED",
  },
  DISMISSED: {
    label: "Dismissed",
    color: "#B42318",
    background: "#FDE8E8",
  },
  CLOSED: {
    label: "Closed",
    color: "#60646C",
    background: "#F0F0F0",
  },
};

const PRIORITY_APPEARANCE: Record<ReportPriority, Appearance> = {
  LOW: {
    label: "Low priority",
    color: "#39734F",
    background: "#E8F5EC",
  },
  MEDIUM: {
    label: "Medium priority",
    color: "#956300",
    background: "#FFF4D6",
  },
  HIGH: {
    label: "High priority",
    color: "#B54708",
    background: "#FFF0E0",
  },
  URGENT: {
    label: "Urgent",
    color: "#B42318",
    background: "#FDE8E8",
  },
};

const TYPE_LABELS: Record<ReportType, string> = {
  LOST_ITEM: "Lost item",
  FOUND_ITEM: "Found item",
  CLAIM: "Claim issue",
  USER: "User report",
  OTHER: "Other",
};

const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onPress,
  onWithdraw,
  showWithdrawButton = false,
  compact = false,
  style,
}) => {
  const statusAppearance = STATUS_APPEARANCE[report.status] || {
    label: report.status,
    color: "#60646C",
    background: "#F0F0F0",
  };

  const priorityAppearance = report.priority
    ? PRIORITY_APPEARANCE[report.priority]
    : null;

  const itemImage = report.item?.imageUrls?.[0];

  const canWithdraw =
    report.status === "PENDING" && showWithdrawButton && Boolean(onWithdraw);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Report ${report.title}, status ${statusAppearance.label}`}
      onPress={() => onPress?.(report)}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.typeContainer}>
          <View style={styles.typeIcon}>
            <Text style={styles.typeIconText}>{getTypeIcon(report.type)}</Text>
          </View>

          <View style={styles.typeTextContainer}>
            <Text style={styles.typeLabel}>
              {TYPE_LABELS[report.type] || "Other"}
            </Text>
            <Text style={styles.reportReference}>
              ID: {report.id.slice(0, 8)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusAppearance.background },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusAppearance.color },
            ]}
          />
          <Text style={[styles.statusText, { color: statusAppearance.color }]}>
            {statusAppearance.label}
          </Text>
        </View>
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {report.title}
      </Text>

      <Text numberOfLines={compact ? 2 : 3} style={styles.description}>
        {report.description}
      </Text>

      {!!report.item && (
        <View style={styles.relatedItem}>
          {itemImage ? (
            <Image
              source={{ uri: itemImage }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.itemImagePlaceholder}>
              <Text style={styles.itemImagePlaceholderText}>📦</Text>
            </View>
          )}

          <View style={styles.relatedItemDetails}>
            <Text style={styles.relatedItemLabel}>RELATED ITEM</Text>

            <Text numberOfLines={1} style={styles.relatedItemTitle}>
              {report.item.title}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.metadataRow}>
        <View style={styles.dateContainer}>
          <Text style={styles.metadataIcon}>◷</Text>
          <Text style={styles.dateText}>{formatDate(report.createdAt)}</Text>
        </View>

        {priorityAppearance && (
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: priorityAppearance.background,
              },
            ]}
          >
            <Text
              style={[styles.priorityText, { color: priorityAppearance.color }]}
            >
              {priorityAppearance.label}
            </Text>
          </View>
        )}
      </View>

      {canWithdraw && (
        <View style={styles.actionContainer}>
          <Pressable
            accessibilityRole="button"
            onPress={(event) => {
              event.stopPropagation();
              onWithdraw?.(report);
            }}
            style={styles.withdrawButton}
          >
            <Text style={styles.withdrawButtonText}>Withdraw report</Text>
          </Pressable>
        </View>
      )}

      {!compact && (
        <View style={styles.bottomRow}>
          <Text style={styles.bottomHint}>Tap to view report details</Text>
          <Text style={styles.arrow}>›</Text>
        </View>
      )}
    </Pressable>
  );
};

function getTypeIcon(type: ReportType): string {
  const icons: Record<ReportType, string> = {
    LOST_ITEM: "🔍",
    FOUND_ITEM: "📦",
    CLAIM: "📋",
    USER: "👤",
    OTHER: "📝",
  };

  return icons[type] || "📝";
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E5EAF1",
    backgroundColor: "#FFFFFF",
    gap: 11,
  },
  compactCard: {
    padding: 12,
    borderRadius: 13,
    gap: 8,
  },
  pressed: {
    opacity: 0.78,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  typeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  typeIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EDF3FC",
    alignItems: "center",
    justifyContent: "center",
  },
  typeIconText: {
    fontSize: 18,
  },
  typeTextContainer: {
    flex: 1,
    gap: 3,
  },
  typeLabel: {
    color: "#344054",
    fontSize: 11,
    fontWeight: "800",
  },
  reportReference: {
    color: "#98A2B3",
    fontSize: 9,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  title: {
    color: "#18243A",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
  description: {
    color: "#667085",
    fontSize: 12,
    lineHeight: 19,
  },
  relatedItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 9,
    borderRadius: 11,
    backgroundColor: "#F8FAFC",
  },
  itemImage: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: "#E9EDF3",
  },
  itemImagePlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: "#EAF1FC",
    alignItems: "center",
    justifyContent: "center",
  },
  itemImagePlaceholderText: {
    fontSize: 19,
  },
  relatedItemDetails: {
    flex: 1,
    gap: 4,
  },
  relatedItemLabel: {
    color: "#98A2B3",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  relatedItemTitle: {
    color: "#344054",
    fontSize: 11,
    fontWeight: "700",
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metadataIcon: {
    color: "#98A2B3",
    fontSize: 15,
  },
  dateText: {
    color: "#98A2B3",
    fontSize: 10,
  },
  priorityBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: "800",
  },
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: "#EDF0F4",
    paddingTop: 10,
  },
  withdrawButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: "#FFF0F0",
  },
  withdrawButtonText: {
    color: "#B42318",
    fontSize: 10,
    fontWeight: "800",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EDF0F4",
    paddingTop: 9,
  },
  bottomHint: {
    color: "#98A2B3",
    fontSize: 9,
  },
  arrow: {
    color: "#2458A6",
    fontSize: 21,
  },
});

export default ReportCard;
