// mobile/src/features/search/components/CategoryFilter.tsx

import React from "react";
import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";

import type { SearchCategory } from "../services/searchApi";

interface CategoryFilterProps {
  categories: SearchCategory[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
  loading?: boolean;
  showTitle?: boolean;
}

const COLORS = {
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  background: "#FFFFFF",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  white: "#FFFFFF",
};

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelect,
  loading = false,
  showTitle = true,
}: CategoryFilterProps) {
  const renderCategory = (id: string, name: string, icon?: string | null) => {
    const selected = selectedCategoryId === id;

    return (
      <Pressable
        key={id || "all"}
        onPress={() => onSelect(id)}
        style={({ pressed }) => [
          styles.categoryChip,
          selected && styles.categoryChipSelected,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected }}
      >
        {icon ? <Text style={styles.categoryIcon}>{icon}</Text> : null}

        <Text
          style={[styles.categoryText, selected && styles.categoryTextSelected]}
        >
          {name}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.headingRow}>
          <Text style={styles.heading}>Categories</Text>

          <Text style={styles.headingHint}>Choose a category</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        >
          {renderCategory("", "All categories", "▦")}

          {categories.map((category) =>
            renderCategory(category.id, category.name, category.icon),
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },

  heading: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
  },

  headingHint: {
    fontSize: 10,
    color: COLORS.secondary,
  },

  list: {
    paddingVertical: 3,
    paddingRight: 15,
    gap: 8,
  },

  categoryChip: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  categoryIcon: {
    fontSize: 12,
    marginRight: 6,
    color: COLORS.text,
  },

  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  categoryTextSelected: {
    color: COLORS.white,
    fontWeight: "900",
  },

  loadingContainer: {
    minHeight: 40,
    justifyContent: "center",
  },

  loadingText: {
    color: COLORS.secondary,
    fontSize: 11,
  },

  pressed: {
    opacity: 0.7,
  },
});
