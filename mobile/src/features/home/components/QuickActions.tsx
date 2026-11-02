// mobile/src/features/home/components/QuickActions.tsx

import React from "react";

import { Pressable, Text, View } from "react-native";

import styles from "../styles/HomeScreen.styles";

/* =========================================================
   TYPES
========================================================= */

export type QuickActionType =
  | "REPORT_LOST"
  | "REPORT_FOUND"
  | "SEARCH"
  | "MY_CLAIMS";

export interface QuickAction {
  id: QuickActionType;

  title: string;

  description: string;

  icon: string;

  backgroundColor: string;

  onPress: () => void;
}

interface QuickActionsProps {
  onReportLost: () => void;

  onReportFound: () => void;

  onSearch: () => void;

  onMyClaims: () => void;

  disabled?: boolean;
}

/* =========================================================
   ACTION CONFIGURATION
========================================================= */

const ACTION_CONFIG = [
  {
    id: "REPORT_LOST" as const,
    title: "Report Lost",
    description: "Report a missing item",
    icon: "🔍",
    backgroundColor: "#EFF6FF",
  },

  {
    id: "REPORT_FOUND" as const,
    title: "Report Found",
    description: "Report an item you found",
    icon: "📦",
    backgroundColor: "#ECFDF5",
  },

  {
    id: "SEARCH" as const,
    title: "Search Items",
    description: "Find reported items",
    icon: "🔎",
    backgroundColor: "#F5F3FF",
  },

  {
    id: "MY_CLAIMS" as const,
    title: "My Claims",
    description: "Track your requests",
    icon: "📋",
    backgroundColor: "#FFF7ED",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const QuickActions: React.FC<QuickActionsProps> = ({
  onReportLost,
  onReportFound,
  onSearch,
  onMyClaims,
  disabled = false,
}) => {
  const callbacks: Record<QuickActionType, () => void> = {
    REPORT_LOST: onReportLost,
    REPORT_FOUND: onReportFound,
    SEARCH: onSearch,
    MY_CLAIMS: onMyClaims,
  };

  return (
    <View style={styles.quickActionsSection}>
      {/* Section heading */}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <Text style={styles.sectionSubtitle}>
            What would you like to do today?
          </Text>
        </View>
      </View>

      {/* Action grid */}

      <View style={styles.quickActionsGrid}>
        {ACTION_CONFIG.map((action) => (
          <Pressable
            key={action.id}
            disabled={disabled}
            onPress={callbacks[action.id]}
            accessibilityRole="button"
            accessibilityLabel={action.title}
            accessibilityHint={action.description}
            style={({ pressed }) => [
              styles.quickActionCard,
              pressed && styles.quickActionPressed,
              disabled && styles.quickActionDisabled,
            ]}
          >
            <View
              style={[
                styles.quickActionIconContainer,
                {
                  backgroundColor: action.backgroundColor,
                },
              ]}
            >
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
            </View>

            <View style={styles.quickActionTextContainer}>
              <Text style={styles.quickActionTitle}>{action.title}</Text>

              <Text style={styles.quickActionDescription}>
                {action.description}
              </Text>
            </View>

            <Text style={styles.quickActionArrow}>→</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default QuickActions;
