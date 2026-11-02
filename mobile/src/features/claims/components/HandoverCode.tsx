// mobile/src/features/claims/components/HandoverCode.tsx

import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface HandoverCodeProps {
  onSubmit: (code: string) => Promise<void> | void;
  onRequestCode?: () => Promise<void> | void;
  expiresAt?: string | null;
  loading?: boolean;
  disabled?: boolean;
  showRequestButton?: boolean;
}

const HandoverCode: React.FC<HandoverCodeProps> = ({
  onSubmit,
  onRequestCode,
  expiresAt,
  loading = false,
  disabled = false,
  showRequestButton = true,
}) => {
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async () => {
    const cleanedCode = code.trim();

    if (!cleanedCode) {
      setLocalError("Please enter the handover code.");
      return;
    }

    if (cleanedCode.length < 4) {
      setLocalError("Please enter a valid handover code.");
      return;
    }

    setLocalError("");
    await onSubmit(cleanedCode);
  };

  const handleRequestCode = async () => {
    setLocalError("");

    if (onRequestCode) {
      await onRequestCode();
    }
  };

  const formattedExpiry = expiresAt
    ? new Date(expiresAt).toLocaleString()
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔐</Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>Confirm item handover</Text>
          <Text style={styles.subtitle}>
            Enter the secure code provided during the return process.
          </Text>
        </View>
      </View>

      <View style={styles.information}>
        <Text style={styles.informationIcon}>ⓘ</Text>
        <Text style={styles.informationText}>
          Only share your handover code with the authorized person completing
          the item return.
        </Text>
      </View>

      <Text style={styles.inputLabel}>Handover confirmation code</Text>

      <TextInput
        value={code}
        onChangeText={(value) => {
          setCode(value.replace(/\s/g, "").slice(0, 12));
          setLocalError("");
        }}
        editable={!disabled && !loading}
        placeholder="Enter code"
        placeholderTextColor="#A0A7B2"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={12}
        style={styles.input}
      />

      {!!formattedExpiry && (
        <Text style={styles.expiry}>Code expiry: {formattedExpiry}</Text>
      )}

      {!!localError && (
        <Text accessibilityRole="alert" style={styles.error}>
          {localError}
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        disabled={disabled || loading}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          pressed && styles.pressed,
          (disabled || loading) && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Confirm handover</Text>
        )}
      </Pressable>

      {showRequestButton && onRequestCode && (
        <Pressable
          accessibilityRole="button"
          disabled={disabled || loading}
          onPress={handleRequestCode}
          style={styles.requestButton}
        >
          <Text style={styles.requestButtonText}>Request a handover code</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 17,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E3E9F0",
    backgroundColor: "#FFFFFF",
    gap: 13,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 21,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: "#18243A",
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    color: "#778194",
    fontSize: 11,
    lineHeight: 17,
  },
  information: {
    flexDirection: "row",
    gap: 8,
    padding: 11,
    borderRadius: 10,
    backgroundColor: "#FFF8E8",
  },
  informationIcon: {
    color: "#A66B00",
    fontSize: 15,
    fontWeight: "800",
  },
  informationText: {
    flex: 1,
    color: "#77531A",
    fontSize: 11,
    lineHeight: 17,
  },
  inputLabel: {
    color: "#344054",
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    height: 52,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#D9E0EA",
    borderRadius: 12,
    backgroundColor: "#FAFBFC",
    color: "#172033",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 3,
    textAlign: "center",
  },
  expiry: {
    color: "#778194",
    fontSize: 11,
  },
  error: {
    color: "#C62828",
    fontSize: 12,
    fontWeight: "600",
  },
  submitButton: {
    minHeight: 49,
    borderRadius: 12,
    backgroundColor: "#2458A6",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  requestButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  requestButtonText: {
    color: "#2458A6",
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default HandoverCode;
