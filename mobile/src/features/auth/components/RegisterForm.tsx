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

export interface RegisterFormValues {
  fullName: string;
  email: string;
  phone?: string;
  studentId?: string;
  department?: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onSubmit: (values: RegisterFormValues) => Promise<void> | void;
  onLogin?: () => void;
  loading?: boolean;
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

const DEPARTMENTS = [
  "Software Engineering",
  "Computer Science",
  "Information Technology",
  "Information Systems",
  "Electrical Engineering",
  "Civil Engineering",
  "Mechanical Engineering",
  "Accounting",
  "Management",
  "Business Administration",
  "Other",
];

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  onLogin,
  loading = false,
  externalError = "",
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showDepartmentList, setShowDepartmentList] = useState(false);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormValues | "terms", string>>
  >({});

  const [formError, setFormError] = useState("");

  const validateFullName = (value: string): string => {
    if (!value.trim()) {
      return "Full name is required.";
    }

    if (value.trim().length < 3) {
      return "Full name must contain at least 3 characters.";
    }

    if (value.trim().length > 100) {
      return "Full name is too long.";
    }

    return "";
  };

  const validateEmail = (value: string): string => {
    if (!value.trim()) {
      return "Email address is required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value.trim())) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const validatePhone = (value: string): string => {
    if (!value.trim()) {
      return "";
    }

    const phonePattern = /^[+0-9\s()-]{7,20}$/;

    if (!phonePattern.test(value.trim())) {
      return "Please enter a valid phone number.";
    }

    return "";
  };

  const validateStudentId = (value: string): string => {
    if (value.trim().length > 50) {
      return "Student ID is too long.";
    }

    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value) {
      return "Password is required.";
    }

    if (value.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Include at least one uppercase letter.";
    }

    if (!/[a-z]/.test(value)) {
      return "Include at least one lowercase letter.";
    }

    if (!/[0-9]/.test(value)) {
      return "Include at least one number.";
    }

    return "";
  };

  const validateConfirmPassword = (value: string): string => {
    if (!value) {
      return "Please confirm your password.";
    }

    if (value !== password) {
      return "Passwords do not match.";
    }

    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const nameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const studentIdError = validateStudentId(studentId);
    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(confirmPassword);

    if (nameError) {
      newErrors.fullName = nameError;
    }

    if (emailError) {
      newErrors.email = emailError;
    }

    if (phoneError) {
      newErrors.phone = phoneError;
    }

    if (studentIdError) {
      newErrors.studentId = studentIdError;
    }

    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (confirmError) {
      newErrors.confirmPassword = confirmError;
    }

    if (!acceptedTerms) {
      newErrors.terms = "Please accept the terms before creating your account.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const clearFieldError = (field: keyof RegisterFormValues | "terms") => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setFormError("");
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    setFormError("");

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(studentId.trim() ? { studentId: studentId.trim() } : {}),
        ...(department.trim() ? { department: department.trim() } : {}),
        password,
        confirmPassword,
      });
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    }
  };

  const renderTextField = ({
    label,
    value,
    placeholder,
    onChangeText,
    error,
    keyboardType = "default",
    autoCapitalize = "sentences",
    optional = false,
    maxLength,
  }: {
    label: string;
    value: string;
    placeholder: string;
    onChangeText: (value: string) => void;
    error?: string;
    keyboardType?: "default" | "email-address" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words";
    optional?: boolean;
    maxLength?: number;
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {!optional ? <Text style={styles.required}> *</Text> : null}
        {optional ? <Text style={styles.optional}> (Optional)</Text> : null}
      </Text>

      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
        }}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        maxLength={maxLength}
        editable={!loading}
      />

      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );

  const renderPasswordField = ({
    label,
    value,
    placeholder,
    visible,
    toggleVisibility,
    onChangeText,
    error,
  }: {
    label: string;
    value: string;
    placeholder: string;
    visible: boolean;
    toggleVisibility: () => void;
    onChangeText: (value: string) => void;
    error?: string;
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        <Text style={styles.required}> *</Text>
      </Text>

      <View style={[styles.passwordContainer, error && styles.inputError]}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          editable={!loading}
        />

        <Pressable onPress={toggleVisibility} style={styles.showButton}>
          <Text style={styles.showText}>{visible ? "Hide" : "Show"}</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Heading */}

      <View style={styles.heading}>
        <Text style={styles.headingTitle}>Create your account</Text>

        <Text style={styles.headingDescription}>
          Register to report lost items, share found items, and reconnect
          belongings with their owners.
        </Text>
      </View>

      {/* Personal information */}

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionNumber}>01</Text>

          <Text style={styles.sectionTitle}>Personal information</Text>
        </View>

        {renderTextField({
          label: "Full name",
          value: fullName,
          placeholder: "Enter your full name",
          onChangeText: (value) => {
            setFullName(value);
            clearFieldError("fullName");
          },
          error: errors.fullName,
          maxLength: 100,
        })}

        {renderTextField({
          label: "Email address",
          value: email,
          placeholder: "Enter your email address",
          onChangeText: (value) => {
            setEmail(value);
            clearFieldError("email");
          },
          error: errors.email,
          keyboardType: "email-address",
          autoCapitalize: "none",
          maxLength: 254,
        })}

        {renderTextField({
          label: "Phone number",
          value: phone,
          placeholder: "Enter your phone number",
          onChangeText: (value) => {
            setPhone(value);
            clearFieldError("phone");
          },
          error: errors.phone,
          keyboardType: "phone-pad",
          optional: true,
          maxLength: 20,
        })}
      </View>

      {/* University information */}

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionNumber}>02</Text>

          <Text style={styles.sectionTitle}>University information</Text>
        </View>

        {renderTextField({
          label: "Student ID",
          value: studentId,
          placeholder: "Enter your university ID",
          onChangeText: (value) => {
            setStudentId(value);
            clearFieldError("studentId");
          },
          error: errors.studentId,
          autoCapitalize: "none",
          optional: true,
          maxLength: 50,
        })}

        <View style={styles.field}>
          <Text style={styles.label}>
            Department
            <Text style={styles.optional}> (Optional)</Text>
          </Text>

          <Pressable
            onPress={() => setShowDepartmentList((current) => !current)}
            style={styles.selectButton}
            disabled={loading}
          >
            <Text
              style={[
                styles.selectText,
                !department && styles.selectPlaceholder,
              ]}
            >
              {department || "Select your department"}
            </Text>

            <Text style={styles.selectArrow}>
              {showDepartmentList ? "⌃" : "⌄"}
            </Text>
          </Pressable>

          {showDepartmentList ? (
            <View style={styles.departmentList}>
              <ScrollView
                nestedScrollEnabled
                style={styles.departmentScroll}
                keyboardShouldPersistTaps="handled"
              >
                {DEPARTMENTS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setDepartment(item);
                      setShowDepartmentList(false);
                    }}
                    style={styles.departmentOption}
                  >
                    <Text
                      style={[
                        styles.departmentText,
                        department === item && styles.departmentTextSelected,
                      ]}
                    >
                      {item}
                    </Text>

                    {department === item ? (
                      <Text style={styles.departmentCheck}>✓</Text>
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </View>

      {/* Password information */}

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionNumber}>03</Text>

          <Text style={styles.sectionTitle}>Account security</Text>
        </View>

        {renderPasswordField({
          label: "Password",
          value: password,
          placeholder: "Create a strong password",
          visible: showPassword,
          toggleVisibility: () => setShowPassword((current) => !current),
          onChangeText: (value) => {
            setPassword(value);
            clearFieldError("password");
          },
          error: errors.password,
        })}

        {renderPasswordField({
          label: "Confirm password",
          value: confirmPassword,
          placeholder: "Enter your password again",
          visible: showConfirmPassword,
          toggleVisibility: () => setShowConfirmPassword((current) => !current),
          onChangeText: (value) => {
            setConfirmPassword(value);
            clearFieldError("confirmPassword");
          },
          error: errors.confirmPassword,
        })}

        <View style={styles.passwordRequirements}>
          <Text style={styles.requirementsTitle}>Password requirements</Text>

          <Text style={styles.requirement}>• At least 8 characters</Text>

          <Text style={styles.requirement}>• One uppercase letter (A-Z)</Text>

          <Text style={styles.requirement}>• One lowercase letter (a-z)</Text>

          <Text style={styles.requirement}>• One number (0-9)</Text>
        </View>
      </View>

      {/* Terms and conditions */}

      <Pressable
        onPress={() => {
          setAcceptedTerms((current) => !current);
          clearFieldError("terms");
        }}
        style={styles.termsContainer}
        disabled={loading}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acceptedTerms }}
      >
        <View
          style={[styles.checkbox, acceptedTerms && styles.checkboxSelected]}
        >
          {acceptedTerms ? <Text style={styles.checkboxCheck}>✓</Text> : null}
        </View>

        <Text style={styles.termsText}>
          I agree to use the Injibara Campus Lost & Found platform responsibly
          and follow university policies.
        </Text>
      </Pressable>

      {errors.terms ? (
        <Text style={styles.fieldError}>{errors.terms}</Text>
      ) : null}

      {/* Server error */}

      {externalError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>!</Text>

          <Text style={styles.errorText}>{externalError}</Text>
        </View>
      ) : null}

      {/* Form error */}

      {formError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>!</Text>

          <Text style={styles.errorText}>{formError}</Text>
        </View>
      ) : null}

      {/* Submit */}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={({ pressed }) => [
          styles.submitButton,
          pressed && !loading && styles.submitButtonPressed,
          loading && styles.submitButtonDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Create account"
      >
        {loading ? (
          <>
            <ActivityIndicator color={COLORS.background} size="small" />

            <Text style={styles.submitButtonText}>Creating account...</Text>
          </>
        ) : (
          <Text style={styles.submitButtonText}>Create Account</Text>
        )}
      </Pressable>

      {/* Login link */}

      {onLogin ? (
        <View style={styles.loginContainer}>
          <Text style={styles.loginDescription}>Already have an account?</Text>

          <Pressable onPress={onLogin} disabled={loading}>
            <Text style={styles.loginLink}>Sign In</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Privacy note */}

      <View style={styles.privacyContainer}>
        <Text style={styles.privacyIcon}>🛡</Text>

        <Text style={styles.privacyText}>
          Your personal information should only be used for account management
          and campus lost-and-found services. Do not share your password with
          anyone.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 22,
  },

  heading: {
    gap: 8,
    marginBottom: 2,
  },

  headingTitle: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "900",
  },

  headingDescription: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 18,
  },

  section: {
    gap: 16,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 2,
  },

  sectionNumber: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
    backgroundColor: COLORS.lightBlue,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },

  field: {
    gap: 8,
  },

  label: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
  },

  required: {
    color: COLORS.danger,
  },

  optional: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: "500",
  },

  input: {
    minHeight: 51,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    paddingHorizontal: 13,
    color: COLORS.text,
    fontSize: 12,
  },

  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.dangerBackground,
  },

  fieldError: {
    color: COLORS.danger,
    fontSize: 10,
    lineHeight: 15,
  },

  selectButton: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    paddingHorizontal: 13,
  },

  selectText: {
    color: COLORS.text,
    fontSize: 11,
    flex: 1,
  },

  selectPlaceholder: {
    color: COLORS.placeholder,
  },

  selectArrow: {
    color: COLORS.secondary,
    fontSize: 19,
    marginLeft: 10,
  },

  departmentList: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    overflow: "hidden",
  },

  departmentScroll: {
    maxHeight: 220,
  },

  departmentOption: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },

  departmentText: {
    color: COLORS.text,
    fontSize: 11,
  },

  departmentTextSelected: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  departmentCheck: {
    color: COLORS.success,
    fontSize: 15,
    fontWeight: "900",
  },

  passwordContainer: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    paddingHorizontal: 13,
  },

  passwordInput: {
    flex: 1,
    minHeight: 49,
    color: COLORS.text,
    fontSize: 12,
    paddingVertical: 10,
  },

  showButton: {
    paddingHorizontal: 5,
    paddingVertical: 9,
  },

  showText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
  },

  passwordRequirements: {
    backgroundColor: COLORS.lightBlue,
    borderRadius: 11,
    padding: 13,
    gap: 6,
  },

  requirementsTitle: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 3,
  },

  requirement: {
    color: COLORS.secondary,
    fontSize: 9,
    lineHeight: 15,
  },

  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  checkbox: {
    width: 19,
    height: 19,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
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

  termsText: {
    flex: 1,
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 16,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 12,
    backgroundColor: COLORS.dangerBackground,
    borderRadius: 11,
  },

  errorIcon: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: COLORS.danger,
    color: COLORS.background,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "900",
  },

  errorText: {
    flex: 1,
    color: COLORS.danger,
    fontSize: 10,
    lineHeight: 16,
  },

  submitButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
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
    fontSize: 13,
    fontWeight: "900",
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  loginDescription: {
    color: COLORS.secondary,
    fontSize: 11,
  },

  loginLink: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  privacyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: COLORS.lightBlue,
    padding: 13,
    borderRadius: 12,
  },

  privacyIcon: {
    fontSize: 17,
  },

  privacyText: {
    flex: 1,
    color: COLORS.secondary,
    fontSize: 9,
    lineHeight: 15,
  },
});

export default RegisterForm;
