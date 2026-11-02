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

type ForgotPasswordParams = {
  ForgotPassword?: {
    email?: string;
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

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const route = useRoute<RouteProp<ForgotPasswordParams, "ForgotPassword">>();

  const [email, setEmail] = useState(route.params?.email || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    Keyboard.dismiss();

    setError("");
    setSuccess(false);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Unable to process your request.",
        );
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send your password reset request.",
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
          <Text style={styles.backText}>Back to sign in</Text>
        </Pressable>

        <View style={styles.content}>
          <View style={styles.illustration}>
            <Text style={styles.illustrationIcon}>🔐</Text>
          </View>

          <Text style={styles.title}>Forgot your password?</Text>

          <Text style={styles.description}>
            No worries. Enter the email address associated with your account and
            we will send instructions if the account is eligible for a password
            reset.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email address</Text>

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError("");
                setSuccess(false);
              }}
              placeholder="Enter your email address"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Request received</Text>

                <Text style={styles.successText}>
                  If an account exists for this email, password reset
                  instructions will be sent. Check your inbox and spam folder.
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSubmit}
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
                <Text style={styles.submitText}>Send Reset Instructions</Text>
              )}
            </Pressable>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>
              Remember your password?{" "}
              <Text style={styles.loginLink}>Sign In</Text>
            </Text>
          </Pressable>
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
    fontSize: 12,
    fontWeight: "700",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 25,
  },

  illustration: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 28,
  },

  illustrationIcon: {
    fontSize: 48,
  },

  title: {
    color: COLORS.text,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },

  description: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 12,
  },

  form: {
    marginTop: 30,
    gap: 12,
  },

  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  input: {
    height: 53,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    fontSize: 12,
    color: COLORS.text,
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

  successBox: {
    backgroundColor: "#DCFCE7",
    borderRadius: 12,
    padding: 14,
  },

  successTitle: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: "900",
  },

  successText: {
    color: "#166534",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },

  submitButton: {
    minHeight: 53,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
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

  loginButton: {
    alignItems: "center",
    marginTop: 25,
  },

  loginText: {
    color: COLORS.secondary,
    fontSize: 11,
  },

  loginLink: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  footer: {
    color: COLORS.secondary,
    fontSize: 10,
    textAlign: "center",
    marginTop: 20,
  },
});

export default ForgotPasswordScreen;
