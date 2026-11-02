import React, { useMemo, useState } from 'react';

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;

  placeholder?: string;
  helperText?: string;
  error?: string;

  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;

  minimumDate?: Date;
  maximumDate?: Date;

  containerStyle?: StyleProp<ViewStyle>;
}

const COLORS = {
  primary: '#2563EB',
  primaryLight: '#EEF4FF',
  text: '#172033',
  secondary: '#718096',
  border: '#DCE3ED',
  background: '#FFFFFF',
  disabled: '#F1F5F9',
  error: '#DC2626',
  selected: '#2563EB',
  today: '#DBEAFE',
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const isSameDay = (first: Date, second: Date): boolean => {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
  helperText,
  error,
  required = false,
  disabled = false,
  clearable = false,
  minimumDate,
  maximumDate,
  containerStyle,
}) => {
  const [visible, setVisible] = useState(false);

  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const initialDate = value || new Date();

    return new Date(
      initialDate.getFullYear(),
      initialDate.getMonth(),
      1,
    );
  });

  const today = startOfDay(new Date());

  const normalizedMinimum = minimumDate
    ? startOfDay(minimumDate)
    : undefined;

  const normalizedMaximum = maximumDate
    ? startOfDay(maximumDate)
    : undefined;

  const daysInMonth = new Date(
    displayedMonth.getFullYear(),
    displayedMonth.getMonth() + 1,
    0,
  ).getDate();

  const firstDayOfMonth = new Date(
    displayedMonth.getFullYear(),
    displayedMonth.getMonth(),
    1,
  ).getDay();

  // JavaScript starts Sunday at 0. Convert it to Monday-first.
  const mondayFirstOffset = (firstDayOfMonth + 6) % 7;

  const calendarDays = useMemo(() => {
    const days: Array<number | null> = [];

    for (let index = 0; index < mondayFirstOffset; index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(day);
    }

    while (days.length < 42) {
      days.push(null);
    }

    return days;
  }, [daysInMonth, mondayFirstOffset]);

  const openCalendar = () => {
    if (disabled) return;

    const initialDate = value || new Date();

    setDisplayedMonth(
      new Date(
        initialDate.getFullYear(),
        initialDate.getMonth(),
        1,
      ),
    );

    setVisible(true);
  };

  const closeCalendar = () => {
    setVisible(false);
  };

  const changeMonth = (direction: -1 | 1) => {
    setDisplayedMonth((previous) => {
      return new Date(
        previous.getFullYear(),
        previous.getMonth() + direction,
        1,
      );
    });
  };

  const isDateDisabled = (date: Date) => {
    if (normalizedMinimum && date < normalizedMinimum) {
      return true;
    }

    if (normalizedMaximum && date > normalizedMaximum) {
      return true;
    }

    return false;
  };

  const handleSelectDate = (day: number) => {
    const selectedDate = new Date(
      displayedMonth.getFullYear(),
      displayedMonth.getMonth(),
      day,
    );

    if (isDateDisabled(selectedDate)) {
      return;
    }

    onChange(selectedDate);
    closeCalendar();
  };

  const handleClear = () => {
    onChange(null);
  };

  const canGoToPreviousMonth = () => {
    if (!normalizedMinimum) return true;

    const firstDayOfPreviousMonth = new Date(
      displayedMonth.getFullYear(),
      displayedMonth.getMonth() - 1,
      1,
    );

    const lastDayOfPreviousMonth = new Date(
      displayedMonth.getFullYear(),
      displayedMonth.getMonth(),
      0,
    );

    return lastDayOfPreviousMonth >= normalizedMinimum &&
      firstDayOfPreviousMonth <= normalizedMaximumOrMax();
  };

  const normalizedMaximumOrMax = () => {
    return normalizedMaximum || new Date(9999, 11, 31);
  };

  const canGoToNextMonth = () => {
    if (!normalizedMaximum) return true;

    const firstDayOfNextMonth = new Date(
      displayedMonth.getFullYear(),
      displayedMonth.getMonth() + 1,
      1,
    );

    return firstDayOfNextMonth <= normalizedMaximum;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>

        {required ? (
          <Text style={styles.required}>*</Text>
        ) : null}
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
            value ? formatDate(value) : placeholder
          }`}
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={openCalendar}
          style={styles.dateButton}
        >
          <View style={styles.dateIconContainer}>
            <Text style={styles.calendarIcon}>▦</Text>
          </View>

          <View style={styles.dateTextContainer}>
            <Text
              style={[
                styles.dateText,
                !value && styles.placeholderText,
              ]}
            >
              {value ? formatDate(value) : placeholder}
            </Text>

            {value ? (
              <Text style={styles.dateHint}>
                Tap to change date
              </Text>
            ) : null}
          </View>

          <Text style={styles.arrow}>⌄</Text>
        </Pressable>

        {clearable && value && !disabled ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear date"
            onPress={handleClear}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        ) : null}
      </View>

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
        onRequestClose={closeCalendar}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close calendar"
            onPress={closeCalendar}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.calendarContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Select {label}
                </Text>

                <Text style={styles.modalSubtitle}>
                  Choose a day from the calendar.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close calendar"
                onPress={closeCalendar}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.monthNavigation}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                disabled={!canGoToPreviousMonth()}
                onPress={() => changeMonth(-1)}
                style={[
                  styles.monthButton,
                  !canGoToPreviousMonth() &&
                    styles.disabledMonthButton,
                ]}
              >
                <Text style={styles.monthButtonText}>‹</Text>
              </Pressable>

              <Text style={styles.monthTitle}>
                {MONTHS[displayedMonth.getMonth()]}{' '}
                {displayedMonth.getFullYear()}
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Next month"
                disabled={!canGoToNextMonth()}
                onPress={() => changeMonth(1)}
                style={[
                  styles.monthButton,
                  !canGoToNextMonth() &&
                    styles.disabledMonthButton,
                ]}
              >
                <Text style={styles.monthButtonText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((weekday) => (
                <View
                  key={weekday}
                  style={styles.weekdayCell}
                >
                  <Text style={styles.weekdayText}>
                    {weekday}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return (
                    <View
                      key={`empty-${index}`}
                      style={styles.dayCell}
                    />
                  );
                }

                const date = new Date(
                  displayedMonth.getFullYear(),
                  displayedMonth.getMonth(),
                  day,
                );

                const selected =
                  value !== null && isSameDay(value, date);

                const isToday = isSameDay(today, date);
                const unavailable = isDateDisabled(date);

                return (
                  <Pressable
                    key={`day-${day}`}
                    accessibilityRole="button"
                    accessibilityLabel={formatDate(date)}
                    accessibilityState={{
                      selected,
                      disabled: unavailable,
                    }}
                    disabled={unavailable}
                    onPress={() => handleSelectDate(day)}
                    style={[
                      styles.dayCell,
                      selected && styles.selectedDay,
                      isToday && !selected && styles.todayDay,
                      unavailable && styles.unavailableDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.selectedDayText,
                        isToday && !selected && styles.todayDayText,
                        unavailable && styles.unavailableDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.calendarFooter}>
              <Pressable
                onPress={() => {
                  if (!isDateDisabled(today)) {
                    onChange(today);
                    closeCalendar();
                  }
                }}
                disabled={isDateDisabled(today)}
                style={styles.todayButton}
              >
                <Text style={styles.todayButtonText}>
                  Today
                </Text>
              </Pressable>

              <Pressable
                onPress={closeCalendar}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
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

  fieldContainer: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: COLORS.disabled,
    opacity: 0.7,
  },

  dateButton: {
    flex: 1,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  calendarIcon: {
    color: COLORS.primary,
    fontSize: 20,
  },

  dateTextContainer: {
    flex: 1,
  },

  dateText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },

  placeholderText: {
    color: COLORS.secondary,
    fontWeight: '400',
  },

  dateHint: {
    color: COLORS.secondary,
    fontSize: 10,
    marginTop: 3,
  },

  arrow: {
    color: COLORS.secondary,
    fontSize: 22,
  },

  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  clearText: {
    color: COLORS.secondary,
    fontSize: 19,
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },

  calendarContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 18,
    elevation: 12,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },

  modalSubtitle: {
    color: COLORS.secondary,
    fontSize: 11,
    marginTop: 4,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    color: COLORS.text,
    fontSize: 23,
    lineHeight: 26,
  },

  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledMonthButton: {
    opacity: 0.3,
  },

  monthButtonText: {
    color: COLORS.primary,
    fontSize: 26,
    lineHeight: 30,
  },

  monthTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },

  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },

  weekdayText: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: '800',
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayCell: {
    width: '14.2857%',
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },

  selectedDay: {
    backgroundColor: COLORS.selected,
  },

  todayDay: {
    backgroundColor: COLORS.today,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  unavailableDay: {
    opacity: 0.25,
  },

  dayText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },

  selectedDayText: {
    color: COLORS.background,
    fontWeight: '800',
  },

  todayDayText: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  unavailableDayText: {
    color: COLORS.secondary,
  },

  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 16,
    paddingTop: 14,
  },

  todayButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  todayButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  cancelButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9,
  },

  cancelButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default DatePickerField;