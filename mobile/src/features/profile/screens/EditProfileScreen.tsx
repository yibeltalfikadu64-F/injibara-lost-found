// mobile/src/features/profile/screens/EditProfileScreen.tsx

import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "../../auth/store/authStore";

import profileApi, {
  UpdateProfilePayload,
  UserProfile,
  validateProfile,
} from "../services/profileApi";

import styles, { COLORS } from "../styles/ProfileScreen.styles";

// ------------------------------------------------------
// Navigation types
// ------------------------------------------------------

interface EditProfileNavigation {
  goBack: () => void;
}

interface EditProfileScreenProps {
  navigation: EditProfileNavigation;
}

// ------------------------------------------------------
// Form types
// ------------------------------------------------------

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  studentId: string;
  employeeId: string;
  department: string;
  faculty: string;
  bio: string;
}

type FormField = keyof ProfileFormData;

type FormErrors = Partial<Record<FormField, string>>;

// ------------------------------------------------------
// Initial form
// ------------------------------------------------------

const INITIAL_FORM: ProfileFormData = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  studentId: "",
  employeeId: "",
  department: "",
  faculty: "",
  bio: "",
};

// ------------------------------------------------------
// Convert profile to form
// ------------------------------------------------------

function profileToForm(profile: UserProfile): ProfileFormData {
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    studentId: profile.studentId ?? "",
    employeeId: profile.employeeId ?? "",
    department: profile.department ?? "",
    faculty: profile.faculty ?? "",
    bio: profile.bio ?? "",
  };
}

// ------------------------------------------------------
// Convert form to API payload
// ------------------------------------------------------

function formToPayload(form: ProfileFormData): UpdateProfilePayload {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    phoneNumber: form.phoneNumber.trim(),
    studentId: form.studentId.trim(),
    employeeId: form.employeeId.trim(),
    department: form.department.trim(),
    faculty: form.faculty.trim(),
    bio: form.bio.trim(),
  };
}

// ------------------------------------------------------
// Error helper
// ------------------------------------------------------

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to save your profile. Please try again.";
}

