import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;

  placeholder?: string;
  error?: string;
  helperText?: string;

  required?: boolean;
  disabled?: boolean;
  editable?: boolean;

  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;

  maxLength?: number;
  minLength?: number;

  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;

  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;

  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;

  onBlur?: () => void;
  onFocus?: () => void;
  onSubmitEditing?: () => void;

  returnKeyType?: TextInputProps["returnKeyType"];
  textContentType?: TextInputProps["textContentType"];
  autoComplete?: TextInputProps["autoComplete"];

  accessibilityLabel?: string;
  testID?: string;
}

const COLORS = {
  primary: "#2563EB",
  primaryLight: "#EEF4FF",
  text: "#172033",
  secondaryText: "#718096",
  placeholder: "#9AA5B5",
  border: "#DCE3ED",
  background: "#FFFFFF",
  disabled: "#F1F5F9",
  error: "#DC2626",
  errorBackground: "#FEF2F2",
  success: "#16A34A",
  required: "#DC2626",
};

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  editable = true,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 4,
  maxLength,
  minLength,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = true,
  leftElement,
  rightElement,
  containerStyle,
  inputStyle,
  onBlur,
  onFocus,
  onSubmitEditing,
  returnKeyType = "done",
  textContentType,
  autoComplete,
  accessibilityLabel,
  testID,
}) => {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isEditable = editable && !disabled;
  const isPassword = secureTextEntry;
  const shouldHidePassword = isPassword && !passwordVisible;

  const hasMinimumLengthError =
    typeof minLength === "number" &&
    value.length > 0 &&
    value.length < minLength;

  const showMinimumLengthMessage = !error && hasMinimumLengthError;

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    onBlur?.();
  };

  const handleTogglePassword = () => {
    setPasswordVisible((previous) => !previous);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>

        {required ? <Text style={styles.required}>*</Text> : null}

        {typeof maxLength === "number" ? (
          <Text style={styles.optionalLabel}>
            Maximum {maxLength} characters
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          focused && styles.focusedContainer,
          (error || showMinimumLengthMessage) && styles.errorContainer,
          disabled && styles.disabledContainer,
        ]}
      >
        {leftElement ? (
          <View style={styles.leftElement}>{leftElement}</View>
        ) : null}

        <TextInput
          testID={testID}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={helperText}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor={COLORS.placeholder}
          editable={isEditable}
          secureTextEntry={shouldHidePassword}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          textContentType={textContentType}
          autoComplete={autoComplete}
          style={[styles.input, multiline && styles.multilineInput, inputStyle]}
        />

        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? "Hide password" : "Show password"
            }
            onPress={handleTogglePassword}
            style={styles.passwordButton}
          >
            <Text style={styles.passwordButtonText}>
              {passwordVisible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        ) : null}

        {!isPassword && rightElement ? (
          <View style={styles.rightElement}>{rightElement}</View>
        ) : null}
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.messageContainer}>
          {error ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {error}
            </Text>
          ) : showMinimumLengthMessage ? (
            <Text style={styles.errorText}>
              Enter at least {minLength} characters.
            </Text>
          ) : helperText ? (
            <Text style={styles.helperText}>{helperText}</Text>
          ) : null}
        </View>

        {typeof maxLength === "number" ? (
          <Text style={styles.characterCount}>
            {value.length}/{maxLength}
          </Text>
        ) : null}
      </View>
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
    marginBottom: 8,
    gap: 4,
  },

  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  required: {
    color: COLORS.required,
    fontSize: 15,
    fontWeight: "800",
  },

  optionalLabel: {
    marginLeft: "auto",
    color: COLORS.secondaryText,
    fontSize: 10,
  },

  inputContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
  },

  multilineContainer: {
    minHeight: 125,
    alignItems: "flex-start",
    paddingTop: 12,
  },

  focusedContainer: {
    borderColor: COLORS.primary,
    backgroundColor: "#FCFDFF",
    borderWidth: 1.5,
  },

  errorContainer: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBackground,
  },

  disabledContainer: {
    backgroundColor: COLORS.disabled,
    opacity: 0.7,
  },

  leftElement: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  input: {
    flex: 1,
    minHeight: 50,
    paddingVertical: 10,
    paddingHorizontal: 0,
    color: COLORS.text,
    fontSize: 14,
  },

  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  passwordButton: {
    paddingVertical: 9,
    paddingHorizontal: 6,
  },

  passwordButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  rightElement: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  bottomRow: {
    minHeight: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 5,
    gap: 8,
  },

  messageContainer: {
    flex: 1,
  },

  helperText: {
    color: COLORS.secondaryText,
    fontSize: 11,
    lineHeight: 16,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 11,
    lineHeight: 16,
  },

  characterCount: {
    color: COLORS.secondaryText,
    fontSize: 10,
    marginLeft: "auto",
  },
});

export default FormInput;
