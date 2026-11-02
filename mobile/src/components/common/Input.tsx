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
  type ViewStyle,
} from "react-native";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  autoCorrect?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
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
  text: "#172033",
  muted: "#718096",
  border: "#D5DCE8",
  background: "#FFFFFF",
  disabled: "#F1F4F8",
  error: "#DC2626",
  required: "#DC2626",
};

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  required = false,
  disabled = false,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 4,
  maxLength,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = true,
  leftIcon,
  rightElement,
  containerStyle,
  inputStyle,
  onBlur,
  onFocus,
  onSubmitEditing,
  returnKeyType,
  textContentType,
  autoComplete,
  accessibilityLabel,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = secureTextEntry;
  const shouldHideText = isPassword && !isPasswordVisible;

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.required}> *</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          multiline && styles.multilineWrapper,
          isFocused && styles.focused,
          error && styles.errorBorder,
          disabled && styles.disabled,
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

        <TextInput
          testID={testID}
          accessibilityLabel={accessibilityLabel || label || placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.muted}
          editable={!disabled}
          secureTextEntry={shouldHideText}
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
              isPasswordVisible ? "Hide password" : "Show password"
            }
            onPress={() => setIsPasswordVisible((previous) => !previous)}
            style={styles.passwordToggle}
          >
            <Text style={styles.toggleText}>
              {isPasswordVisible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        ) : null}

        {!isPassword && rightElement ? (
          <View style={styles.rightElement}>{rightElement}</View>
        ) : null}
      </View>

      {error ? (
        <Text accessibilityRole="alert" style={styles.errorText}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      {typeof maxLength === "number" && maxLength > 0 ? (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  required: {
    color: COLORS.required,
    fontSize: 14,
    fontWeight: "700",
  },
  inputWrapper: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
  },
  multilineWrapper: {
    minHeight: 120,
    alignItems: "flex-start",
    paddingTop: 12,
  },
  focused: {
    borderColor: COLORS.primary,
    borderWidth: 1.6,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  disabled: {
    backgroundColor: COLORS.disabled,
    opacity: 0.75,
  },
  leftIcon: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 0,
    color: COLORS.text,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 95,
    textAlignVertical: "top",
  },
  passwordToggle: {
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  toggleText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  rightElement: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
  },
  helperText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
  },
  characterCount: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "right",
    marginTop: 5,
  },
});

export default Input;
