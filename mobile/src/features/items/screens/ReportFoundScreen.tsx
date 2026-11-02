// mobile/src/features/items/screens/ReportFoundScreen.tsx

import React, { useCallback, useState } from "react";

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
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  success: "#16A34A",
  successLight: "#DCFCE7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  gray: "#F1F5F9",
};

/* =========================================================
   TYPES
========================================================= */

interface FoundItemForm {
  title: string;
  description: string;
  category: string;
  location: string;
  dateFound: string;
  color: string;
  brand: string;
  identifyingFeatures: string;
}

interface FoundItemErrors {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  dateFound?: string;
  general?: string;
}

interface FoundPhoto {
  uri: string;
  name: string;
  type: string;
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
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM: FoundItemForm = {
  title: "",
  description: "",
  category: "",
  location: "",
  dateFound: "",
  color: "",
  brand: "",
  identifyingFeatures: "",
};

/* =========================================================
   VALIDATION
========================================================= */

function validateForm(form: FoundItemForm): FoundItemErrors {
  const errors: FoundItemErrors = {};

  if (!form.title.trim()) {
    errors.title = "Please enter the item name.";
  } else if (form.title.trim().length < 3) {
    errors.title = "The item name must be at least 3 characters.";
  }

  if (!form.description.trim()) {
    errors.description = "Please describe the found item.";
  } else if (form.description.trim().length < 10) {
    errors.description = "Please provide more details.";
  }

  if (!form.category) {
    errors.category = "Select a category.";
  }

  if (!form.location.trim()) {
    errors.location = "Enter where you found the item.";
  }

  if (!form.dateFound.trim()) {
    errors.dateFound = "Enter the date you found the item.";
  } else if (Number.isNaN(new Date(form.dateFound).getTime())) {
    errors.dateFound = "Enter a valid date such as 2026-10-31.";
  }

  return errors;
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();

    return (
      data.message || data.error || "Unable to submit your found item report."
    );
  } catch {
    return "Unable to submit your found item report.";
  }
}

/* =========================================================
   FORM INPUT
========================================================= */

interface FieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  error?: string;
  multiline?: boolean;
  required?: boolean;
}

