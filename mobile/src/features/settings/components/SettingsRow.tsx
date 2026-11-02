// mobile/src/features/settings/components/SettingsRow.tsx

import React, { memo } from "react";

import { Pressable, Switch, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import styles, { COLORS } from "../styles/SettingsScreen.styles";

type IconName = keyof typeof Ionicons.glyphMap;

interface SettingsRowProps {
  icon: IconName;
  title: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  showDivider?: boolean;
  danger?: boolean;
  disabled?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  iconColor?: string;
  badge?: string;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  title,
  description,
  value,
  onPress,
  showArrow = true,
  showDivider = true,
  danger = false,
  disabled = false,
  switchValue,
  onSwitchChange,
  iconColor,
  badge,
}) => {
  const isSwitch = typeof switchValue === "boolean";

  const content = (
    <>
      <View
        style={[styles.settingsRowIcon, danger && styles.settingsRowDangerIcon]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={iconColor ?? (danger ? COLORS.danger : COLORS.primary)}
        />
      </View>

      <View style={styles.settingsRowContent}>
        <View style={styles.settingsRowTitleLine}>
          <Text
            style={[
              styles.settingsRowTitle,
              danger && styles.settingsRowDangerText,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>

          {badge ? (
            <View style={styles.settingsBadge}>
              <Text style={styles.settingsBadgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>

        {description ? (
          <Text style={styles.settingsRowDescription} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text style={styles.settingsRowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}

      {isSwitch && onSwitchChange ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          disabled={disabled}
          trackColor={{
            false: COLORS.border,
            true: COLORS.primaryLight,
          }}
          thumbColor={switchValue ? COLORS.primary : "#F8FAFC"}
          ios_backgroundColor={COLORS.border}
        />
      ) : showArrow && !isSwitch ? (
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      ) : null}
    </>
  );

  return (
    <View
      style={[
        styles.settingsRowWrapper,
        showDivider && styles.settingsRowDivider,
      ]}
    >
      {onPress && !isSwitch ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onPress}
          style={({ pressed }) => [
            styles.settingsRow,
            pressed && !disabled && styles.settingsRowPressed,
            disabled && styles.settingsRowDisabled,
          ]}
        >
          {content}
        </Pressable>
      ) : (
        <View style={styles.settingsRow}>{content}</View>
      )}
    </View>
  );
};

export default memo(SettingsRow);
