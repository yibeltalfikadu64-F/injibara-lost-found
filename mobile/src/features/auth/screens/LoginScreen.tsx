import React, { useState } from "react";

import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import SafeScreen from "../../../components/layout/SafeScreen";
import { useAuth } from "../../../app/providers/AuthProvider";

const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#172033",
  secondary: "#64748B",
  border: "#E2E8F0",
  danger: "#DC2626",
  lightBlue: "#EFF6FF",
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const validateForm = (): boolean => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (!password) {
      setError("Please enter your password.");
      return false;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      // AuthProvider updates the authenticated state.
      // RootNavigator should switch to the authenticated navigator.
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen
      backgroundColor={COLORS.background}
      statusBarStyle="dark-content"
      keyboardAvoiding
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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

          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>IU</Text>
            </View>
          </View>

          <View style={styles.heading}>
            <Text style={styles.title}>Welcome back!</Text>

            <Text style={styles.subtitle}>
              Sign in to continue to your campus account.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email address</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>✉</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your university email"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>

                <Pressable
                  onPress={() =>
                    navigation.navigate("ForgotPassword", {
                      email,
                    })
                  }
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>▣</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setError("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />

                <Pressable
                  onPress={() => setShowPassword((current) => !current)}
                  style={styles.visibilityButton}
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  <Text style={styles.visibilityText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>!</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              disabled={loading}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.pressed,
                loading && styles.disabledButton,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitText}>Sign In</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>NEW TO OUR COMMUNITY?</Text>
            <View style={styles.separatorLine} />
          </View>

          <Pressable
            onPress={() => navigation.navigate("Register")}
            style={styles.registerButton}
          >
            <Text style={styles.registerText}>Create an account</Text>
          </Pressable>

          <Text style={styles.footer}>
            Injibara University • Campus Lost & Found
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 23,
    paddingTop: 10,
    paddingBottom: 25,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    height: 40,
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

  logoContainer: {
    alignItems: "center",
    marginTop: 15,
  },

  logo: {
    width: 66,
    height: 66,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  logoText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
  },

  heading: {
    marginTop: 23,
    marginBottom: 27,
    alignItems: "center",
  },

  title: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: "900",
  },

  subtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 9,
    lineHeight: 19,
  },

  form: {
    gap: 20,
  },

  field: {
    gap: 9,
  },

  label: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },

  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  forgotText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
  },

  inputContainer: {
    minHeight: 53,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  inputIcon: {
    color: COLORS.secondary,
    fontSize: 17,
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12,
    paddingVertical: 12,
  },

  visibilityButton: {
    padding: 7,
  },

  visibilityText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 11,
    padding: 12,
    gap: 9,
  },

  errorIcon: {
    width: 19,
    height: 19,
    overflow: "hidden",
    textAlign: "center",
    textAlignVertical: "center",
    color: COLORS.white,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    fontWeight: "900",
  },

  errorText: {
    color: COLORS.danger,
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
  },

  submitButton: {
    minHeight: 53,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },

  submitText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.75,
  },

  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    gap: 10,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  separatorText: {
    fontSize: 9,
    color: COLORS.secondary,
    fontWeight: "800",
  },

  registerButton: {
    minHeight: 48,
    marginTop: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.lightBlue,
  },

  registerText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  footer: {
    textAlign: "center",
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 25,
  },
});

export default LoginScreen;
