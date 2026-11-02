// mobile/src/features/claims/components/ClaimStatusBadge.tsx

import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import type { ClaimStatus } from "../services/claimsApi";

interface ClaimStatusBadgeProps {
  status: ClaimStatus | string;
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
  showDot?: boolean;
}

interface StatusAppearance {
  label: string;
  background: string;
  foreground: string;
  dot: string;
}

const STATUS_APPEARANCE: Record<string, StatusAppearance> = {
  PENDING: {
    label: "Pending",
    background: "#FFF4D6",
    foreground: "#956300",
    dot: "#E5A000",
  },
  UNDER_REVIEW: {
    label: "Under review",
    background: "#E8F1FF",
    foreground: "#2459A6",
    dot: "#3979D8",
  },
  APPROVED: {
    label: "Approved",
    background: "#E4F7ED",
    foreground: "#167647",
    dot: "#20A464",
  },
  REJECTED: {
    label: "Rejected",
    background: "#FDE8E8",
    foreground: "#B42318",
    dot: "#D92D20",
  },
  COMPLETED: {
    label: "Completed",
    background: "#E5F3F5",
    foreground: "#176B75",
    dot: "#16838E",
  },
  CANCELLED: {
    label: "Cancelled",
    background: "#F0F0F0",
    foreground: "#60646C",
    dot: "#858B95",
  },
};

const SIZE_CONFIG = {
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    dotSize: 6,
  },
  medium: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    fontSize: 12,
    dotSize: 7,
  },
  large: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    dotSize: 8,
  },
};

const ClaimStatusBadge: React.FC<ClaimStatusBadgeProps> = ({
  status,
  size = "medium",
  style,
  showDot = true,
}) => {
  const appearance = STATUS_APPEARANCE[status] || {
    label: status.replace(/_/g, " ").toLowerCase(),
    background: "#F0F0F0",
    foreground: "#555555",
    dot: "#858B95",
  };

  const dimensions = SIZE_CONFIG[size];

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Claim status: ${appearance.label}`}
      style={[
        styles.container,
        {
          backgroundColor: appearance.background,
          paddingHorizontal: dimensions.paddingHorizontal,
          paddingVertical: dimensions.paddingVertical,
        },
        style,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: appearance.dot,
              width: dimensions.dotSize,
              height: dimensions.dotSize,
              borderRadius: dimensions.dotSize / 2,
            },
          ]}
        />
      )}

      <Text
        style={[
          styles.label,
          {
            color: appearance.foreground,
            fontSize: dimensions.fontSize,
          },
        ]}
      >
        {appearance.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
    gap: 6,
  },
  dot: {
    flexShrink: 0,
  },
  label: {
    fontWeight: "700",
    textTransform: "capitalize",
  },
});

export default ClaimStatusBadge;
