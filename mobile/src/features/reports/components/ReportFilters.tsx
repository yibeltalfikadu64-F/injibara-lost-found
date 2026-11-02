// mobile/src/features/reports/components/ReportFilters.tsx

import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type {
  ReportFilters as ReportFilterValues,
  ReportPriority,
  ReportStatus,
  ReportType,
} from "../services/reportsApi";

interface ReportFiltersProps {
  filters: ReportFilterValues;
  onChange: (filters: ReportFilterValues) => void;
  onReset?: () => void;
  disabled?: boolean;
}

interface FilterOption<T extends string> {
  label: string;
  value: T;
}

const STATUS_OPTIONS: FilterOption<ReportStatus | "ALL">[] = [
  { label: "All statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Under review", value: "UNDER_REVIEW" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Dismissed", value: "DISMISSED" },
  { label: "Closed", value: "CLOSED" },
];

const TYPE_OPTIONS: FilterOption<ReportType | "ALL">[] = [
  { label: "All types", value: "ALL" },
  { label: "Lost item", value: "LOST_ITEM" },
  { label: "Found item", value: "FOUND_ITEM" },
  { label: "Claim", value: "CLAIM" },
  { label: "User", value: "USER" },
  { label: "Other", value: "OTHER" },
];

const PRIORITY_OPTIONS: FilterOption<ReportPriority | "ALL">[] = [
  { label: "All priorities", value: "ALL" },
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onChange,
  onReset,
  disabled = false,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const updateFilter = <K extends keyof ReportFilterValues>(
    key: K,
    value: ReportFilterValues[K],
  ) => {
    onChange({
      ...filters,
      [key]: value,
      page: 1,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateFilter("search", value);
  };

  const resetFilters = () => {
    setSearchInput("");
    onReset?.();
  };

  const activeFilterCount = [
    filters.status && filters.status !== "ALL",
    filters.type && filters.type !== "ALL",
    filters.priority && filters.priority !== "ALL",
    Boolean(filters.search?.trim()),
  ].filter(Boolean).length;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          value={searchInput}
          onChangeText={handleSearchChange}
          editable={!disabled}
          placeholder="Search your reports..."
          placeholderTextColor="#98A2B3"
          returnKeyType="search"
          style={styles.searchInput}
        />

        {searchInput.length > 0 && (
          <Pressable
            disabled={disabled}
            onPress={() => handleSearchChange("")}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.filterHeading}>
        <View style={styles.filterTitleContainer}>
          <Text style={styles.filterTitle}>Filter reports</Text>

          {activeFilterCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{activeFilterCount}</Text>
            </View>
          )}
        </View>

        {activeFilterCount > 0 && (
          <Pressable disabled={disabled} onPress={resetFilters}>
            <Text style={styles.resetText}>Reset filters</Text>
          </Pressable>
        )}
      </View>

      <FilterSection
        title="Status"
        options={STATUS_OPTIONS}
        selectedValue={filters.status || "ALL"}
        onSelect={(value) =>
          updateFilter("status", value as ReportStatus | "ALL")
        }
        disabled={disabled}
      />

      <FilterSection
        title="Report type"
        options={TYPE_OPTIONS}
        selectedValue={filters.type || "ALL"}
        onSelect={(value) => updateFilter("type", value as ReportType | "ALL")}
        disabled={disabled}
      />

      <FilterSection
        title="Priority"
        options={PRIORITY_OPTIONS}
        selectedValue={filters.priority || "ALL"}
        onSelect={(value) =>
          updateFilter("priority", value as ReportPriority | "ALL")
        }
        disabled={disabled}
      />

      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by</Text>

        <View style={styles.sortButtons}>
          <SortButton
            label="Newest first"
            selected={filters.sortBy !== "oldest"}
            disabled={disabled}
            onPress={() => updateFilter("sortBy", "newest")}
          />

          <SortButton
            label="Oldest first"
            selected={filters.sortBy === "oldest"}
            disabled={disabled}
            onPress={() => updateFilter("sortBy", "oldest")}
          />
        </View>
      </View>
    </View>
  );
};

interface FilterSectionProps<T extends string> {
  title: string;
  options: FilterOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  disabled?: boolean;
}

function FilterSection<T extends string>({
  title,
  options,
  selectedValue,
  onSelect,
  disabled = false,
}: FilterSectionProps<T>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
      >
        {options.map((option) => {
          const selected = selectedValue === option.value;

          return (
            <Pressable
              key={option.value}
              disabled={disabled}
              onPress={() => onSelect(option.value)}
              style={[
                styles.option,
                selected && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selected && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

interface SortButtonProps {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

const SortButton: React.FC<SortButtonProps> = ({
  label,
  selected,
  disabled,
  onPress,
}) => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    style={[styles.sortButton, selected && styles.sortButtonSelected]}
  >
    <Text
      style={[styles.sortButtonText, selected && styles.sortButtonTextSelected]}
    >
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5EAF1",
    backgroundColor: "#FFFFFF",
    gap: 15,
  },
  searchContainer: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E3E8EF",
    backgroundColor: "#F8FAFC",
    gap: 9,
  },
  searchIcon: {
    color: "#667085",
    fontSize: 23,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: "#18243A",
    fontSize: 12,
  },
  clearButton: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#E9EDF3",
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    color: "#667085",
    fontSize: 18,
    lineHeight: 20,
  },
  filterHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterTitle: {
    color: "#18243A",
    fontSize: 13,
    fontWeight: "800",
  },
  countBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2458A6",
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  resetText: {
    color: "#2458A6",
    fontSize: 10,
    fontWeight: "800",
  },
  section: {
    gap: 9,
  },
  sectionTitle: {
    color: "#667085",
    fontSize: 10,
    fontWeight: "800",
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 7,
    paddingRight: 5,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E3E8EF",
    backgroundColor: "#FFFFFF",
  },
  optionSelected: {
    borderColor: "#2458A6",
    backgroundColor: "#2458A6",
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    color: "#667085",
    fontSize: 10,
    fontWeight: "700",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  sortContainer: {
    gap: 9,
  },
  sortLabel: {
    color: "#667085",
    fontSize: 10,
    fontWeight: "800",
  },
  sortButtons: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E3E8EF",
    backgroundColor: "#FFFFFF",
  },
  sortButtonSelected: {
    borderColor: "#2458A6",
    backgroundColor: "#EAF1FC",
  },
  sortButtonText: {
    color: "#667085",
    fontSize: 10,
    fontWeight: "700",
  },
  sortButtonTextSelected: {
    color: "#2458A6",
  },
});

export default ReportFilters;
