import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type StatCardVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "purple"
  | "neutral";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: StatCardVariant;
  trend?: number;
  trendLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
}

const VARIANT_COLORS: Record<
  StatCardVariant,
  {
    background: string;
    accent: string;
    iconBackground: string;
  }
> = {
  primary: {
    background: "#EEF4FF",
    accent: "#2563EB",
    iconBackground: "#DCE8FF",
  },
  success: {
    background: "#EAFBF1",
    accent: "#16A34A",
    iconBackground: "#D0F5DC",
  },
  warning: {
    background: "#FFF7E6",
    accent: "#D97706",
    iconBackground: "#FDECC8",
  },
  danger: {
    background: "#FFF0F0",
    accent: "#DC2626",
    iconBackground: "#FDDDDD",
  },
  purple: {
    background: "#F4EEFF",
    accent: "#7C3AED",
    iconBackground: "#E9DDFF",
  },
  neutral: {
    background: "#F1F5F9",
    accent: "#475569",
    iconBackground: "#E2E8F0",
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = "primary",
  trend,
  trendLabel,
  onPress,
  style,
  loading = false,
}) => {
  const colors = VARIANT_COLORS[variant];

  const content = (
    <View style={[styles.card, { backgroundColor: colors.background }, style]}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text numberOfLines={2} style={styles.title}>
            {title}
          </Text>
        </View>

        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.iconBackground },
          ]}
        >
          {icon || (
            <Text style={[styles.defaultIcon, { color: colors.accent }]}>
              #
            </Text>
          )}
        </View>
      </View>

      <Text
        accessibilityLabel={`${title}: ${value}`}
        style={[styles.value, { color: colors.accent }]}
      >
        {loading ? "—" : value}
      </Text>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {typeof trend === "number" ? (
        <View style={styles.trendRow}>
          <Text
            style={[
              styles.trendValue,
              {
                color: trend >= 0 ? "#15803D" : "#DC2626",
              },
            ]}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </Text>

          {trendLabel ? (
            <Text style={styles.trendLabel}>{trendLabel}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${value}`}
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 145,
    minHeight: 150,
    borderRadius: 17,
    padding: 16,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    minHeight: 38,
  },
  title: {
    color: "#526078",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  defaultIcon: {
    fontSize: 23,
    fontWeight: "800",
  },
  value: {
    fontSize: 29,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 4,
  },
  subtitle: {
    color: "#718096",
    fontSize: 11,
    marginTop: 2,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  trendValue: {
    fontSize: 11,
    fontWeight: "800",
  },
  trendLabel: {
    color: "#718096",
    fontSize: 10,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});

export default StatCard;
