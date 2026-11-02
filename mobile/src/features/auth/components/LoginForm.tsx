import React, { useState } from "react";

import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void> | void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
  loading?: boolean;
  initialEmail?: string;
  initialRememberMe?: boolean;
  externalError?: string;
}

const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  background: "#FFFFFF",
  text: "#172033",
  secondary: "#64748B",
  placeholder: "#94A3B8",
  border: "#E2E8F0",
  danger: "#DC2626",
  dangerBackground: "#FEF2F2",
  lightBlue: "#EFF6FF",
  success: "#16A34A",
};

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  onRegister,
  loading = false,
  initialEmail = "",
  initialRememberMe = true,
  externalError = "",
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(initialRememberMe);

  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [formError, setFormError] = useState("");

  const validateEmail = (value: string): string => {
    const normalized = value.trim();

    if (!normalized) {
      return "Email address is required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalized)) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value.trim()) {
      return "Password is required.";
    }

    if (value.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    return "";
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    setEmailError("");
    setFormError("");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    setPasswordError("");
    setFormError("");
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    setEmailError("");
    setPasswordError("");
    setFormError("");

    const normalizedEmail = email.trim().toLowerCase();

    const emailValidation = validateEmail(normalizedEmail);
    const passwordValidation = validatePassword(password);

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      return;
    }

    try {
      await onSubmit({
        email: normalizedEmail,
        password,
        rememberMe,
      });
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((current) => !current);
  };

  const handleToggleRememberMe = () => {
    setRememberMe((current) => !current);
  };

  return (
    <View style={styles.container}>
      {/* Form heading */}

      <View style={styles.heading}>
        <Text style={styles.headingTitle}>Welcome back</Text>

        <Text style={styles.headingDescription}>
          Sign in to access your Injibara University Lost & Found account.
        </Text>
      </View>

      {/* Email input */}

      <View style={styles.field}>
        <Text style={styles.label}>
          Email address
          <Text style={styles.required}> *</Text>
        </Text>

        <View
          style={[
            styles.inputContainer,
            emailError && styles.inputContainerError,
          ]}
        >
          <Text style={styles.inputIcon}>✉</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={handleEmailChange}
            placeholder="Enter your email address"
            placeholderTextColor={COLORS.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            editable={!loading}
          />
        </View>

        {emailError ? (
          <Text style={styles.fieldError}>{emailError}</Text>
        ) : null}
      </View>

      {/* Password input */}

      <View style={styles.field}>
        <Text style={styles.label}>
          Password
          <Text style={styles.required}> *</Text>
        </Text>

        <View
          style={[
            styles.inputContainer,
            passwordError && styles.inputContainerError,
          ]}
        >
          <Text style={styles.inputIcon}>🔒</Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={handlePasswordChange}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.placeholder}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            editable={!loading}
          />

          <Pressable
            onPress={handleTogglePassword}
            style={styles.passwordToggle}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
          >
            <Text style={styles.passwordToggleText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        </View>

        {passwordError ? (
          <Text style={styles.fieldError}>{passwordError}</Text>
        ) : null}
      </View>

      {/* Remember me and forgot password */}

      <View style={styles.optionsContainer}>
        <Pressable
          onPress={handleToggleRememberMe}
          style={styles.rememberContainer}
          disabled={loading}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe }}
        >
          <View
            style={[styles.checkbox, rememberMe && styles.checkboxSelected]}
          >
            {rememberMe ? <Text style={styles.checkboxCheck}>✓</Text> : null}
          </View>

          <Text style={styles.rememberText}>Remember me</Text>
        </Pressable>

        {onForgotPassword ? (
          <Pressable onPress={onForgotPassword} disabled={loading}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        ) : null}
      </View>

      {/* External error */}

      {externalError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>!</Text>

          <Text style={styles.errorText}>{externalError}</Text>
        </View>
      ) : null}

      {/* Local submission error */}

      {formError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>!</Text>

          <Text style={styles.errorText}>{formError}</Text>
        </View>
      ) : null}

      {/* Submit button */}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={({ pressed }) => [
          styles.submitButton,
          pressed && !loading && styles.submitButtonPressed,
          loading && styles.submitButtonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color={COLORS.background} />

            <Text style={styles.submitButtonText}>Signing in...</Text>
          </>
        ) : (
          <Text style={styles.submitButtonText}>Sign In</Text>
        )}
      </Pressable>

      {/* Registration link */}

      {onRegister ? (
        <View style={styles.registerContainer}>
          <Text style={styles.registerDescription}>Don't have an account?</Text>

          <Pressable onPress={onRegister} disabled={loading}>
            <Text style={styles.registerLink}>Create Account</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Security information */}

      <View style={styles.securityContainer}>
        <Text style={styles.securityIcon}>🛡</Text>

        <Text style={styles.securityText}>
          Your account information is protected. Always keep your password
          private.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 19,
  },

  heading: {
    gap: 8,
    marginBottom: 5,
  },

  headingTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: COLORS.text,
  },

  headingDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.secondary,
  },

  field: {
    width: "100%",
    gap: 8,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
  },

  required: {
    color: COLORS.danger,
  },

  inputContainer: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    borderRadius: 13,
    paddingHorizontal: 13,
  },

  inputContainerError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerBackground,
  },

  inputIcon: {
    fontSize: 15,
    marginRight: 10,
    color: COLORS.secondary,
  },

  input: {
    flex: 1,
    minHeight: 50,
    fontSize: 12,
    color: COLORS.text,
    paddingVertical: 10,
  },

  passwordToggle: {
    paddingHorizontal: 5,
    paddingVertical: 10,
  },

  passwordToggleText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.primary,
  },

  fieldError: {
    color: COLORS.danger,
    fontSize: 10,
    lineHeight: 15,
  },

  optionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },

  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  checkboxCheck: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: "900",
  },

  rememberText: {
    color: COLORS.secondary,
    fontSize: 10,
  },

  forgotText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.dangerBackground,
    borderRadius: 11,
    padding: 12,
    gap: 9,
  },

  errorIcon: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: COLORS.danger,
    color: COLORS.background,
    fontSize: 12,
    textAlign: "center",
    fontWeight: "900",
  },

  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 11,
    lineHeight: 16,
  },

  submitButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 2,
  },

  submitButtonPressed: {
    backgroundColor: COLORS.primaryDark,
    opacity: 0.85,
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: "900",
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  registerDescription: {
    color: COLORS.secondary,
    fontSize: 11,
  },

  registerLink: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  securityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: COLORS.lightBlue,
    padding: 13,
    borderRadius: 12,
  },

  securityIcon: {
    fontSize: 17,
  },

  securityText: {
    flex: 1,
    color: COLORS.secondary,
    fontSize: 9,
    lineHeight: 15,
  },
});

export default LoginForm;
