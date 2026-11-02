import React, { useMemo, useState } from "react";

import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export interface CampusLocation {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

interface LocationPickerFieldProps {
  label?: string;

  value: string | null;

  locations: CampusLocation[];

  onChange: (location: CampusLocation | null) => void;

  placeholder?: string;
  searchPlaceholder?: string;

  error?: string;
  helperText?: string;

  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  allowCustomLocation?: boolean;

  containerStyle?: StyleProp<ViewStyle>;
}

const COLORS = {
  primary: "#2563EB",
  primaryLight: "#EEF4FF",
  text: "#172033",
  secondary: "#718096",
  border: "#DCE3ED",
  background: "#FFFFFF",
  error: "#DC2626",
  mutedBackground: "#F8FAFC",
  selected: "#EEF4FF",
};

const LocationPickerField: React.FC<LocationPickerFieldProps> = ({
  label = "Campus Location",
  value,
  locations,
  onChange,
  placeholder = "Select campus location",
  searchPlaceholder = "Search campus locations...",
  error,
  helperText = "Choose where the item was lost or found.",
  required = false,
  disabled = false,
  clearable = true,
  allowCustomLocation = true,
  containerStyle,
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [customLocation, setCustomLocation] = useState("");

  const selectedLocation = locations.find((location) => location.id === value);

  const filteredLocations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return locations;
    }

    return locations.filter((location) => {
      return (
        location.name.toLowerCase().includes(query) ||
        location.description?.toLowerCase().includes(query) ||
        location.category?.toLowerCase().includes(query)
      );
    });
  }, [locations, search]);

  const openPicker = () => {
    if (disabled) return;

    setSearch("");
    setCustomLocation("");
    setVisible(true);
  };

  const closePicker = () => {
    setVisible(false);
    setSearch("");
    setCustomLocation("");
  };

  const handleSelectLocation = (location: CampusLocation) => {
    onChange(location);
    closePicker();
  };

  const handleClear = () => {
    onChange(null);
  };

  const handleCustomLocation = () => {
    const name = customLocation.trim();

    if (!name) {
      return;
    }

    const custom: CampusLocation = {
      id: `custom-${Date.now()}`,
      name,
      description: "Custom campus location",
      category: "Other",
    };

    onChange(custom);
    closePicker();
  };

  const renderLocation = ({ item }: { item: CampusLocation }) => {
    const isSelected = item.id === value;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Select ${item.name}`}
        accessibilityState={{
          selected: isSelected,
        }}
        onPress={() => handleSelectLocation(item)}
        style={({ pressed }) => [
          styles.locationOption,
          isSelected && styles.selectedOption,
          pressed && styles.pressedOption,
        ]}
      >
        <View style={styles.locationIconContainer}>
          <Text style={styles.locationIcon}>⌖</Text>
        </View>

        <View style={styles.locationTextContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.locationName,
              isSelected && styles.selectedLocationName,
            ]}
          >
            {item.name}
          </Text>

          {item.description ? (
            <Text numberOfLines={2} style={styles.locationDescription}>
              {item.description}
            </Text>
          ) : null}

          {item.category ? (
            <Text style={styles.categoryText}>{item.category}</Text>
          ) : null}
        </View>

        {isSelected ? <Text style={styles.checkIcon}>✓</Text> : null}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>

        {required ? <Text style={styles.required}>*</Text> : null}
      </View>

      <View
        style={[
          styles.fieldContainer,
          error && styles.errorBorder,
          disabled && styles.disabledField,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${
            selectedLocation?.name || value || placeholder
          }`}
          accessibilityState={{
            disabled,
            expanded: visible,
          }}
          disabled={disabled}
          onPress={openPicker}
          style={styles.selectButton}
        >
          <View style={styles.fieldIconContainer}>
            <Text style={styles.fieldIcon}>⌖</Text>
          </View>

          <View style={styles.selectedTextContainer}>
            <Text
              numberOfLines={1}
              style={[
                styles.selectedText,
                !selectedLocation && !value && styles.placeholderText,
              ]}
            >
              {selectedLocation?.name || value || placeholder}
            </Text>

            {selectedLocation?.description ? (
              <Text numberOfLines={1} style={styles.selectedDescription}>
                {selectedLocation.description}
              </Text>
            ) : null}
          </View>

          <Text style={styles.arrow}>⌄</Text>
        </Pressable>

        {clearable && value && !disabled ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear location"
            onPress={handleClear}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closePicker}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close location selector"
            onPress={closePicker}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.modalTitle}>Select campus location</Text>

                <Text style={styles.modalSubtitle}>
                  Find the place where the item was lost or found.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={closePicker}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>⌕</Text>

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={searchPlaceholder}
                placeholderTextColor="#9AA5B5"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.searchInput}
              />

              {search.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  onPress={() => setSearch("")}
                >
                  <Text style={styles.clearSearch}>×</Text>
                </Pressable>
              ) : null}
            </View>

            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item.id}
              renderItem={renderLocation}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.locationList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>⌖</Text>

                  <Text style={styles.emptyTitle}>No locations found</Text>

                  <Text style={styles.emptyDescription}>
                    Try another search or add a custom location.
                  </Text>
                </View>
              }
              ListFooterComponent={
                allowCustomLocation ? (
                  <View style={styles.customLocationContainer}>
                    <Text style={styles.customTitle}>Location not listed?</Text>

                    <Text style={styles.customDescription}>
                      Enter another campus location.
                    </Text>

                    <TextInput
                      value={customLocation}
                      onChangeText={setCustomLocation}
                      placeholder="Enter location name"
                      placeholderTextColor="#9AA5B5"
                      style={styles.customInput}
                      returnKeyType="done"
                      onSubmitEditing={handleCustomLocation}
                    />

                    <Pressable
                      accessibilityRole="button"
                      disabled={!customLocation.trim()}
                      onPress={handleCustomLocation}
                      style={[
                        styles.customButton,
                        !customLocation.trim() && styles.disabledCustomButton,
                      ]}
                    >
                      <Text style={styles.customButtonText}>
                        Use this location
                      </Text>
                    </Pressable>
                  </View>
                ) : null
              }
            />

            <View style={styles.modalFooter}>
              <Text style={styles.locationCount}>
                {filteredLocations.length} location
                {filteredLocations.length === 1 ? "" : "s"}
              </Text>

              <Pressable onPress={closePicker} style={styles.doneButton}>
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 18,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },

  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  required: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: "800",
  },

  fieldContainer: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
  },

  errorBorder: {
    borderColor: COLORS.error,
  },

  disabledField: {
    backgroundColor: "#F1F5F9",
    opacity: 0.65,
  },

  selectButton: {
    flex: 1,
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
  },

  fieldIconContainer: {
    width: 39,
    height: 39,
    borderRadius: 11,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  fieldIcon: {
    color: COLORS.primary,
    fontSize: 23,
  },

  selectedTextContainer: {
    flex: 1,
  },

  selectedText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },

  placeholderText: {
    color: COLORS.secondary,
    fontWeight: "400",
  },

  selectedDescription: {
    color: COLORS.secondary,
    fontSize: 10,
    marginTop: 4,
  },

  arrow: {
    color: COLORS.secondary,
    fontSize: 22,
    marginLeft: 8,
  },

  clearButton: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  clearText: {
    color: COLORS.secondary,
    fontSize: 20,
  },

  helperText: {
    color: COLORS.secondary,
    fontSize: 11,
    marginTop: 6,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 11,
    marginTop: 6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },

  modalContent: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 18,
    elevation: 12,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  headerTextContainer: {
    flex: 1,
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },

  modalSubtitle: {
    color: COLORS.secondary,
    fontSize: 11,
    marginTop: 5,
    lineHeight: 16,
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: COLORS.text,
    fontSize: 23,
    lineHeight: 26,
  },

  searchContainer: {
    minHeight: 47,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  searchIcon: {
    color: COLORS.secondary,
    fontSize: 22,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    height: 45,
    color: COLORS.text,
    fontSize: 13,
  },

  clearSearch: {
    color: COLORS.secondary,
    fontSize: 22,
    paddingHorizontal: 5,
  },

  locationList: {
    paddingBottom: 10,
  },

  locationOption: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },

  selectedOption: {
    backgroundColor: COLORS.selected,
  },

  pressedOption: {
    backgroundColor: "#F1F5F9",
  },

  locationIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  locationIcon: {
    color: COLORS.primary,
    fontSize: 22,
  },

  locationTextContainer: {
    flex: 1,
  },

  locationName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },

  selectedLocationName: {
    color: COLORS.primary,
  },

  locationDescription: {
    color: COLORS.secondary,
    fontSize: 10,
    marginTop: 4,
    lineHeight: 15,
  },

  categoryText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 4,
  },

  checkIcon: {
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: "800",
    marginLeft: 8,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },

  emptyIcon: {
    color: COLORS.secondary,
    fontSize: 35,
    marginBottom: 8,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  emptyDescription: {
    color: COLORS.secondary,
    fontSize: 11,
    textAlign: "center",
    marginTop: 5,
  },

  customLocationContainer: {
    backgroundColor: COLORS.mutedBackground,
    padding: 13,
    borderRadius: 13,
    marginTop: 12,
  },

  customTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  customDescription: {
    color: COLORS.secondary,
    fontSize: 11,
    marginTop: 4,
    marginBottom: 10,
  },

  customInput: {
    minHeight: 45,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    color: COLORS.text,
    fontSize: 12,
  },

  customButton: {
    minHeight: 40,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 9,
  },

  disabledCustomButton: {
    opacity: 0.45,
  },

  customButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: "800",
  },

  modalFooter: {
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },

  locationCount: {
    color: COLORS.secondary,
    fontSize: 11,
  },

  doneButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  doneButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: "800",
  },
});

export default LocationPickerField;