// ------------------------------------------------------
// Component
// ------------------------------------------------------

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  navigation,
}) => {
  // ----------------------------------------------------
  // Authentication
  // ----------------------------------------------------

  const accessToken = useAuthStore((state) => state.accessToken);

  // ----------------------------------------------------
  // State
  // ----------------------------------------------------

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [form, setForm] = useState<ProfileFormData>(INITIAL_FORM);

  const [errors, setErrors] = useState<FormErrors>({});

  const [isLoading, setIsLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // ----------------------------------------------------
  // Load current profile
  // ----------------------------------------------------

  const loadProfile = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);

      Alert.alert(
        "Authentication required",
        "Please sign in again to edit your profile.",
      );

      return;
    }

    setIsLoading(true);

    try {
      const result = await profileApi.getMyProfile(accessToken);

      setProfile(result);
      setForm(profileToForm(result));
      setErrors({});
      setHasChanges(false);
    } catch (error) {
      Alert.alert("Unable to load profile", getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ----------------------------------------------------
  // Update a field
  // ----------------------------------------------------

  const updateField = useCallback((field: FormField, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setHasChanges(true);
    setSaveSuccess(false);

    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];

      return next;
    });
  }, []);

  // ----------------------------------------------------
  // Validate the form
  // ----------------------------------------------------

  const validateForm = useCallback((): boolean => {
    const payload = formToPayload(form);

    const validationErrors = validateProfile(payload);

    setErrors(validationErrors as FormErrors);

    return Object.keys(validationErrors).length === 0;
  }, [form]);

  // ----------------------------------------------------
  // Save profile
  // ----------------------------------------------------

  const handleSave = useCallback(async () => {
    if (!accessToken) {
      Alert.alert("Authentication required", "Please sign in again.");

      return;
    }

    if (isSaving) {
      return;
    }

    if (!validateForm()) {
      Alert.alert(
        "Check your information",
        "Please correct the highlighted fields before saving.",
      );

      return;
    }

    if (!hasChanges) {
      Alert.alert(
        "No changes",
        "You have not changed any profile information.",
      );

      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = formToPayload(form);

      const updatedProfile = await profileApi.updateMyProfile(
        payload,
        accessToken,
      );

      setProfile(updatedProfile);
      setForm(profileToForm(updatedProfile));
      setErrors({});
      setHasChanges(false);
      setSaveSuccess(true);

      Alert.alert(
        "Profile updated",
        "Your profile information has been successfully updated.",
        [
          {
            text: "Done",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      Alert.alert("Update failed", getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }, [accessToken, isSaving, validateForm, hasChanges, form, navigation]);

  // ----------------------------------------------------
  // Cancel editing
  // ----------------------------------------------------

  const handleCancel = useCallback(() => {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      "Discard changes?",
      "Your unsaved profile changes will be lost.",
      [
        {
          text: "Continue editing",
          style: "cancel",
        },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }, [hasChanges, navigation]);

  // ----------------------------------------------------
  // Input field component
  // ----------------------------------------------------

  const renderInput = ({
    field,
    label,
    placeholder,
    icon,
    required = false,
    keyboardType = "default",
    autoCapitalize = "sentences",
    editable = true,
    helperText,
    multiline = false,
    maxLength,
  }: {
    field: FormField;
    label: string;
    placeholder: string;
    icon: keyof typeof Ionicons.glyphMap;
    required?: boolean;
    keyboardType?: "default" | "email-address" | "phone-pad";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    editable?: boolean;
    helperText?: string;
    multiline?: boolean;
    maxLength?: number;
  }) => {
    const hasError = Boolean(errors[field]);

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {label}
          {required ? <Text style={styles.requiredMark}>{" *"}</Text> : null}
        </Text>

        <View
          style={[
            styles.inputWrapper,
            multiline && styles.textAreaWrapper,
            hasError && styles.inputError,
            !editable && styles.inputWrapperDisabled,
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={hasError ? COLORS.danger : COLORS.textMuted}
            style={styles.inputIcon}
          />

          <TextInput
            value={form[field]}
            onChangeText={(value) => updateField(field, value)}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={editable && !isSaving}
            multiline={multiline}
            maxLength={maxLength}
            style={[
              styles.textInput,
              multiline && styles.textArea,
              !editable && styles.textInputDisabled,
            ]}
            textAlignVertical={multiline ? "top" : "center"}
          />
        </View>

        {hasError ? (
          <Text style={styles.errorText}>{errors[field]}</Text>
        ) : helperText ? (
          <Text style={styles.inputHelper}>{helperText}</Text>
        ) : null}

        {field === "bio" ? (
          <Text style={[styles.inputHelper, { textAlign: "right" }]}>
            {form.bio.length}/300 characters
          </Text>
        ) : null}
      </View>
    );
  };

  // ----------------------------------------------------
  // Loading state
  // ----------------------------------------------------

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />

          <Text style={styles.loadingText}>Loading profile information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // Profile unavailable state
  // ----------------------------------------------------

  if (!profile) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={36} color={COLORS.danger} />

          <Text style={styles.errorTitle}>Profile unavailable</Text>

          <Text style={styles.errorMessage}>
            We could not retrieve your account information.
          </Text>

          <Pressable onPress={loadProfile} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>

          <Pressable onPress={navigation.goBack} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // Main UI
  // ----------------------------------------------------

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.screenContent}
        >
          {/* Header */}
          <View style={styles.editHeader}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={handleCancel}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={21} color={COLORS.text} />
            </Pressable>

            <View style={styles.editHeaderTextContainer}>
              <Text style={styles.editHeaderTitle}>Edit Profile</Text>

              <Text style={styles.editHeaderSubtitle}>
                Update your campus account information
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.formIntro}>
              <Text style={styles.formIntroTitle}>Personal details</Text>

              <Text style={styles.formIntroText}>
                Keep your information accurate so other members of Injibara
                Campus can identify and contact you when necessary.
              </Text>
            </View>

            {/* Success message */}
            {saveSuccess ? (
              <View style={styles.successContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.success}
                />

                <Text style={styles.successText}>
                  Your profile has been updated successfully.
                </Text>
              </View>
            ) : null}

            {/* Personal information */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Personal Information</Text>

              {renderInput({
                field: "firstName",
                label: "First Name",
                placeholder: "Enter your first name",
                icon: "person-outline",
                required: true,
                autoCapitalize: "words",
                maxLength: 50,
              })}

              {renderInput({
                field: "lastName",
                label: "Last Name",
                placeholder: "Enter your last name",
                icon: "person-outline",
                required: true,
                autoCapitalize: "words",
                maxLength: 50,
              })}

              {renderInput({
                field: "phoneNumber",
                label: "Phone Number",
                placeholder: "Enter your phone number",
                icon: "call-outline",
                keyboardType: "phone-pad",
                maxLength: 20,
                helperText:
                  "Use a phone number where campus members can reach you.",
              })}

              {renderInput({
                field: "bio",
                label: "About Me",
                placeholder: "Write a short introduction about yourself...",
                icon: "information-circle-outline",
                multiline: true,
                maxLength: 300,
                helperText: "Maximum 300 characters.",
              })}
            </View>

            {/* Campus information */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Campus Information</Text>

              <View style={styles.readOnlyNotice}>
                <Ionicons
                  name="information-circle-outline"
                  size={19}
                  color={COLORS.primary}
                />

                <Text style={styles.readOnlyNoticeText}>
                  Your campus identity information may be controlled by the
                  university. Confirm that your backend allows users to update
                  these fields before enabling them.
                </Text>
              </View>

              {renderInput({
                field: "studentId",
                label: "Student ID",
                placeholder: "Enter your student ID",
                icon: "id-card-outline",
                autoCapitalize: "characters",
                editable: profile.role === "STUDENT",
                maxLength: 50,
              })}

              {renderInput({
                field: "employeeId",
                label: "Employee ID",
                placeholder: "Enter your employee ID",
                icon: "briefcase-outline",
                autoCapitalize: "characters",
                editable:
                  profile.role === "STAFF" || profile.role === "SECURITY",
                maxLength: 50,
              })}

              {renderInput({
                field: "department",
                label: "Department",
                placeholder: "Enter your department",
                icon: "business-outline",
                maxLength: 100,
              })}

              {renderInput({
                field: "faculty",
                label: "Faculty",
                placeholder: "Enter your faculty",
                icon: "school-outline",
                maxLength: 100,
              })}
            </View>

            {/* Read-only account information */}
            <View style={styles.formSection}>
              <Text style={styles.formSectionTitle}>Account Information</Text>

              <View style={styles.readOnlyNotice}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={COLORS.primary}
                />

                <Text style={styles.readOnlyNoticeText}>
                  Your registered email and account role cannot be changed from
                  this screen.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>

                <View style={[styles.inputWrapper, styles.readOnlyField]}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={COLORS.textMuted}
                    style={styles.inputIcon}
                  />

                  <TextInput
                    value={profile.email}
                    editable={false}
                    style={[styles.textInput, styles.textInputDisabled]}
                  />

                  <Ionicons
                    name="lock-closed-outline"
                    size={15}
                    color={COLORS.textMuted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Role</Text>

                <View style={[styles.inputWrapper, styles.readOnlyField]}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color={COLORS.textMuted}
                    style={styles.inputIcon}
                  />

                  <TextInput
                    value={profile.role}
                    editable={false}
                    style={[styles.textInput, styles.textInputDisabled]}
                  />
                </View>
              </View>
            </View>

            {/* Save button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
              disabled={isSaving}
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveButton,
                isSaving && styles.saveButtonDisabled,
                pressed && !isSaving ? styles.buttonPressed : undefined,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="save-outline" size={19} color={COLORS.white} />
              )}

              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving Changes..." : "Save Changes"}
              </Text>
            </Pressable>

            {/* Cancel button */}
            <Pressable
              accessibilityRole="button"
              disabled={isSaving}
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
