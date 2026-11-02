// mobile/src/features/search/components/SortSelector.tsx

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { SearchSortOption } from "../services/searchApi";

interface SortSelectorProps {
  value: SearchSortOption;
  onChange: (value: SearchSortOption) => void;
  compact?: boolean;
}

interface SortOption {
  label: string;
  value: SearchSortOption;
  description: string;
  icon: string;
}

const SORT_OPTIONS: SortOption[] = [
  {
    label: "Newest first",
    value: "newest",
    description: "Recently reported items",
    icon: "↓",
  },
  {
    label: "Oldest first",
    value: "oldest",
    description: "Earlier reported items",
    icon: "↑",
  },
  {
    label: "Title A–Z",
    value: "title_asc",
    description: "Alphabetical order",
    icon: "A",
  },
  {
    label: "Title Z–A",
    value: "title_desc",
    description: "Reverse alphabetical order",
    icon: "Z",
  },
];

const COLORS = {
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  white: "#FFFFFF",
  background: "#F8FAFC",
};

export default function SortSelector({
  value,
  onChange,
  compact = false,
}: SortSelectorProps) {
  return (
    <View style={styles.container}>
      {!compact && (
        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Sort results</Text>
          <Text style={styles.subtitle}>Choose how results are displayed</Text>
        </View>
      )}

      <View style={compact ? styles.compactOptions : styles.options}>
        {SORT_OPTIONS.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                compact && styles.compactOption,
                selected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View
                style={[
                  styles.iconContainer,
                  selected && styles.iconContainerSelected,
                ]}
              >
                <Text style={[styles.icon, selected && styles.iconSelected]}>
                  {option.icon}
                </Text>
              </View>

              <View style={styles.optionTextContainer}>
                <Text
                  style={[
                    styles.optionTitle,
                    selected && styles.optionTitleSelected,
                  ]}
                >
                  {option.label}
                </Text>

                {!compact && (
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.radioOuter,
                  selected && styles.radioOuterSelected,
                ]}
              >
                {selected && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  headingContainer: {
    marginBottom: 13,
  },

  heading: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 4,
  },

  options: {
    gap: 9,
  },

  compactOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  option: {
    minHeight: 67,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  compactOption: {
    minHeight: 40,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },

  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  iconContainerSelected: {
    backgroundColor: COLORS.white,
  },

  icon: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.secondary,
  },

  iconSelected: {
    color: COLORS.primary,
  },

  optionTextContainer: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
  },

  optionTitleSelected: {
    color: COLORS.primary,
  },

  optionDescription: {
    fontSize: 9,
    color: COLORS.secondary,
    marginTop: 4,
  },

  radioOuter: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  radioOuterSelected: {
    borderColor: COLORS.primary,
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  pressed: {
    opacity: 0.75,
  },
});