const Field: React.FC<FieldProps> = ({
  label,
  value,
  placeholder,
  onChangeText,
  error,
  multiline = false,
  required = false,
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>
      {label}

      {required && <Text style={styles.required}> *</Text>}
    </Text>

    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      style={[
        styles.input,
        multiline && styles.multiline,
        error && styles.inputError,
      ]}
    />

    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

/* =========================================================
   MAIN SCREEN
========================================================= */

const ReportFoundScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const token = useAuthStore((state) => state.accessToken);

  const [form, setForm] = useState<FoundItemForm>(INITIAL_FORM);

  const [errors, setErrors] = useState<FoundItemErrors>({});

  const [photos, setPhotos] = useState<FoundPhoto[]>([]);

  const [submitting, setSubmitting] = useState(false);

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  const updateField = useCallback(
    <K extends keyof FoundItemForm>(field: K, value: FoundItemForm[K]) => {
      setForm((previous) => ({
        ...previous,
        [field]: value,
      }));

      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
        general: undefined,
      }));
    },
    [],
  );

  /* =======================================================
     PICK PHOTOS
  ======================================================= */

  const pickPhotos = useCallback(async () => {
    if (photos.length >= MAX_IMAGES) {
      Alert.alert(
        "Maximum images reached",
        `You can attach up to ${MAX_IMAGES} images.`,
      );
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow access to your photos to attach an image.",
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

      const validPhotos: FoundPhoto[] = [];

      for (const asset of result.assets) {
        if (!asset.uri) {
          continue;
        }

        if (asset.fileSize !== undefined && asset.fileSize > MAX_IMAGE_SIZE) {
          Alert.alert("Image too large", "Each image must be 5 MB or smaller.");
          continue;
        }

        validPhotos.push({
          uri: asset.uri,
          name: asset.fileName || `found-item-${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        });
      }

      setPhotos((previous) =>
        [...previous, ...validPhotos].slice(0, MAX_IMAGES),
      );
    } catch {
      Alert.alert("Photo error", "Could not open the photo library.");
    }
  }, [photos]);

  /* =======================================================
     TAKE PHOTO
  ======================================================= */

  const takePhoto = useCallback(async () => {
    if (photos.length >= MAX_IMAGES) {
      Alert.alert(
        "Maximum images reached",
        `You can attach up to ${MAX_IMAGES} images.`,
      );
      return;
    }

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera permission required",
          "Allow camera access to take a picture of the found item.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];

      if (asset.fileSize !== undefined && asset.fileSize > MAX_IMAGE_SIZE) {
        Alert.alert("Image too large", "The image must be 5 MB or smaller.");
        return;
      }

      setPhotos((previous) =>
        [
          ...previous,
          {
            uri: asset.uri,
            name: asset.fileName || `found-camera-${Date.now()}.jpg`,
            type: asset.mimeType || "image/jpeg",
          },
        ].slice(0, MAX_IMAGES),
      );
    } catch {
      Alert.alert("Camera error", "Unable to take a picture.");
    }
  }, [photos]);

  /* =======================================================
     REMOVE PHOTO
  ======================================================= */

  const removePhoto = useCallback((index: number) => {
    setPhotos((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index),
    );
  }, []);

  /* =======================================================
     VALIDATE FORM
  ======================================================= */

  const validate = useCallback(() => {
    const validationErrors = validateForm(form);

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }, [form]);

  /* =======================================================
     SUBMIT REPORT
  ======================================================= */

  const submitReport = useCallback(async () => {
    if (!token) {
      Alert.alert(
        "Login required",
        "You must log in before submitting a found item.",
      );
      return;
    }

    if (!validate()) {
      Alert.alert(
        "Incomplete information",
        "Please check the required fields.",
      );
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("type", "FOUND");
      formData.append("category", form.category);
      formData.append("location", form.location.trim());
      formData.append("dateLostOrFound", form.dateFound.trim());

      if (form.color.trim()) {
        formData.append("color", form.color.trim());
      }

      if (form.brand.trim()) {
        formData.append("brand", form.brand.trim());
      }

      if (form.identifyingFeatures.trim()) {
        formData.append("identifyingFeatures", form.identifyingFeatures.trim());
      }

      photos.forEach((photo, index) => {
        formData.append("images", {
          uri: photo.uri,
          name: photo.name || `found-${index}.jpg`,
          type: photo.type,
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
        throw new Error(await getErrorMessage(response));
      }

      Alert.alert(
        "Found item reported",
        "Thank you for helping the campus community. Your found item report has been submitted.",
        [
          {
            text: "View my reports",
            onPress: () => navigation.navigate("MyItems"),
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

      Alert.alert("Report submission failed", message);
    } finally {
      setSubmitting(false);
    }
  }, [token, form, photos, validate, navigation]);

  /* =======================================================
     CANCEL
  ======================================================= */

  const cancelReport = useCallback(() => {
    const hasChanges =
      Object.values(form).some((value) => value.trim()) || photos.length > 0;

    if (!hasChanges) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      "Discard this report?",
      "Your entered information and selected photos will be lost.",
      [
        {
          text: "Keep editing",
          style: "cancel",
        },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }, [form, photos, navigation]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}

      <View style={styles.header}>
        <Pressable onPress={cancelReport} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Report Found Item</Text>

          <Text style={styles.headerSubtitle}>
            Help someone find their belongings
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>🎒</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Introduction */}

          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Text style={styles.introIconText}>🤝</Text>
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introTitle}>You can make a difference</Text>

              <Text style={styles.introDescription}>
                Report the item and where you found it. University security or
                authorized staff can help coordinate its safe return.
              </Text>
            </View>
          </View>

          {/* General error */}

          {errors.general && (
            <View style={styles.generalError}>
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          )}

          {/* Item name */}

          <Field
            label="Item name"
            value={form.title}
            placeholder="Example: Blue student ID card"
            onChangeText={(value) => updateField("title", value)}
            error={errors.title}
            required
          />

          {/* Category */}

          <View style={styles.field}>
            <Text style={styles.label}>
              Category
              <Text style={styles.required}> *</Text>
            </Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((itemCategory) => {
                const selected = form.category === itemCategory;

                return (
                  <Pressable
                    key={itemCategory}
                    onPress={() => updateField("category", itemCategory)}
                    style={[
                      styles.categoryButton,
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

          <Field
            label="Description"
            value={form.description}
            placeholder="Describe the item you found, including its appearance and condition..."
            onChangeText={(value) => updateField("description", value)}
            error={errors.description}
            multiline
            required
          />

          {/* Location */}

          <Field
            label="Where did you find it?"
            value={form.location}
            placeholder="Example: Main library entrance"
            onChangeText={(value) => updateField("location", value)}
            error={errors.location}
            required
          />

          {/* Date */}

          <Field
            label="Date found"
            value={form.dateFound}
            placeholder="YYYY-MM-DD"
            onChangeText={(value) => updateField("dateFound", value)}
            error={errors.dateFound}
            required
          />

          {/* Additional information */}

          <Text style={styles.sectionTitle}>Additional information</Text>

          <Field
            label="Color"
            value={form.color}
            placeholder="Example: Blue"
            onChangeText={(value) => updateField("color", value)}
          />

          <Field
            label="Brand"
            value={form.brand}
            placeholder="Example: HP, Samsung, Adidas"
            onChangeText={(value) => updateField("brand", value)}
          />

          <Field
            label="Identifying features"
            value={form.identifyingFeatures}
            placeholder="Unique marks, stickers, labels or other details..."
            onChangeText={(value) => updateField("identifyingFeatures", value)}
            multiline
          />

          {/* Photos */}

          <View style={styles.field}>
            <Text style={styles.label}>Photos of the found item</Text>

            <Text style={styles.hint}>
              Attach up to {MAX_IMAGES} images to help the owner recognize the
              item.
            </Text>

            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View
                  key={`${photo.uri}-${index}`}
                  style={styles.photoContainer}
                >
                  <Image source={{ uri: photo.uri }} style={styles.photo} />

                  <Pressable
                    onPress={() => removePhoto(index)}
                    style={styles.removePhoto}
                  >
                    <Text style={styles.removePhotoText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            {photos.length < MAX_IMAGES && (
              <View style={styles.photoActions}>
                <Pressable
                  onPress={pickPhotos}
                  style={styles.photoActionButton}
                >
                  <Text style={styles.photoActionIcon}>🖼️</Text>

                  <Text style={styles.photoActionText}>Gallery</Text>
                </Pressable>

                <Pressable onPress={takePhoto} style={styles.photoActionButton}>
                  <Text style={styles.photoActionIcon}>📷</Text>

                  <Text style={styles.photoActionText}>Camera</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Safety note */}

          <View style={styles.safetyCard}>
            <Text style={styles.safetyTitle}>Campus safety reminder</Text>

            <Text style={styles.safetyText}>
              Do not publish private information found on documents, identity
              cards, or electronic devices. If an item appears valuable or
              sensitive, follow your university's security handover procedure.
            </Text>
          </View>

          {/* Submit */}

          <Pressable
            onPress={submitReport}
            disabled={submitting}
            style={[styles.submitButton, submitting && styles.submitDisabled]}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitText}>Submit Found Item Report</Text>
            )}
          </Pressable>

          <Pressable
            onPress={cancelReport}
            disabled={submitting}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>

          <Text style={styles.footer}>
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

  keyboard: {
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

  backText: {
    fontSize: 30,
    lineHeight: 34,
    color: COLORS.text,
  },

  headerContent: {
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
    width: 41,
    height: 41,
    borderRadius: 13,
    backgroundColor: COLORS.successLight,
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

  introCard: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    padding: 15,
    borderRadius: 14,
    backgroundColor: COLORS.successLight,
    marginBottom: 22,
  },

  introIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 11,
  },

  introIconText: {
    fontSize: 19,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontSize: 12,
    fontWeight: "900" as const,
    color: "#166534",
  },

  introDescription: {
    fontSize: 10,
    lineHeight: 17,
    color: "#166534",
    marginTop: 5,
  },

  generalError: {
    padding: 13,
    backgroundColor: COLORS.dangerLight,
    borderRadius: 11,
    marginBottom: 17,
  },

  generalErrorText: {
    fontSize: 11,
    color: COLORS.danger,
    lineHeight: 17,
  },

  field: {
    marginBottom: 21,
  },

  label: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: COLORS.text,
    marginBottom: 9,
  },

  required: {
    color: COLORS.danger,
  },

  input: {
    minHeight: 49,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    fontSize: 12,
    color: COLORS.text,
  },

  multiline: {
    minHeight: 110,
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

  categoryButton: {
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

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900" as const,
    color: COLORS.text,
    marginTop: 7,
    marginBottom: 17,
  },

  hint: {
    fontSize: 10,
    color: COLORS.secondary,
    lineHeight: 16,
    marginBottom: 12,
  },

  photoGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
    marginBottom: 12,
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

  removePhoto: {
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
    fontSize: 19,
    lineHeight: 22,
    color: COLORS.white,
    fontWeight: "900" as const,
  },

  photoActions: {
    flexDirection: "row" as const,
    gap: 10,
  },

  photoActionButton: {
    flex: 1,
    minHeight: 75,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed" as const,
    borderColor: COLORS.primary,
    backgroundColor: "#EFF6FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  photoActionIcon: {
    fontSize: 20,
  },

  photoActionText: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: COLORS.primary,
    marginTop: 5,
  },

  safetyCard: {
    padding: 15,
    backgroundColor: "#FFFBEB",
    borderRadius: 13,
    marginBottom: 20,
  },

  safetyTitle: {
    fontSize: 12,
    fontWeight: "900" as const,
    color: "#92400E",
    marginBottom: 6,
  },

  safetyText: {
    fontSize: 10,
    lineHeight: 17,
    color: "#92400E",
  },

  submitButton: {
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 11,
  },

  submitDisabled: {
    opacity: 0.65,
  },

  submitText: {
    fontSize: 12,
    fontWeight: "900" as const,
    color: COLORS.white,
  },

  cancelButton: {
    minHeight: 48,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  cancelText: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: COLORS.secondary,
  },

  footer: {
    textAlign: "center" as const,
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 23,
  },
};

export default ReportFoundScreen;
