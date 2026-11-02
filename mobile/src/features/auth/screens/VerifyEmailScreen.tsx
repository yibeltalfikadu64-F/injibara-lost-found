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

type VerifyEmailParams = {
  VerifyEmail: {
    email: string;
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

const VerifyEmailScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const route = useRoute<RouteProp<VerifyEmailParams, "VerifyEmail">>();

  const email = route.params?.email || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async () => {
    Keyboard.dismiss();

    setError("");
    setSuccess("");

    const normalizedCode = code.trim();

    if (!email) {
      setError("Email address is missing. Please register again.");
      return;
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: normalizedCode,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Email verification failed.",
        );
      }

      setSuccess(result.message || "Your email has been verified.");

      setTimeout(() => {
        navigation.navigate("Login", { email });
      }, 1000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to verify your email.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email address is missing.");
      return;
    }

    try {
      setResending(true);

      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Unable to resend the verification code.",
        );
      }

      setSuccess(
        result.message || "A new verification code has been requested.",
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend the verification code.",
      );
    } finally {
      setResending(false);
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
            <Text style={styles.illustrationIcon}>✉</Text>
            <View style={styles.checkCircle}>
              <Text style={styles.checkText}>✓</Text>
            </View>
          </View>

          <Text style={styles.title}>Verify your email</Text>

          <Text style={styles.description}>
            We need to confirm that you own this email address before
            continuing.
          </Text>

          <View style={styles.emailCard}>
            <Text style={styles.emailLabel}>VERIFICATION EMAIL</Text>

            <Text style={styles.emailValue}>
              {email || "No email provided"}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Verification code</Text>

            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={(value) => {
                setCode(value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              placeholder="000000"
              placeholderTextColor="#CBD5E1"
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              textAlign="center"
            />

            <Text style={styles.helperText}>
              Enter the 6-digit code sent to your email.
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleVerify}
              disabled={loading}
              style={({ pressed }) => [
                styles.verifyButton,
                pressed && styles.pressed,
                loading && styles.disabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.verifyButtonText}>Verify Email</Text>
              )}
            </Pressable>

            <View style={styles.resendContainer}>
              <Text style={styles.resendDescription}>
                Didn't receive the code?
              </Text>

              <Pressable onPress={handleResend} disabled={resending}>
                <Text style={styles.resendText}>
                  {resending ? "Sending..." : "Resend code"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Injibara University • Account Verification
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
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 28,
    position: "relative",
  },

  illustrationIcon: {
    fontSize: 48,
    color: COLORS.primary,
  },

  checkCircle: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#16A34A",
    borderWidth: 3,
    borderColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },

  checkText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
  },

  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },

  description: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 11,
  },

  emailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginTop: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emailLabel: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  emailValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 7,
  },

  form: {
    marginTop: 27,
    gap: 13,
  },

  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  codeInput: {
    height: 61,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 10,
  },

  helperText: {
    color: COLORS.secondary,
    fontSize: 10,
    textAlign: "center",
  },

  errorBox: {
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 11,
    textAlign: "center",
  },

  successBox: {
    padding: 12,
    backgroundColor: "#DCFCE7",
    borderRadius: 10,
  },

  successText: {
    color: COLORS.success,
    fontSize: 11,
    textAlign: "center",
  },

  verifyButton: {
    minHeight: 53,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },

  verifyButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
  },

  disabled: {
    opacity: 0.6,
  },

  pressed: {
    opacity: 0.75,
  },

  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 9,
  },

  resendDescription: {
    color: COLORS.secondary,
    fontSize: 10,
  },

  resendText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
  },

  footer: {
    color: COLORS.secondary,
    fontSize: 10,
    textAlign: "center",
    marginTop: 20,
  },
});

export default VerifyEmailScreen;
