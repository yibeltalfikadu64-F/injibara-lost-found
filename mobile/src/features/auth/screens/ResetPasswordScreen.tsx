import React, { useState } from "react";

import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import SafeScreen from "../../../components/layout/SafeScreen";

type ResetPasswordParams = {
  ResetPassword: {
    token: string;
  };
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const COLORS = {
  primary: "#2563EB",
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#172033",
  secondary: "#64748B",
  border: "#E2E8F0",
  danger: "#DC2626",
  success: "#15803D",
};

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const route = useRoute<RouteProp<ResetPasswordParams, "ResetPassword">>();

  const token = route.params?.token || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    if (!token) {
      setError(
        "Your password reset link is missing or invalid. Request a new one.",
      );
      return false;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return false;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();

    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Unable to reset your password.",
        );
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to reset your password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen
      backgroundColor={COLORS.background}
      statusBarStyle="dark-content"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.content}>
          <View style={styles.illustration}>
            <Text style={styles.illustrationIcon}>🔑</Text>
          </View>

          <Text style={styles.title}>Create a new password</Text>

          <Text style={styles.description}>
            Choose a strong password that you have not used for this account
            before.
          </Text>

          {success ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.checkText}>✓</Text>
              </View>

              <Text style={styles.successTitle}>Password updated!</Text>

              <Text style={styles.successDescription}>
                Your password has been changed successfully. You can now sign in
                with your new password.
              </Text>

              <Pressable
                onPress={() => navigation.navigate("Login")}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>Continue to Sign In</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>New password</Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      setError("");
                    }}
                    placeholder="Enter your new password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                  />

                  <Pressable
                    onPress={() => setShowPassword((current) => !current)}
                    style={styles.showButton}
                  >
                    <Text style={styles.showText}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Confirm new password</Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      setError("");
                    }}
                    placeholder="Enter your password again"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />

                  <Pressable
                    onPress={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    style={styles.showButton}
                  >
                    <Text style={styles.showText}>
                      {showConfirmPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.requirements}>
                <Text style={styles.requirementsTitle}>
                  Password requirements
                </Text>

                <Text style={styles.requirement}>• At least 8 characters</Text>

                <Text style={styles.requirement}>
                  • At least one uppercase letter
                </Text>

                <Text style={styles.requirement}>
                  • At least one lowercase letter
                </Text>

                <Text style={styles.requirement}>• At least one number</Text>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={handleResetPassword}
                disabled={loading}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.pressed,
                  loading && styles.disabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.submitText}>Reset Password</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          Injibara University • Account Security
        </Text>
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 23,
    paddingTop: 10,
    paddingBottom: 25,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    alignSelf: "flex-start",
  },

  backIcon: {
    fontSize: 30,
    color: COLORS.text,
    marginRight: 7,
  },

  backText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: "600",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 25,
  },

  illustration: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 27,
  },

  illustrationIcon: {
    fontSize: 46,
  },

  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },

  description: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 11,
    marginBottom: 27,
  },

  form: {
    gap: 18,
  },

  field: {
    gap: 9,
  },

  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  inputContainer: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    paddingVertical: 12,
  },

  showButton: {
    paddingHorizontal: 5,
    paddingVertical: 8,
  },

  showText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
  },

  requirements: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 14,
    gap: 7,
  },

  requirementsTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 2,
  },

  requirement: {
    color: COLORS.secondary,
    fontSize: 10,
  },

  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 11,
    lineHeight: 17,
  },

  submitButton: {
    minHeight: 53,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  submitText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },

  disabled: {
    opacity: 0.6,
  },

  pressed: {
    opacity: 0.75,
  },

  successContainer: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 20,
    marginTop: 15,
  },

  successIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  checkText: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "900",
  },

  successTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },

  successDescription: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 9,
  },

  loginButton: {
    minHeight: 48,
    width: "100%",
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  loginButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },

  footer: {
    color: COLORS.secondary,
    fontSize: 10,
    textAlign: "center",
    marginTop: 20,
  },
});

export default ResetPasswordScreen;
