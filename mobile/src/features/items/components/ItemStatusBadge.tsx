// mobile/src/features/items/components/ItemStatusBadge.tsx

import React from "react";

import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

/* =========================================================
   TYPES
========================================================= */

export type ItemStatus =
  | "LOST"
  | "FOUND"
  | "AVAILABLE"
  | "PENDING"
  | "PENDING_APPROVAL"
  | "UNDER_REVIEW"
  | "CLAIMED"
  | "CLAIM_PENDING"
  | "VERIFICATION"
  | "VERIFIED"
  | "APPROVED"
  | "REJECTED"
  | "RETURNED"
  | "RESOLVED"
  | "CLOSED"
  | "EXPIRED"
  | "CANCELLED"
  | "IN_PROGRESS"
  | "UNKNOWN";

interface ItemStatusBadgeProps {
  status: ItemStatus | string;
  size?: "small" | "medium" | "large";
  variant?: "solid" | "soft" | "outline";
  showIcon?: boolean;
  style?: StyleProp<ViewStyle>;
}

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

interface StatusConfig {
  label: string;
  color: string;
  background: string;
  icon: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  LOST: {
    label: "Lost",
    color: "#DC2626",
    background: "#FEE2E2",
    icon: "!",
  },

  FOUND: {
    label: "Found",
    color: "#15803D",
    background: "#DCFCE7",
    icon: "✓",
  },

  AVAILABLE: {
    label: "Available",
    color: "#15803D",
    background: "#DCFCE7",
    icon: "✓",
  },

  PENDING: {
    label: "Pending",
    color: "#B45309",
    background: "#FEF3C7",
    icon: "◷",
  },

  PENDING_APPROVAL: {
    label: "Pending approval",
    color: "#B45309",
    background: "#FEF3C7",
    icon: "◷",
  },

  UNDER_REVIEW: {
    label: "Under review",
    color: "#7C3AED",
    background: "#EDE9FE",
    icon: "◉",
  },

  CLAIMED: {
    label: "Claimed",
    color: "#2563EB",
    background: "#DBEAFE",
    icon: "✓",
  },

  CLAIM_PENDING: {
    label: "Claim pending",
    color: "#B45309",
    background: "#FEF3C7",
    icon: "◷",
  },

  VERIFICATION: {
    label: "Verification",
    color: "#7C3AED",
    background: "#EDE9FE",
    icon: "◉",
  },

  VERIFIED: {
    label: "Verified",
    color: "#15803D",
    background: "#DCFCE7",
    icon: "✓",
  },

  APPROVED: {
    label: "Approved",
    color: "#15803D",
    background: "#DCFCE7",
    icon: "✓",
  },

  REJECTED: {
    label: "Rejected",
    color: "#DC2626",
    background: "#FEE2E2",
    icon: "×",
  },

  RETURNED: {
    label: "Returned",
    color: "#15803D",
    background: "#DCFCE7",
    icon: "✓",
  },

  RESOLVED: {
    label: "Resolved",
    color: "#15803D",
    background: "#DCFCE7",
    icon: "✓",
  },

  CLOSED: {
    label: "Closed",
    color: "#475569",
    background: "#E2E8F0",
    icon: "×",
  },

  EXPIRED: {
    label: "Expired",
    color: "#475569",
    background: "#E2E8F0",
    icon: "◷",
  },

  CANCELLED: {
    label: "Cancelled",
    color: "#DC2626",
    background: "#FEE2E2",
    icon: "×",
  },

  IN_PROGRESS: {
    label: "In progress",
    color: "#2563EB",
    background: "#DBEAFE",
    icon: "◉",
  },
};

/* =========================================================
   COMPONENT
========================================================= */

const ItemStatusBadge: React.FC<ItemStatusBadgeProps> = ({
  status,
  size = "medium",
  variant = "soft",
  showIcon = true,
  style,
}) => {
  const normalizedStatus = String(status || "UNKNOWN")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const config = STATUS_CONFIG[normalizedStatus] || {
    label: normalizedStatus
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    color: "#475569",
    background: "#F1F5F9",
    icon: "•",
  };

  return (
    <View
      style={[
        styles.badge,
        styles[size],
        {
          backgroundColor:
            variant === "solid"
              ? config.color
              : variant === "outline"
                ? "transparent"
                : config.background,
        },
        variant === "outline" && {
          borderWidth: 1,
          borderColor: config.color,
        },
        style,
      ]}
    >
      {showIcon && (
        <Text
          style={[
            styles.icon,
            styles[`${size}Icon`],
            {
              color: variant === "solid" ? "#FFFFFF" : config.color,
            },
          ]}
        >
          {config.icon}
        </Text>
      )}

      <Text
        style={[
          styles.label,
          styles[`${size}Text`],
          {
            color: variant === "solid" ? "#FFFFFF" : config.color,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    gap: 5,
  },

  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  medium: {
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  large: {
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  icon: {
    fontWeight: "900",
  },

  smallIcon: {
    fontSize: 9,
  },

  mediumIcon: {
    fontSize: 11,
  },

  largeIcon: {
    fontSize: 13,
  },

  label: {
    fontWeight: "800",
  },

  smallText: {
    fontSize: 9,
  },

  mediumText: {
    fontSize: 10,
  },

  largeText: {
    fontSize: 12,
  },
});

export default ItemStatusBadge;
