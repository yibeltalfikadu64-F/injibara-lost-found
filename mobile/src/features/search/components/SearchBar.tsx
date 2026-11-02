// mobile/src/features/search/components/SearchBar.tsx

import React, { useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
  filterCount?: number;
  showFilterButton?: boolean;
  loading?: boolean;
  editable?: boolean;
  autoFocus?: boolean;
  returnKeyType?: TextInputProps["returnKeyType"];
}

const COLORS = {
  primary: "#2563EB",
  background: "#FFFFFF",
  inputBackground: "#F1F5F9",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  white: "#FFFFFF",
};

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onClear,
  onFilterPress,
  placeholder = "Search lost and found items...",
  filterCount = 0,
  showFilterButton = true,
  loading = false,
  editable = true,
  autoFocus = false,
  returnKeyType = "search",
}: SearchBarProps) {
  const handleClear = useCallback(() => {
    onChangeText("");
    onClear?.();
  }, [onChangeText, onClear]);

  return (
    <View style={styles.container}>
      <View style={styles.searchInputContainer}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={COLORS.secondary}
          style={styles.input}
          returnKeyType={returnKeyType}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="never"
          editable={editable}
          autoFocus={autoFocus}
          accessibilityLabel="Search items"
          accessibilityHint="Enter an item name, description, or location"
        />

        {loading ? (
          <Text style={styles.loadingText}>...</Text>
        ) : value.length > 0 ? (
          <Pressable
            onPress={handleClear}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
          >
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        ) : null}
      </View>

      {showFilterButton && (
        <Pressable
          onPress={onFilterPress}
          style={({ pressed }) => [
            styles.filterButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            filterCount > 0
              ? `Open filters, ${filterCount} active filters`
              : "Open search filters"
          }
        >
          <Text style={styles.filterIcon}>☷</Text>

          {filterCount > 0 && (
            <View style={styles.filterCountBadge}>
              <Text style={styles.filterCountText}>{filterCount}</Text>
            </View>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  searchInputContainer: {
    flex: 1,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBackground,
  },

  searchIcon: {
    width: 27,
    fontSize: 27,
    color: COLORS.secondary,
    textAlign: "center",
    marginRight: 7,
  },

  input: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 13,
  },

  clearButton: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },

  clearText: {
    color: COLORS.text,
    fontSize: 22,
    lineHeight: 24,
  },

  loadingText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "800",
    paddingHorizontal: 7,
  },

  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    position: "relative",
  },

  filterIcon: {
    fontSize: 25,
    color: COLORS.white,
  },

  filterCountBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  filterCountText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.white,
  },

  pressed: {
    opacity: 0.75,
  },
});
