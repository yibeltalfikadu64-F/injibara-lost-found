import React, { useMemo, useState } from 'react';

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
} from 'react-native';

export interface FormSelectOption {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

interface FormSelectProps {
  label: string;
  value: string | null;
  options: FormSelectOption[];
  onChange: (value: string) => void;

  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  helperText?: string;

  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;

  emptyMessage?: string;

  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

const COLORS = {
  primary: '#2563EB',
  text: '#172033',
  secondary: '#718096',
  placeholder: '#9AA5B5',
  border: '#DCE3ED',
  white: '#FFFFFF',
  background: '#F8FAFC',
  selected: '#EEF4FF',
  error: '#DC2626',
  muted: '#94A3B8',
};

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search options...',
  error,
  helperText,
  required = false,
  disabled = false,
  searchable = true,
  clearable = false,
  emptyMessage = 'No matching options found.',
  containerStyle,
  testID,
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = options.find(
    (option) => option.value === value,
  );

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return options;
    }

    return options.filter((option) => {
      const labelMatches = option.label
        .toLowerCase()
        .includes(normalizedSearch);

      const descriptionMatches = option.description
        ?.toLowerCase()
        .includes(normalizedSearch);

      return labelMatches || Boolean(descriptionMatches);
    });
  }, [options, search]);

  const openDropdown = () => {
    if (disabled) return;

    setSearch('');
    setVisible(true);
  };

  const closeDropdown = () => {
    setVisible(false);
    setSearch('');
  };

  const handleSelect = (option: FormSelectOption) => {
    if (option.disabled) return;

    onChange(option.value);
    closeDropdown();
  };

  const handleClear = () => {
    onChange('');
  };

  const renderOption = ({
    item,
  }: {
    item: FormSelectOption;
  }) => {
    const isSelected = item.value === value;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{
          selected: isSelected,
          disabled: Boolean(item.disabled),
        }}
        disabled={item.disabled}
        onPress={() => handleSelect(item)}
        style={({ pressed }) => [
          styles.option,
          isSelected && styles.selectedOption,
          item.disabled && styles.disabledOption,
          pressed && !item.disabled && styles.pressedOption,
        ]}
      >
        <View style={styles.optionTextContainer}>
          <Text
            style={[
              styles.optionLabel,
              isSelected && styles.selectedOptionLabel,
              item.disabled && styles.disabledOptionLabel,
            ]}
          >
            {item.label}
          </Text>

          {item.description ? (
            <Text style={styles.optionDescription}>
              {item.description}
            </Text>
          ) : null}
        </View>

        {isSelected ? (
          <Text style={styles.checkIcon}>✓</Text>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>

        {required ? (
          <Text style={styles.required}>*</Text>
        ) : null}
      </View>

      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${
          selectedOption?.label || placeholder
        }`}
        accessibilityState={{
          disabled,
          expanded: visible,
        }}
        disabled={disabled}
        onPress={openDropdown}
        style={({ pressed }) => [
          styles.selectButton,
          error && styles.errorBorder,
          disabled && styles.disabledButton,
          pressed && !disabled && styles.pressedButton,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.selectedText,
            !selectedOption && styles.placeholderText,
          ]}
        >
          {selectedOption?.label || placeholder}
        </Text>

        <View style={styles.buttonActions}>
          {clearable && value ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear selection"
              hitSlop={8}
              onPress={handleClear}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>×</Text>
            </Pressable>
          ) : null}

          <Text style={styles.arrow}>⌄</Text>
        </View>
      </Pressable>

      {error ? (
        <Text
          accessibilityRole="alert"
          style={styles.errorText}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helperText}>
          {helperText}
        </Text>
      ) : null}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeDropdown}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close options"
            onPress={closeDropdown}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.modalTitle}>
                  Select {label}
                </Text>

                <Text style={styles.modalSubtitle}>
                  Choose one option from the list.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={closeDropdown}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            {searchable ? (
              <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>⌕</Text>

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={COLORS.placeholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.searchInput}
                />

                {search.length > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                    onPress={() => setSearch('')}
                  >
                    <Text style={styles.clearSearch}>×</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              renderItem={renderOption}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>⌕</Text>
                  <Text style={styles.emptyText}>
                    {emptyMessage}
                  </Text>
                </View>
              }
            />

            <View style={styles.modalFooter}>
              <Text style={styles.optionCount}>
                {filteredOptions.length} option
                {filteredOptions.length === 1 ? '' : 's'}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={closeDropdown}
                style={styles.doneButton}
              >
                <Text style={styles.doneButtonText}>
                  Done
                </Text>
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
    width: '100%',
    marginBottom: 18,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },

  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  required: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '800',
  },

  selectButton: {
    minHeight: 54,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  errorBorder: {
    borderColor: COLORS.error,
  },

  disabledButton: {
    backgroundColor: '#F1F5F9',
    opacity: 0.65,
  },

  pressedButton: {
    borderColor: COLORS.primary,
  },

  selectedText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },

  placeholderText: {
    color: COLORS.placeholder,
  },

  buttonActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  arrow: {
    color: COLORS.secondary,
    fontSize: 23,
    marginTop: -7,
  },

  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearText: {
    color: COLORS.secondary,
    fontSize: 18,
    lineHeight: 21,
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
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    elevation: 12,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
  },

  headerTextContainer: {
    flex: 1,
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },

  modalSubtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 4,
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    color: COLORS.text,
    fontSize: 24,
    lineHeight: 27,
  },

  searchContainer: {
    minHeight: 47,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
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

  optionsList: {
    paddingBottom: 8,
  },

  option: {
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 11,
    marginBottom: 5,
  },

  selectedOption: {
    backgroundColor: COLORS.selected,
  },

  disabledOption: {
    opacity: 0.45,
  },

  pressedOption: {
    backgroundColor: '#F1F5F9',
  },

  optionTextContainer: {
    flex: 1,
  },

  optionLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },

  selectedOptionLabel: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  disabledOptionLabel: {
    color: COLORS.muted,
  },

  optionDescription: {
    color: COLORS.secondary,
    fontSize: 11,
    marginTop: 4,
  },

  checkIcon: {
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: '800',
    marginLeft: 10,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 35,
  },

  emptyIcon: {
    color: COLORS.muted,
    fontSize: 35,
    marginBottom: 8,
  },

  emptyText: {
    color: COLORS.secondary,
    fontSize: 13,
    textAlign: 'center',
  },

  modalFooter: {
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },

  optionCount: {
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
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
});

export default FormSelect;