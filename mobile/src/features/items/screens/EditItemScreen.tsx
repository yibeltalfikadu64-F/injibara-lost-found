// mobile/src/features/items/screens/EditItemScreen.tsx

import React, { useCallback, useEffect, useState } from "react";

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

import { useNavigation, useRoute } from "@react-navigation/native";

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
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  success: "#16A34A",
  gray: "#F1F5F9",
};

/* =========================================================
   TYPES
========================================================= */

interface EditableItem {
  id: string;
  title: string;
  description: string;
  type: "LOST" | "FOUND";
  status: string;
  category?: string;
  location?: string;
  dateLostOrFound?: string;
  color?: string;
  brand?: string;
  identifyingFeatures?: string;
  imageUrls?: string[];
  ownerId?: string;
  reporterId?: string;
}

interface EditRouteParams {
  itemId?: string;
  item?: EditableItem;
}

interface EditForm {
  title: string;
  description: string;
  category: string;
  location: string;
  dateLostOrFound: string;
  color: string;
  brand: string;
  identifyingFeatures: string;
}

interface EditErrors {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  dateLostOrFound?: string;
  general?: string;
}

interface NewPhoto {
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
   HELPERS
========================================================= */

function createInitialForm(item: EditableItem): EditForm {
  return {
    title: item.title || "",
    description: item.description || "",
    category: item.category || "",
    location: item.location || "",
    dateLostOrFound: item.dateLostOrFound || "",
    color: item.color || "",
    brand: item.brand || "",
    identifyingFeatures: item.identifyingFeatures || "",
  };
}

function validateForm(form: EditForm): EditErrors {
  const errors: EditErrors = {};

  if (form.title.trim().length < 3) {
    errors.title = "Enter a title with at least 3 characters.";
  }

  if (form.description.trim().length < 10) {
    errors.description = "Enter a description with at least 10 characters.";
  }

  if (!form.category) {
    errors.category = "Select a category.";
  }

  if (!form.location.trim()) {
    errors.location = "Enter the item location.";
  }

  if (
    !form.dateLostOrFound.trim() ||
    Number.isNaN(new Date(form.dateLostOrFound).getTime())
  ) {
    errors.dateLostOrFound = "Enter a valid date.";
  }

  return errors;
}

async function getApiError(response: Response): Promise<string> {
  try {
    const body = await response.json();

    return body.message || body.error || "Unable to update this item.";
  } catch {
    return "Unable to update this item.";
  }
}

/* =========================================================
   REUSABLE FIELD
========================================================= */

interface EditFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  error?: string;
  multiline?: boolean;
}

