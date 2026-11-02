// mobile/src/features/items/components/ItemForm.tsx

import React, { useCallback, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Image,
  KeyboardTypeOptions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

/* =========================================================
   TYPES
========================================================= */

export type ItemFormType = "LOST" | "FOUND";

export interface ItemFormData {
  title: string;
  description: string;
  type: ItemFormType;
  category: string;
  location: string;
  dateLostOrFound: string;
  color: string;
  brand: string;
  identifyingFeatures: string;
}

export interface ItemFormPhoto {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface ItemFormErrors {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  dateLostOrFound?: string;
  general?: string;
}

interface ItemFormProps {
  type: ItemFormType;
  initialValues?: Partial<ItemFormData>;
  initialPhotos?: ItemFormPhoto[];
  loading?: boolean;
  submitLabel?: string;
  showTypeSelector?: boolean;
  onSubmit: (
    values: ItemFormData,
    photos: ItemFormPhoto[],
  ) => void | Promise<void>;
  onCancel?: () => void;
  onTypeChange?: (type: ItemFormType) => void;
}

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  primary: "#2563EB",
  background: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  green: "#15803D",
  greenLight: "#DCFCE7",
  blueLight: "#EFF6FF",
  gray: "#F1F5F9",
};

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
   INITIAL VALUES
========================================================= */

function createInitialValues(
  type: ItemFormType,
  initialValues?: Partial<ItemFormData>,
): ItemFormData {
  return {
    title: "",
    description: "",
    type,
    category: "",
    location: "",
    dateLostOrFound: "",
    color: "",
    brand: "",
    identifyingFeatures: "",
    ...initialValues,
    type,
  };
}

/* =========================================================
   VALIDATION
========================================================= */

export function validateItemForm(values: ItemFormData): ItemFormErrors {
  const errors: ItemFormErrors = {};

  if (!values.title.trim()) {
    errors.title = "Item name is required.";
  } else if (values.title.trim().length < 3) {
    errors.title = "Item name must contain at least 3 characters.";
  } else if (values.title.trim().length > 100) {
    errors.title = "Item name cannot exceed 100 characters.";
  }

  if (!values.description.trim()) {
    errors.description = "Description is required.";
  } else if (values.description.trim().length < 10) {
    errors.description = "Description must contain at least 10 characters.";
  } else if (values.description.trim().length > 2000) {
    errors.description = "Description cannot exceed 2000 characters.";
  }

  if (!values.category) {
    errors.category = "Please select a category.";
  }

  if (!values.location.trim()) {
    errors.location = "Location is required.";
  }

  if (!values.dateLostOrFound.trim()) {
    errors.dateLostOrFound = "Date is required.";
  } else {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(values.dateLostOrFound)) {
      errors.dateLostOrFound = "Use YYYY-MM-DD format.";
    } else {
      const [year, month, day] = values.dateLostOrFound.split("-").map(Number);

      const date = new Date(year, month - 1, day);

      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        errors.dateLostOrFound = "Enter a valid calendar date.";
      }
    }
  }

  return errors;
}

/* =========================================================
   INPUT COMPONENT
========================================================= */

