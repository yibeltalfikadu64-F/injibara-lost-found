// mobile/src/features/items/screens/ReportLostScreen.tsx

import React, { useState, useCallback } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import * as ImagePicker from "expo-image-picker";

import { useAuthStore } from "../../auth/store/authStore";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  success: "#16A34A",
  gray: "#F1F5F9",
};

/* =========================================================
   TYPES
========================================================= */

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  dateLost?: string;
  contactPhone?: string;
  general?: string;
}

interface SelectedPhoto {
  uri: string;
  fileName: string;
  mimeType: string;
}

/* =========================================================
   CONSTANTS
========================================================= */

const CATEGORIES = [
  "Electronics",
  "Books & Notes",
  "ID Cards",
  "Wallets",
  "Keys",
  "Bags",
  "Clothing",
  "Accessories",
  "Documents",
  "Other",
];

const MAX_IMAGES = 5;

const MAX_IMAGE_SIZE_MB = 5;

/* =========================================================
   HELPERS
========================================================= */

function isValidDate(value: string): boolean {
  if (!value.trim()) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

function validateForm(values: {
  title: string;
  description: string;
  category: string;
  location: string;
  dateLost: string;
  contactPhone: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!values.title.trim()) {
    errors.title = "Please enter the item name.";
  } else if (values.title.trim().length < 3) {
    errors.title = "The item name must be at least 3 characters.";
  } else if (values.title.trim().length > 100) {
    errors.title = "The item name cannot exceed 100 characters.";
  }

  if (!values.description.trim()) {
    errors.description = "Please describe your missing item.";
  } else if (values.description.trim().length < 10) {
    errors.description = "Please provide at least 10 characters.";
  } else if (values.description.trim().length > 2000) {
    errors.description = "Description cannot exceed 2000 characters.";
  }

  if (!values.category) {
    errors.category = "Please select an item category.";
  }

  if (!values.location.trim()) {
    errors.location = "Please enter where you lost the item.";
  }

  if (!values.dateLost.trim()) {
    errors.dateLost = "Please enter the date the item was lost.";
  } else if (!isValidDate(values.dateLost)) {
    errors.dateLost = "Use a valid date, for example 2026-10-31.";
  }

  if (
    values.contactPhone.trim() &&
    !/^[+0-9()\-\s]{7,20}$/.test(values.contactPhone)
  ) {
    errors.contactPhone = "Please enter a valid contact number.";
  }

  return errors;
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();

    return (
      body.message || body.error || "Unable to submit your lost item report."
    );
  } catch {
    return "Unable to submit your lost item report.";
  }
}

/* =========================================================
   REUSABLE FIELD
========================================================= */

interface FormFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  error?: string;
  multiline?: boolean;
  keyboardType?: "default" | "phone-pad";
  maxLength?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  placeholder,
  onChangeText,
  error,
  multiline = false,
  keyboardType = "default",
  maxLength,
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>
      {label}
      <Text style={styles.requiredMark}> *</Text>
    </Text>

    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      keyboardType={keyboardType}
      multiline={multiline}
      maxLength={maxLength}
      textAlignVertical={multiline ? "top" : "center"}
      style={[
        styles.input,
        multiline && styles.multilineInput,
        error && styles.inputError,
      ]}
    />

    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

/* =========================================================
   MAIN SCREEN
========================================================= */

const ReportLostScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const token = useAuthStore((state) => state.accessToken);

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [category, setCategory] = useState("");

  const [location, setLocation] = useState("");

  const [dateLost, setDateLost] = useState("");

  const [color, setColor] = useState("");

  const [brand, setBrand] = useState("");

  const [identifyingFeatures, setIdentifyingFeatures] = useState("");

  const [contactPhone, setContactPhone] = useState("");

  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});

  const [submitting, setSubmitting] = useState(false);

  /* =======================================================
     CLEAR FIELD ERROR
  ======================================================= */

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
      general: undefined,
    }));
  }, []);

  /* =======================================================
     PICK PHOTOS
  ======================================================= */

  const handlePickPhotos = useCallback(async () => {
    if (photos.length >= MAX_IMAGES) {
      Alert.alert(
        "Image limit reached",
        `You can upload up to ${MAX_IMAGES} images.`,
      );
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Allow photo library access to attach pictures of your missing item.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        selectionLimit: MAX_IMAGES - photos.length,
      });

      if (result.canceled) {
        return;
      }

      const selected = result.assets
        .filter((asset) => Boolean(asset.uri))
        .map((asset) => ({
          uri: asset.uri,
          fileName: asset.fileName || `lost-item-${Date.now()}.jpg`,
          mimeType: asset.mimeType || "image/jpeg",
          fileSize: asset.fileSize,
        }));

      const oversized = selected.find(
        (photo) =>
          photo.fileSize !== undefined &&
          photo.fileSize > MAX_IMAGE_SIZE_MB * 1024 * 1024,
      );

      if (oversized) {
        Alert.alert(
          "Image too large",
          `Each image must be smaller than ${MAX_IMAGE_SIZE_MB} MB.`,
        );
        return;
      }

      setPhotos((previous) =>
        [
          ...previous,
          ...selected.map(({ uri, fileName, mimeType }) => ({
            uri,
            fileName,
            mimeType,
          })),
        ].slice(0, MAX_IMAGES),
      );
    } catch {
      Alert.alert(
        "Image selection failed",
        "Unable to select images. Please try again.",
      );
    }
  }, [photos]);

  /* =======================================================
     REMOVE PHOTO
  ======================================================= */

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((previous) =>
      previous.filter((_, photoIndex) => photoIndex !== index),
    );
  }, []);

  /* =======================================================
     VALIDATE
  ======================================================= */

  const handleValidate = useCallback((): boolean => {
    const nextErrors = validateForm({
      title,
      description,
      category,
      location,
      dateLost,
      contactPhone,
    });

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }, [title, description, category, location, dateLost, contactPhone]);

  /* =======================================================
     SUBMIT REPORT
  ======================================================= */

  const handleSubmit = useCallback(async () => {
    if (!token) {
      Alert.alert(
        "Login required",
        "Please log in before reporting a lost item.",
      );
      return;
    }

    if (!handleValidate()) {
      Alert.alert(
        "Check your information",
        "Please correct the highlighted fields before submitting.",
      );
      return;
    }

    setSubmitting(true);

    setErrors({});

    try {
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("type", "LOST");
      formData.append("category", category);
      formData.append("location", location.trim());
      formData.append("dateLostOrFound", dateLost.trim());

      if (color.trim()) {
        formData.append("color", color.trim());
      }

      if (brand.trim()) {
        formData.append("brand", brand.trim());
      }

      if (identifyingFeatures.trim()) {
        formData.append("identifyingFeatures", identifyingFeatures.trim());
      }

      if (contactPhone.trim()) {
        formData.append("contactPhone", contactPhone.trim());
      }

      photos.forEach((photo, index) => {
        formData.append("images", {
          uri: photo.uri,
          name: photo.fileName || `lost-${index}.jpg`,
          type: photo.mimeType,
        } as any);
      });

      const response = await fetch(`${API_BASE_URL}/items`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      Alert.alert(
        "Report submitted",
        "Your lost item report has been submitted successfully.",
        [
          {
            text: "View reports",
            onPress: () => {
              navigation.navigate("MyItems");
            },
          },
          {
            text: "Done",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.";

      setErrors({
        general: message,
      });

      Alert.alert("Submission failed", message);
    } finally {
      setSubmitting(false);
    }
  }, [
    token,
    handleValidate,
    title,
    description,
    category,
    location,
    dateLost,
    color,
    brand,
    identifyingFeatures,
    contactPhone,
    photos,
    navigation,
  ]);

  /* =======================================================
     CANCEL
  ======================================================= */

  const handleCancel = useCallback(() => {
    const hasContent =
      title.trim() ||
      description.trim() ||
      location.trim() ||
      photos.length > 0;

    if (!hasContent) {
      navigation.goBack();
      return;
    }

    Alert.alert("Discard report?", "Your entered information will be lost.", [
      {
        text: "Continue editing",
        style: "cancel",
      },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => navigation.goBack(),
      },
    ]);
  }, [title, description, location, photos, navigation]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}

      <View style={styles.header}>
        <Pressable onPress={handleCancel} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Report Lost Item</Text>

          <Text style={styles.headerSubtitle}>Tell us what you lost</Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>🔍</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Information */}

          <View style={styles.informationBanner}>
            <Text style={styles.informationIcon}>💡</Text>

            <Text style={styles.informationText}>
              Provide accurate information and clear pictures to help other
              campus members identify your missing item.
            </Text>
          </View>

          {/* General error */}

          {errors.general && (
            <View style={styles.generalError}>
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          )}

          {/* Item name */}

          <FormField
            label="Item name"
            value={title}
            placeholder="Example: Black Samsung phone"
            onChangeText={(value) => {
              setTitle(value);
              clearError("title");
            }}
            error={errors.title}
            maxLength={100}
          />

          {/* Category */}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Item category
              <Text style={styles.requiredMark}> *</Text>
            </Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((itemCategory) => {
                const selected = category === itemCategory;

                return (
                  <Pressable
                    key={itemCategory}
                    onPress={() => {
                      setCategory(itemCategory);
                      clearError("category");
                    }}
                    style={[
                      styles.categoryOption,
                      selected && styles.categorySelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.categorySelectedText,
                      ]}
                    >
                      {itemCategory}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {errors.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}
          </View>

          {/* Description */}

          <FormField
            label="Description"
            value={description}
            placeholder="Describe the missing item, including its appearance and any unique details..."
            onChangeText={(value) => {
              setDescription(value);
              clearError("description");
            }}
            error={errors.description}
            multiline
            maxLength={2000}
          />

          {/* Location */}

          <FormField
            label="Where did you lose it?"
            value={location}
            placeholder="Example: Library, Block A, Room 204"
            onChangeText={(value) => {
              setLocation(value);
              clearError("location");
            }}
            error={errors.location}
            maxLength={150}
          />

          {/* Date */}

          <FormField
            label="Date lost"
            value={dateLost}
            placeholder="YYYY-MM-DD"
            onChangeText={(value) => {
              setDateLost(value);
              clearError("dateLost");
            }}
            error={errors.dateLost}
          />

          {/* Additional details */}

          <Text style={styles.subsectionTitle}>Additional details</Text>

          <FormField
            label="Color"
            value={color}
            placeholder="Example: Black and silver"
            onChangeText={setColor}
          />

          <FormField
            label="Brand"
            value={brand}
            placeholder="Example: Samsung, HP, Nike"
            onChangeText={setBrand}
          />

          <FormField
            label="Identifying features"
            value={identifyingFeatures}
            placeholder="Scratches, stickers, labels, unique marks..."
            onChangeText={setIdentifyingFeatures}
            multiline
          />

          <FormField
            label="Contact phone (optional)"
            value={contactPhone}
            placeholder="Your preferred contact number"
            onChangeText={(value) => {
              setContactPhone(value);
              clearError("contactPhone");
            }}
            error={errors.contactPhone}
            keyboardType="phone-pad"
          />

          {/* Photos */}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Item photos</Text>

            <Text style={styles.fieldHint}>
              Add up to {MAX_IMAGES} images. Each image must be no larger than{" "}
              {MAX_IMAGE_SIZE_MB} MB.
            </Text>

            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View
                  key={`${photo.uri}-${index}`}
                  style={styles.photoContainer}
                >
                  <Image source={{ uri: photo.uri }} style={styles.photo} />

                  <Pressable
                    onPress={() => handleRemovePhoto(index)}
                    style={styles.removePhotoButton}
                    accessibilityLabel="Remove selected photo"
                  >
                    <Text style={styles.removePhotoText}>×</Text>
                  </Pressable>
                </View>
              ))}

              {photos.length < MAX_IMAGES && (
                <Pressable
                  onPress={handlePickPhotos}
                  style={styles.addPhotoButton}
                >
                  <Text style={styles.addPhotoIcon}>+</Text>

                  <Text style={styles.addPhotoText}>Add photo</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Notice */}

          <View style={styles.noticeCard}>
            <Text style={styles.noticeTitle}>Important</Text>

            <Text style={styles.noticeText}>
              Do not include passwords, bank details, or other sensitive
              information in your report. University staff may review submitted
              reports.
            </Text>
          </View>

          {/* Actions */}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                Submit Lost Item Report
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={handleCancel}
            disabled={submitting}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>

          <Text style={styles.footerText}>
            Injibara University · Campus Lost & Found
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = {
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardContainer: {
    flex: 1,
  },

  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 17,
    paddingVertical: 13,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: COLORS.gray,
  },

  backButtonText: {
    fontSize: 30,
    color: COLORS.text,
    lineHeight: 34,
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "900" as const,
    color: COLORS.text,
  },

  headerSubtitle: {
    fontSize: 10,
    color: COLORS.secondary,
    marginTop: 3,
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  headerIconText: {
    fontSize: 20,
  },

  scrollContent: {
    padding: 19,
    paddingBottom: 45,
  },

  informationBanner: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderRadius: 13,
    marginBottom: 22,
  },

  informationIcon: {
    fontSize: 20,
    marginRight: 10,
  },

  informationText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    color: "#1E40AF",
  },

  generalError: {
    padding: 13,
    borderRadius: 11,
    backgroundColor: COLORS.dangerLight,
    marginBottom: 17,
  },

  generalErrorText: {
    color: COLORS.danger,
    fontSize: 11,
    lineHeight: 17,
  },

  fieldContainer: {
    marginBottom: 21,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: COLORS.text,
    marginBottom: 9,
  },

  requiredMark: {
    color: COLORS.danger,
  },

  input: {
    minHeight: 49,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    fontSize: 12,
  },

  multilineInput: {
    minHeight: 115,
    paddingTop: 13,
    paddingBottom: 13,
  },

  inputError: {
    borderColor: COLORS.danger,
  },

  errorText: {
    fontSize: 10,
    color: COLORS.danger,
    marginTop: 6,
  },

  categoryGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },

  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  categorySelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  categoryText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: COLORS.secondary,
  },

  categorySelectedText: {
    color: COLORS.white,
  },

  subsectionTitle: {
    fontSize: 15,
    fontWeight: "900" as const,
    color: COLORS.text,
    marginTop: 7,
    marginBottom: 17,
  },

  fieldHint: {
    fontSize: 10,
    color: COLORS.secondary,
    lineHeight: 16,
    marginBottom: 11,
  },

  photoGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
  },

  photoContainer: {
    width: 95,
    height: 95,
    borderRadius: 12,
    overflow: "hidden" as const,
    position: "relative" as const,
  },

  photo: {
    width: "100%" as const,
    height: "100%" as const,
  },

  removePhotoButton: {
    position: "absolute" as const,
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  removePhotoText: {
    color: COLORS.white,
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "900" as const,
  },

  addPhotoButton: {
    width: 95,
    height: 95,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed" as const,
    borderColor: COLORS.primary,
    backgroundColor: "#EFF6FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  addPhotoIcon: {
    fontSize: 30,
    color: COLORS.primary,
    fontWeight: "400" as const,
  },

  addPhotoText: {
    fontSize: 9,
    fontWeight: "800" as const,
    color: COLORS.primary,
    marginTop: 3,
  },

  noticeCard: {
    padding: 15,
    backgroundColor: "#FFFBEB",
    borderRadius: 13,
    marginBottom: 20,
  },

  noticeTitle: {
    fontSize: 12,
    fontWeight: "900" as const,
    color: "#92400E",
    marginBottom: 6,
  },

  noticeText: {
    fontSize: 10,
    lineHeight: 17,
    color: "#92400E",
  },

  submitButton: {
    minHeight: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 11,
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900" as const,
  },

  cancelButton: {
    minHeight: 48,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cancelButtonText: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: COLORS.secondary,
  },

  footerText: {
    textAlign: "center" as const,
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 23,
  },
};

export default ReportLostScreen;