const EditField: React.FC<EditFieldProps> = ({
  label,
  value,
  placeholder,
  onChangeText,
  error,
  multiline = false,
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>

    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      multiline={multiline}
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

const EditItemScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const route = useRoute<any>();

  const params = (route.params || {}) as EditRouteParams;

  const itemId = params.itemId || params.item?.id;

  const token = useAuthStore((state) => state.accessToken);

  const currentUser = useAuthStore((state) => state.user);

  const [item, setItem] = useState<EditableItem | null>(params.item || null);

  const [form, setForm] = useState<EditForm | null>(
    params.item ? createInitialForm(params.item) : null,
  );

  const [existingImages, setExistingImages] = useState<string[]>(
    params.item?.imageUrls || [],
  );

  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);

  const [loading, setLoading] = useState(!params.item);

  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<EditErrors>({});

  /* =======================================================
     LOAD ITEM IF NOT PROVIDED
  ======================================================= */

  const loadItem = useCallback(async () => {
    if (!itemId) {
      setErrors({
        general: "No item ID was provided.",
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/items/${encodeURIComponent(itemId)}`,
        {
          headers: {
            Accept: "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        },
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const result = await response.json();

      const loadedItem: EditableItem =
        result.data?.item || result.item || result.data || result;

      setItem(loadedItem);

      setForm(createInitialForm(loadedItem));

      setExistingImages(
        Array.isArray(loadedItem.imageUrls) ? loadedItem.imageUrls : [],
      );
    } catch (requestError) {
      setErrors({
        general:
          requestError instanceof Error
            ? requestError.message
            : "Unable to load the item.",
      });
    } finally {
      setLoading(false);
    }
  }, [itemId, token]);

  useEffect(() => {
    if (!item) {
      loadItem();
    }
  }, [item, loadItem]);

  /* =======================================================
     CHECK OWNERSHIP
  ======================================================= */

  const isOwner =
    Boolean(currentUser?.id) &&
    (item?.ownerId === currentUser?.id || item?.reporterId === currentUser?.id);

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  const updateField = useCallback(
    <K extends keyof EditForm>(field: K, value: EditForm[K]) => {
      setForm((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          [field]: value,
        };
      });

      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
        general: undefined,
      }));
    },
    [],
  );

  /* =======================================================
     PICK NEW IMAGES
  ======================================================= */

  const pickImages = useCallback(async () => {
    const totalImages = existingImages.length + newPhotos.length;

    if (totalImages >= MAX_IMAGES) {
      Alert.alert(
        "Image limit reached",
        `You can have a maximum of ${MAX_IMAGES} images.`,
      );
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Allow access to your photos to add item images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        selectionLimit: MAX_IMAGES - totalImages,
      });

      if (result.canceled) {
        return;
      }

      const selected: NewPhoto[] = [];

      for (const asset of result.assets) {
        if (!asset.uri) {
          continue;
        }

        if (asset.fileSize !== undefined && asset.fileSize > MAX_IMAGE_SIZE) {
          Alert.alert("Image too large", "Each image must be 5 MB or smaller.");
          continue;
        }

        selected.push({
          uri: asset.uri,
          name: asset.fileName || `updated-item-${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        });
      }

      setNewPhotos((previous) =>
        [...previous, ...selected].slice(0, MAX_IMAGES - existingImages.length),
      );
    } catch {
      Alert.alert(
        "Image selection failed",
        "Please try selecting your image again.",
      );
    }
  }, [existingImages, newPhotos]);

  /* =======================================================
     REMOVE EXISTING IMAGE
  ======================================================= */

  const removeExistingImage = useCallback((imageUrl: string) => {
    setExistingImages((previous) =>
      previous.filter((image) => image !== imageUrl),
    );

    setRemovedImages((previous) =>
      previous.includes(imageUrl) ? previous : [...previous, imageUrl],
    );
  }, []);

  /* =======================================================
     REMOVE NEW IMAGE
  ======================================================= */

  const removeNewPhoto = useCallback((index: number) => {
    setNewPhotos((previous) =>
      previous.filter((_, photoIndex) => photoIndex !== index),
    );
  }, []);

  /* =======================================================
     VALIDATE
  ======================================================= */

  const validate = useCallback(() => {
    if (!form) {
      return false;
    }

    const nextErrors = validateForm(form);

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }, [form]);

  /* =======================================================
     SAVE CHANGES
  ======================================================= */

  const saveChanges = useCallback(async () => {
    if (!item || !form) {
      return;
    }

    if (!token) {
      Alert.alert("Login required", "Please log in before editing a report.");
      return;
    }

    if (!isOwner) {
      Alert.alert(
        "Permission denied",
        "Only the person who submitted this report can edit it.",
      );
      return;
    }

    if (!validate()) {
      Alert.alert(
        "Invalid information",
        "Please correct the highlighted fields.",
      );
      return;
    }

    setSaving(true);

    setErrors({});

    try {
      const formData = new FormData();

      formData.append("title", form.title.trim());

      formData.append("description", form.description.trim());

      formData.append("category", form.category);

      formData.append("location", form.location.trim());

      formData.append("dateLostOrFound", form.dateLostOrFound.trim());

      formData.append("color", form.color.trim());

      formData.append("brand", form.brand.trim());

      formData.append("identifyingFeatures", form.identifyingFeatures.trim());

      /**
       * Backend must support this field to preserve
       * only the remaining images.
       */
      formData.append("remainingImageUrls", JSON.stringify(existingImages));

      formData.append("removedImageUrls", JSON.stringify(removedImages));

      newPhotos.forEach((photo, index) => {
        formData.append("images", {
          uri: photo.uri,
          name: photo.name || `updated-${index}.jpg`,
          type: photo.type,
        } as any);
      });

      const response = await fetch(
        `${API_BASE_URL}/items/${encodeURIComponent(item.id)}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const result = await response.json();

      Alert.alert(
        "Changes saved",
        "Your item report has been updated successfully.",
        [
          {
            text: "Done",
            onPress: () => {
              navigation.navigate("ItemDetails", {
                itemId: item.id,
                item: result.data?.item || result.item || undefined,
              });
            },
          },
        ],
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to save your changes.";

      setErrors({
        general: message,
      });

      Alert.alert("Update failed", message);
    } finally {
      setSaving(false);
    }
  }, [
    item,
    form,
    token,
    isOwner,
    validate,
    existingImages,
    removedImages,
    newPhotos,
    navigation,
  ]);

  /* =======================================================
     CANCEL EDITING
  ======================================================= */

  const cancelEditing = useCallback(() => {
    Alert.alert("Discard changes?", "Any changes you made will not be saved.", [
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
  }, [navigation]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={COLORS.primary} />

        <Text style={styles.stateText}>Loading report...</Text>
      </View>
    );
  }

  /* =======================================================
     ERROR OR MISSING ITEM
  ======================================================= */

  if (!item || !form) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateIcon}>⚠️</Text>

        <Text style={styles.stateTitle}>Cannot edit this item</Text>

        <Text style={styles.stateText}>
          {errors.general || "Item information is unavailable."}
        </Text>

        <Pressable onPress={loadItem} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  /* =======================================================
     ACCESS DENIED
  ======================================================= */

  if (!isOwner) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.stateIcon}>🔒</Text>

        <Text style={styles.stateTitle}>Editing not allowed</Text>

        <Text style={styles.stateText}>
          Only the report owner can edit this item.
        </Text>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}

      <View style={styles.header}>
        <Pressable onPress={cancelEditing} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Edit Item Report</Text>

          <Text style={styles.headerSubtitle}>
            Update your {item.type.toLowerCase()} item
          </Text>
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
          {/* General error */}

          {errors.general && (
            <View style={styles.generalError}>
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          )}

          {/* Item type */}

          <View style={styles.readOnlyCard}>
            <Text style={styles.readOnlyLabel}>Report type</Text>

            <Text style={styles.readOnlyValue}>
              {item.type === "LOST" ? "Lost item report" : "Found item report"}
            </Text>
          </View>

          {/* Title */}

          <EditField
            label="Item name"
            value={form.title}
            placeholder="Enter item name"
            onChangeText={(value) => updateField("title", value)}
            error={errors.title}
          />

          {/* Category */}

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => {
                const selected = form.category === category;

                return (
                  <Pressable
                    key={category}
                    onPress={() => updateField("category", category)}
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
                      {category}
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

          <EditField
            label="Description"
            value={form.description}
            placeholder="Describe the item..."
            onChangeText={(value) => updateField("description", value)}
            error={errors.description}
            multiline
          />

          {/* Location */}

          <EditField
            label="Location"
            value={form.location}
            placeholder="Enter campus location"
            onChangeText={(value) => updateField("location", value)}
            error={errors.location}
          />

          {/* Date */}

          <EditField
            label={item.type === "LOST" ? "Date lost" : "Date found"}
            value={form.dateLostOrFound}
            placeholder="YYYY-MM-DD"
            onChangeText={(value) => updateField("dateLostOrFound", value)}
            error={errors.dateLostOrFound}
          />

          {/* Extra details */}

          <Text style={styles.sectionTitle}>Additional details</Text>

          <EditField
            label="Color"
            value={form.color}
            placeholder="Item color"
            onChangeText={(value) => updateField("color", value)}
          />

          <EditField
            label="Brand"
            value={form.brand}
            placeholder="Item brand"
            onChangeText={(value) => updateField("brand", value)}
          />

          <EditField
            label="Identifying features"
            value={form.identifyingFeatures}
            placeholder="Unique identifying details..."
            onChangeText={(value) => updateField("identifyingFeatures", value)}
            multiline
          />

          {/* Existing images */}

          <View style={styles.field}>
            <Text style={styles.label}>Current images</Text>

            {existingImages.length === 0 ? (
              <Text style={styles.noImagesText}>No current images.</Text>
            ) : (
              <View style={styles.imageGrid}>
                {existingImages.map((imageUrl) => (
                  <View key={imageUrl} style={styles.imageContainer}>
                    <Image source={{ uri: imageUrl }} style={styles.image} />

                    <Pressable
                      onPress={() => removeExistingImage(imageUrl)}
                      style={styles.removeImageButton}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* New images */}

          <View style={styles.field}>
            <Text style={styles.label}>Add new images</Text>

            <View style={styles.imageGrid}>
              {newPhotos.map((photo, index) => (
                <View
                  key={`${photo.uri}-${index}`}
                  style={styles.imageContainer}
                >
                  <Image source={{ uri: photo.uri }} style={styles.image} />

                  <Pressable
                    onPress={() => removeNewPhoto(index)}
                    style={styles.removeImageButton}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>

            {existingImages.length + newPhotos.length < MAX_IMAGES && (
              <Pressable onPress={pickImages} style={styles.addImageButton}>
                <Text style={styles.addImageIcon}>+</Text>

                <Text style={styles.addImageText}>Choose images</Text>
              </Pressable>
            )}
          </View>

          {/* Save */}

          <Pressable
            onPress={saveChanges}
            disabled={saving}
            style={[styles.saveButton, saving && styles.disabledButton]}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </Pressable>

          <Pressable
            onPress={cancelEditing}
            disabled={saving}
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
    padding: 16,
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
    marginLeft: 12,
    flex: 1,
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

  scrollContent: {
    padding: 19,
    paddingBottom: 45,
  },

  generalError: {
    backgroundColor: COLORS.dangerLight,
    padding: 13,
    borderRadius: 11,
    marginBottom: 17,
  },

  generalErrorText: {
    color: COLORS.danger,
    fontSize: 11,
    lineHeight: 17,
  },

  readOnlyCard: {
    padding: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    marginBottom: 21,
  },

  readOnlyLabel: {
    fontSize: 10,
    color: COLORS.secondary,
  },

  readOnlyValue: {
    fontSize: 13,
    fontWeight: "800" as const,
    color: COLORS.primary,
    marginTop: 5,
  },

  field: {
    marginBottom: 20,
  },

  label: {
    fontSize: 12,
    fontWeight: "800" as const,
    color: COLORS.text,
    marginBottom: 9,
  },

  input: {
    minHeight: 49,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    fontSize: 12,
    color: COLORS.text,
  },

  multilineInput: {
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

  categoryOption: {
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },

  categorySelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  categoryText: {
    fontSize: 10,
    color: COLORS.secondary,
    fontWeight: "700" as const,
  },

  categorySelectedText: {
    color: COLORS.white,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900" as const,
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 17,
  },

  noImagesText: {
    fontSize: 11,
    color: COLORS.secondary,
    paddingVertical: 12,
  },

  imageGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
  },

  imageContainer: {
    width: 95,
    height: 95,
    borderRadius: 12,
    overflow: "hidden" as const,
    position: "relative" as const,
  },

  image: {
    width: "100%" as const,
    height: "100%" as const,
  },

  removeImageButton: {
    position: "absolute" as const,
    right: 5,
    top: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  removeImageText: {
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "900" as const,
    color: COLORS.white,
  },

  addImageButton: {
    minHeight: 75,
    marginTop: 11,
    borderWidth: 1,
    borderStyle: "dashed" as const,
    borderColor: COLORS.primary,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  addImageIcon: {
    fontSize: 25,
    color: COLORS.primary,
  },

  addImageText: {
    fontSize: 10,
    fontWeight: "800" as const,
    color: COLORS.primary,
    marginTop: 3,
  },

  saveButton: {
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 10,
    marginBottom: 11,
  },

  disabledButton: {
    opacity: 0.65,
  },

  saveButtonText: {
    fontSize: 12,
    fontWeight: "900" as const,
    color: COLORS.white,
  },

  cancelButton: {
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
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
    marginTop: 22,
  },

  centerState: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 30,
    backgroundColor: COLORS.background,
  },

  stateIcon: {
    fontSize: 42,
    marginBottom: 13,
  },

  stateTitle: {
    fontSize: 17,
    fontWeight: "900" as const,
    color: COLORS.text,
  },

  stateText: {
    fontSize: 11,
    color: COLORS.secondary,
    lineHeight: 18,
    textAlign: "center" as const,
    marginTop: 9,
    marginBottom: 17,
  },

  retryButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    marginBottom: 10,
  },

  retryText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800" as const,
  },
};

export default EditItemScreen;