interface FormInputProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  error?: string;
  multiline?: boolean;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  placeholder,
  onChangeText,
  error,
  multiline = false,
  required = false,
  keyboardType = "default",
  maxLength,
}) => {
  return (
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
        keyboardType={keyboardType}
        maxLength={maxLength}
        textAlignVertical={multiline ? "top" : "center"}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError,
        ]}
      />

      <View style={styles.inputFooter}>
        {error ? <Text style={styles.errorText}>{error}</Text> : <View />}

        {maxLength && (
          <Text style={styles.characterCount}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
};

/* =========================================================
   CATEGORY SELECTOR
========================================================= */

interface CategorySelectorProps {
  value: string;
  error?: string;
  onSelect: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  error,
  onSelect,
}) => (
  <View style={styles.field}>
    <Text style={styles.label}>
      Category
      <Text style={styles.required}> *</Text>
    </Text>

    <View style={styles.categoryGrid}>
      {CATEGORIES.map((category) => {
        const selected = value === category;

        return (
          <Pressable
            key={category}
            onPress={() => onSelect(category)}
            style={[styles.categoryButton, selected && styles.categorySelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
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

    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

/* =========================================================
   PHOTO PICKER
========================================================= */

interface PhotoPickerProps {
  photos: ItemFormPhoto[];
  onChange: (photos: ItemFormPhoto[]) => void;
}

const PhotoPicker: React.FC<PhotoPickerProps> = ({ photos, onChange }) => {
  const [selecting, setSelecting] = useState(false);

  const remainingSlots = MAX_IMAGES - photos.length;

  const pickImages = useCallback(async () => {
    if (remainingSlots <= 0) {
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        return;
      }

      setSelecting(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        selectionLimit: remainingSlots,
      });

      if (result.canceled) {
        return;
      }

      const selectedPhotos: ItemFormPhoto[] = [];

      for (const asset of result.assets) {
        if (!asset.uri) {
          continue;
        }

        if (asset.fileSize !== undefined && asset.fileSize > MAX_IMAGE_SIZE) {
          continue;
        }

        selectedPhotos.push({
          uri: asset.uri,
          name: asset.fileName || `item-image-${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
          size: asset.fileSize,
        });
      }

      onChange([...photos, ...selectedPhotos].slice(0, MAX_IMAGES));
    } finally {
      setSelecting(false);
    }
  }, [remainingSlots, photos, onChange]);

  const takePhoto = useCallback(async () => {
    if (remainingSlots <= 0) {
      return;
    }

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        return;
      }

      setSelecting(true);

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
        return;
      }

      onChange([
        ...photos,
        {
          uri: asset.uri,
          name: asset.fileName || `item-camera-${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
          size: asset.fileSize,
        },
      ]);
    } finally {
      setSelecting(false);
    }
  }, [remainingSlots, photos, onChange]);

  const removePhoto = useCallback(
    (index: number) => {
      onChange(photos.filter((_, photoIndex) => photoIndex !== index));
    },
    [photos, onChange],
  );

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Item photos</Text>

      <Text style={styles.photoHint}>
        Upload clear photos that help identify the item. Maximum {MAX_IMAGES}{" "}
        images, 5 MB each.
      </Text>

      <View style={styles.photoGrid}>
        {photos.map((photo, index) => (
          <View key={`${photo.uri}-${index}`} style={styles.photoContainer}>
            <Image source={{ uri: photo.uri }} style={styles.photo} />

            <Pressable
              onPress={() => removePhoto(index)}
              style={styles.removePhotoButton}
              accessibilityLabel={`Remove photo ${index + 1}`}
            >
              <Text style={styles.removePhotoText}>×</Text>
            </Pressable>
          </View>
        ))}

        {remainingSlots > 0 && (
          <Pressable
            onPress={pickImages}
            disabled={selecting}
            style={styles.addPhotoButton}
          >
            {selecting ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Text style={styles.addPhotoIcon}>+</Text>

                <Text style={styles.addPhotoText}>Add photo</Text>
              </>
            )}
          </Pressable>
        )}
      </View>

      {remainingSlots > 0 && (
        <Pressable
          onPress={takePhoto}
          disabled={selecting}
          style={styles.cameraButton}
        >
          <Text style={styles.cameraButtonText}>📷 Take a photo</Text>
        </Pressable>
      )}
    </View>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ItemForm: React.FC<ItemFormProps> = ({
  type,
  initialValues,
  initialPhotos = [],
  loading = false,
  submitLabel,
  showTypeSelector = false,
  onSubmit,
  onCancel,
  onTypeChange,
}) => {
  const [values, setValues] = useState<ItemFormData>(() =>
    createInitialValues(type, initialValues),
  );

  const [photos, setPhotos] = useState<ItemFormPhoto[]>(initialPhotos);

  const [errors, setErrors] = useState<ItemFormErrors>({});

  const [formError, setFormError] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const currentType = values.type;

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  const updateField = useCallback(
    <K extends keyof ItemFormData>(field: K, value: ItemFormData[K]) => {
      setValues((previous) => ({
        ...previous,
        [field]: value,
      }));

      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
        general: undefined,
      }));

      setFormError("");
    },
    [],
  );

  /* =======================================================
     CHANGE TYPE
  ======================================================= */

  const changeType = useCallback(
    (nextType: ItemFormType) => {
      setValues((previous) => ({
        ...previous,
        type: nextType,
      }));

      onTypeChange?.(nextType);
    },
    [onTypeChange],
  );

  /* =======================================================
     UPDATE PHOTOS
  ======================================================= */

  const updatePhotos = useCallback((nextPhotos: ItemFormPhoto[]) => {
    setPhotos(nextPhotos);
  }, []);

  /* =======================================================
     FORM VALIDATION
  ======================================================= */

  const validate = useCallback(() => {
    const validationErrors = validateItemForm(values);

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }, [values]);

  /* =======================================================
     SUBMIT FORM
  ======================================================= */

  const handleSubmit = useCallback(async () => {
    if (submitting || loading) {
      return;
    }

    setFormError("");

    if (!validate()) {
      setFormError("Please review the required fields and correct the errors.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(values, photos);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to submit your item report.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [submitting, loading, validate, onSubmit, values, photos]);

  const buttonLabel = useMemo(
    () =>
      submitLabel ||
      (currentType === "LOST"
        ? "Submit Lost Item Report"
        : "Submit Found Item Report"),
    [submitLabel, currentType],
  );

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Introduction */}

      <View style={styles.introCard}>
        <Text style={styles.introIcon}>
          {currentType === "LOST" ? "🔎" : "🤝"}
        </Text>

        <View style={styles.introContent}>
          <Text style={styles.introTitle}>
            {currentType === "LOST"
              ? "Report a lost item"
              : "Report a found item"}
          </Text>

          <Text style={styles.introDescription}>
            {currentType === "LOST"
              ? "Tell the campus community what you lost so someone can help you find it."
              : "Share details about an item you found to help its owner recover it."}
          </Text>
        </View>
      </View>

      {/* Report type selector */}

      {showTypeSelector && (
        <View style={styles.field}>
          <Text style={styles.label}>Report type</Text>

          <View style={styles.typeSelector}>
            <Pressable
              onPress={() => changeType("LOST")}
              style={[
                styles.typeButton,
                currentType === "LOST" && styles.lostSelected,
              ]}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  currentType === "LOST" && styles.selectedTypeText,
                ]}
              >
                Lost Item
              </Text>
            </Pressable>

            <Pressable
              onPress={() => changeType("FOUND")}
              style={[
                styles.typeButton,
                currentType === "FOUND" && styles.foundSelected,
              ]}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  currentType === "FOUND" && styles.selectedTypeText,
                ]}
              >
                Found Item
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* General error */}

      {formError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{formError}</Text>
        </View>
      ) : null}

      {/* Item title */}

      <FormInput
        label="Item name"
        value={values.title}
        placeholder="Example: Black laptop bag"
        onChangeText={(value) => updateField("title", value)}
        error={errors.title}
        required
        maxLength={100}
      />

      {/* Category */}

      <CategorySelector
        value={values.category}
        error={errors.category}
        onSelect={(value) => updateField("category", value)}
      />

      {/* Description */}

      <FormInput
        label="Description"
        value={values.description}
        placeholder="Describe the item and its appearance..."
        onChangeText={(value) => updateField("description", value)}
        error={errors.description}
        required
        multiline
        maxLength={2000}
      />

      {/* Location */}

      <FormInput
        label={
          currentType === "LOST"
            ? "Where did you lose it?"
            : "Where did you find it?"
        }
        value={values.location}
        placeholder="Example: Main library, classroom 203..."
        onChangeText={(value) => updateField("location", value)}
        error={errors.location}
        required
      />

      {/* Date */}

      <FormInput
        label={currentType === "LOST" ? "Date lost" : "Date found"}
        value={values.dateLostOrFound}
        placeholder="YYYY-MM-DD"
        onChangeText={(value) => updateField("dateLostOrFound", value)}
        error={errors.dateLostOrFound}
        required
      />

      {/* Additional details */}

      <Text style={styles.sectionTitle}>Additional details</Text>

      <FormInput
        label="Color"
        value={values.color}
        placeholder="Example: Black"
        onChangeText={(value) => updateField("color", value)}
      />

      <FormInput
        label="Brand"
        value={values.brand}
        placeholder="Example: HP, Samsung, Nike"
        onChangeText={(value) => updateField("brand", value)}
      />

      <FormInput
        label="Identifying features"
        value={values.identifyingFeatures}
        placeholder="Unique marks, stickers, labels..."
        onChangeText={(value) => updateField("identifyingFeatures", value)}
        multiline
        maxLength={1000}
      />

      {/* Photos */}

      <PhotoPicker photos={photos} onChange={updatePhotos} />

      {/* Privacy information */}

      <View style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>Privacy and safety</Text>

        <Text style={styles.privacyText}>
          Do not include passwords, private identity numbers, or confidential
          personal information in your report. Your university may use the
          information to verify ownership and coordinate the return of items.
        </Text>
      </View>

      {/* Submit */}

      <Pressable
        onPress={handleSubmit}
        disabled={submitting || loading}
        style={[
          styles.submitButton,
          (submitting || loading) && styles.disabledButton,
        ]}
      >
        {submitting || loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.submitButtonText}>{buttonLabel}</Text>
        )}
      </Pressable>

      {/* Cancel */}

      {onCancel && (
        <Pressable
          onPress={onCancel}
          disabled={submitting}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      )}

      <Text style={styles.footer}>
        Injibara University · Campus Lost & Found
      </Text>
    </ScrollView>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 18,
    paddingBottom: 40,
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 14,
    backgroundColor: COLORS.blueLight,
    marginBottom: 23,
  },

  introIcon: {
    fontSize: 29,
    marginRight: 12,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
  },

  introDescription: {
    fontSize: 10,
    color: COLORS.secondary,
    lineHeight: 17,
    marginTop: 5,
  },

  field: {
    marginBottom: 21,
  },

  label: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 9,
  },

  required: {
    color: COLORS.danger,
  },

  input: {
    minHeight: 49,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    fontSize: 12,
  },

  multilineInput: {
    minHeight: 105,
    paddingTop: 13,
    paddingBottom: 13,
  },

  inputError: {
    borderColor: COLORS.danger,
  },

  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 10,
  },

  characterCount: {
    fontSize: 9,
    color: COLORS.secondary,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  categoryButton: {
    paddingHorizontal: 12,
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
    fontWeight: "700",
    color: COLORS.secondary,
  },

  categorySelectedText: {
    color: COLORS.white,
  },

  typeSelector: {
    flexDirection: "row",
    backgroundColor: COLORS.gray,
    padding: 5,
    borderRadius: 12,
    gap: 7,
  },

  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: "center",
  },

  lostSelected: {
    backgroundColor: COLORS.danger,
  },

  foundSelected: {
    backgroundColor: COLORS.green,
  },

  typeButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  selectedTypeText: {
    color: COLORS.white,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 5,
    marginBottom: 17,
  },

  photoHint: {
    fontSize: 10,
    color: COLORS.secondary,
    lineHeight: 16,
    marginBottom: 12,
  },

  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  photoContainer: {
    width: 88,
    height: 88,
    borderRadius: 11,
    overflow: "hidden",
    position: "relative",
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  removePhotoButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },

  removePhotoText: {
    color: COLORS.white,
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "900",
  },

  addPhotoButton: {
    width: 88,
    height: 88,
    borderRadius: 11,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    backgroundColor: COLORS.blueLight,
    alignItems: "center",
    justifyContent: "center",
  },

  addPhotoIcon: {
    fontSize: 26,
    color: COLORS.primary,
  },

  addPhotoText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: "800",
    marginTop: 3,
  },

  cameraButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.gray,
  },

  cameraButtonText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.text,
  },

  privacyCard: {
    padding: 14,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 19,
  },

  privacyTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#92400E",
    marginBottom: 6,
  },

  privacyText: {
    fontSize: 10,
    lineHeight: 17,
    color: "#92400E",
  },

  errorBanner: {
    backgroundColor: COLORS.dangerLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 18,
  },

  errorBannerText: {
    fontSize: 10,
    color: COLORS.danger,
    lineHeight: 16,
  },

  submitButton: {
    minHeight: 52,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  submitButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.white,
  },

  cancelButton: {
    minHeight: 47,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  cancelButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  footer: {
    textAlign: "center",
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 22,
  },
});

export default ItemForm;
