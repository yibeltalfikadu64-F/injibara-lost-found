// mobile/src/features/search/components/FilterModal.tsx

import React, { useEffect, useState } from "react";

import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import CategoryFilter from "./CategoryFilter";
import SortSelector from "./SortSelector";

import type {
  SearchCategory,
  SearchFilters,
  SearchItemType,
  SearchLocation,
  SearchSortOption,
} from "../services/searchApi";

interface FilterModalProps {
  visible: boolean;
  filters: SearchFilters;
  categories: SearchCategory[];
  locations: SearchLocation[];
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  onReset: () => void;
  categoriesLoading?: boolean;
  locationsLoading?: boolean;
}

const COLORS = {
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  success: "#16A34A",
  successLight: "#DCFCE7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  white: "#FFFFFF",
};

export default function FilterModal({
  visible,
  filters,
  categories,
  locations,
  onClose,
  onApply,
  onReset,
  categoriesLoading = false,
  locationsLoading = false,
}: FilterModalProps) {
  const [draftType, setDraftType] = useState<SearchItemType>(filters.type);

  const [draftCategory, setDraftCategory] = useState(filters.categoryId);

  const [draftLocation, setDraftLocation] = useState(filters.locationId);

  const [draftSort, setDraftSort] = useState<SearchSortOption>(filters.sortBy);

  /* -------------------------------------------------------
     SYNC FILTERS WHEN MODAL OPENS
  ------------------------------------------------------- */

  useEffect(() => {
    if (!visible) return;

    setDraftType(filters.type);
    setDraftCategory(filters.categoryId);
    setDraftLocation(filters.locationId);
    setDraftSort(filters.sortBy);
  }, [visible, filters]);

  /* -------------------------------------------------------
     RESET LOCAL FILTERS
  ------------------------------------------------------- */

  const resetDraft = () => {
    setDraftType("ALL");
    setDraftCategory("");
    setDraftLocation("");
    setDraftSort("newest");
  };

  /* -------------------------------------------------------
     APPLY FILTERS
  ------------------------------------------------------- */

  const applyFilters = () => {
    onApply({
      ...filters,
      type: draftType,
      categoryId: draftCategory,
      locationId: draftLocation,
      sortBy: draftSort,
      page: 1,
    });
  };

  /* -------------------------------------------------------
     ITEM TYPE OPTIONS
  ------------------------------------------------------- */

  const renderTypeOption = (
    type: SearchItemType,
    label: string,
    description: string,
  ) => {
    const selected = draftType === type;

    return (
      <Pressable
        key={type}
        onPress={() => setDraftType(type)}
        style={[styles.typeOption, selected && styles.typeOptionSelected]}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
      >
        <View style={styles.typeOptionContent}>
          <Text
            style={[styles.typeOptionTitle, selected && styles.selectedText]}
          >
            {label}
          </Text>

          <Text
            style={[
              styles.typeOptionDescription,
              selected && styles.selectedDescription,
            ]}
          >
            {description}
          </Text>
        </View>

        <View
          style={[styles.radioOuter, selected && styles.radioOuterSelected]}
        >
          {selected && <View style={styles.radioInner} />}
        </View>
      </Pressable>
    );
  };

  /* -------------------------------------------------------
     LOCATION OPTIONS
  ------------------------------------------------------- */

  const renderLocationOptions = () => {
    if (locationsLoading) {
      return (
        <Text style={styles.loadingText}>Loading campus locations...</Text>
      );
    }

    if (locations.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No locations are currently available.
        </Text>
      );
    }

    return (
      <View style={styles.locationGrid}>
        <Pressable
          onPress={() => setDraftLocation("")}
          style={[
            styles.locationChip,
            !draftLocation && styles.locationChipSelected,
          ]}
        >
          <Text
            style={[
              styles.locationChipText,
              !draftLocation && styles.locationChipTextSelected,
            ]}
          >
            All locations
          </Text>
        </Pressable>

        {locations.map((location) => {
          const selected = draftLocation === location.id;

          return (
            <Pressable
              key={location.id}
              onPress={() => setDraftLocation(location.id)}
              style={[
                styles.locationChip,
                selected && styles.locationChipSelected,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.locationChipText,
                  selected && styles.locationChipTextSelected,
                ]}
              >
                {location.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  /* -------------------------------------------------------
     MODAL UI
  ------------------------------------------------------- */

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityLabel="Close filters"
        />

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Search filters</Text>

              <Text style={styles.headerSubtitle}>
                Refine your campus item search
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close filter modal"
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.headerDivider} />

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Item type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Item type</Text>

              <Text style={styles.sectionDescription}>
                Choose which items you want to see.
              </Text>

              <View style={styles.typeOptions}>
                {renderTypeOption(
                  "ALL",
                  "All items",
                  "Show lost and found items",
                )}

                {renderTypeOption(
                  "LOST",
                  "Lost items",
                  "Items reported as lost",
                )}

                {renderTypeOption(
                  "FOUND",
                  "Found items",
                  "Items reported as found",
                )}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>

              <Text style={styles.sectionDescription}>
                Select the category of the item.
              </Text>

              <CategoryFilter
                categories={categories}
                selectedCategoryId={draftCategory}
                onSelect={setDraftCategory}
                loading={categoriesLoading}
                showTitle={false}
              />
            </View>

            <View style={styles.divider} />

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Campus location</Text>

              <Text style={styles.sectionDescription}>
                Filter items by where they were lost or found.
              </Text>

              {renderLocationOptions()}
            </View>

            <View style={styles.divider} />

            {/* Sorting */}
            <View style={styles.section}>
              <SortSelector value={draftSort} onChange={setDraftSort} />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                resetDraft();
                onReset();
              }}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>Reset all</Text>
            </Pressable>

            <Pressable onPress={applyFilters} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply filters</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  modalContainer: {
    height: "88%",
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    overflow: "hidden",
  },

  header: {
    minHeight: 77,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  headerSubtitle: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 5,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonText: {
    fontSize: 25,
    color: COLORS.text,
    lineHeight: 28,
  },

  headerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 19,
    paddingBottom: 25,
  },

  section: {
    paddingVertical: 15,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 6,
  },

  sectionDescription: {
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
    marginBottom: 13,
  },

  typeOptions: {
    gap: 9,
  },

  typeOption: {
    minHeight: 62,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  typeOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },

  typeOptionContent: {
    flex: 1,
  },

  typeOptionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
  },

  typeOptionDescription: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 5,
  },

  selectedText: {
    color: COLORS.primary,
  },

  selectedDescription: {
    color: COLORS.primary,
  },

  radioOuter: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
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

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  locationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  locationChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  locationChipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },

  locationChipText: {
    fontSize: 10,
    color: COLORS.secondary,
    fontWeight: "700",
  },

  locationChipTextSelected: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  loadingText: {
    fontSize: 11,
    color: COLORS.secondary,
    paddingVertical: 12,
  },

  emptyText: {
    fontSize: 11,
    color: COLORS.secondary,
    paddingVertical: 12,
  },

  footer: {
    minHeight: 78,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: COLORS.white,
  },

  resetButton: {
    flex: 1,
    minHeight: 47,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  resetButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  applyButton: {
    flex: 1.5,
    minHeight: 47,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  applyButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.white,
  },
});
