import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';

export interface SelectedImage {
  uri: string;
  name?: string;
  mimeType?: string | null;
  fileSize?: number;
  width?: number;
  height?: number;
}

interface ImagePickerFieldProps {
  label?: string;

  value: string | null;

  onChange: (
    uri: string | null,
    image?: SelectedImage,
  ) => void;

  error?: string;
  helperText?: string;

  required?: boolean;
  disabled?: boolean;

  allowCamera?: boolean;
  allowGallery?: boolean;
  allowsEditing?: boolean;

  quality?: number;
  aspect?: [number, number];

  containerStyle?: StyleProp<ViewStyle>;

  onError?: (message: string) => void;
}

const COLORS = {
  primary: '#2563EB',
  primaryLight: '#EEF4FF',
  text: '#172033',
  secondary: '#718096',
  border: '#DCE3ED',
  background: '#FFFFFF',
  error: '#DC2626',
  dangerBackground: '#FEE2E2',
  mutedBackground: '#F8FAFC',
};

const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  label = 'Item Photograph',
  value,
  onChange,
  error,
  helperText = 'Add a clear photograph of the lost or found item.',
  required = false,
  disabled = false,
  allowCamera = true,
  allowGallery = true,
  allowsEditing = true,
  quality = 0.8,
  aspect = [4, 3],
  containerStyle,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const reportError = (message: string) => {
    onError?.(message);

    Alert.alert(
      'Image selection',
      message,
    );
  };

  const handleImageResult = (
    result: ImagePicker.ImagePickerResult,
  ) => {
    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];

    if (!asset) {
      reportError('Unable to read the selected image.');
      return;
    }

    const selectedImage: SelectedImage = {
      uri: asset.uri,
      name: asset.fileName || undefined,
      mimeType: asset.mimeType,
      fileSize: asset.fileSize,
      width: asset.width,
      height: asset.height,
    };

    onChange(asset.uri, selectedImage);
  };

  const pickFromGallery = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        reportError(
          'Please allow access to your photos so you can select an item image.',
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing,
          aspect: allowsEditing ? aspect : undefined,
          quality,
          selectionLimit: 1,
        });

      handleImageResult(result);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not open the photo gallery.';

      reportError(message);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        reportError(
          'Please allow camera access to take a photograph.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing,
        aspect: allowsEditing ? aspect : undefined,
        quality,
      });

      handleImageResult(result);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not open the camera.';

      reportError(message);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    if (disabled || loading) return;

    Alert.alert(
      'Remove photograph',
      'Are you sure you want to remove this photograph?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onChange(null),
        },
      ],
    );
  };

  const openImageOptions = () => {
    if (disabled || loading) return;

    if (allowCamera && allowGallery) {
      Alert.alert(
        'Add item photograph',
        'Choose how you want to add your photograph.',
        [
          {
            text: 'Take a photo',
            onPress: takePhoto,
          },
          {
            text: 'Choose from gallery',
            onPress: pickFromGallery,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
      );

      return;
    }

    if (allowCamera) {
      void takePhoto();
      return;
    }

    if (allowGallery) {
      void pickFromGallery();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>

        {required ? (
          <Text style={styles.required}>*</Text>
        ) : null}

        <Text style={styles.optionalText}>
          {required ? 'Required' : 'Optional'}
        </Text>
      </View>

      {value ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: value }}
            style={styles.previewImage}
            resizeMode="cover"
            accessibilityLabel="Selected item photograph"
          />

          <View style={styles.imageOverlay}>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>
                Image selected
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove selected photograph"
              disabled={disabled || loading}
              onPress={removeImage}
              style={styles.removeButton}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={disabled || loading}
            onPress={openImageOptions}
            style={styles.changeImageButton}
          >
            <Text style={styles.changeImageText}>
              Change photograph
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add item photograph"
          accessibilityState={{
            disabled: disabled || loading,
            busy: loading,
          }}
          disabled={disabled || loading}
          onPress={openImageOptions}
          style={({ pressed }) => [
            styles.uploadContainer,
            error && styles.errorBorder,
            disabled && styles.disabledContainer,
            pressed && !disabled && styles.pressed,
          ]}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />

              <Text style={styles.loadingText}>
                Preparing photograph...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.uploadIconContainer}>
                <Text style={styles.uploadIcon}>＋</Text>
              </View>

              <Text style={styles.uploadTitle}>
                Add item photograph
              </Text>

              <Text style={styles.uploadDescription}>
                Take a photo or select one from your gallery.
              </Text>

              <View style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>
                  Choose image
                </Text>
              </View>

              <Text style={styles.supportedFormats}>
                Select an image from your device.
              </Text>
            </>
          )}
        </Pressable>
      )}

      {error ? (
        <Text
          accessibilityRole="alert"
          style={styles.errorText}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helperText}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 9,
  },

  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  required: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '800',
  },

  optionalText: {
    color: COLORS.secondary,
    fontSize: 10,
    marginLeft: 'auto',
  },

  uploadContainer: {
    minHeight: 205,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#AFC5ED',
    borderRadius: 16,
    backgroundColor: '#F8FAFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  errorBorder: {
    borderColor: COLORS.error,
  },

  disabledContainer: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.8,
  },

  uploadIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  uploadIcon: {
    color: COLORS.primary,
    fontSize: 30,
    fontWeight: '400',
  },

  uploadTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },

  uploadDescription: {
    color: COLORS.secondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },

  uploadButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 14,
  },

  uploadButtonText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: '800',
  },

  supportedFormats: {
    color: COLORS.secondary,
    fontSize: 10,
    marginTop: 11,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  loadingText: {
    color: COLORS.secondary,
    fontSize: 12,
  },

  previewContainer: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: COLORS.mutedBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  previewImage: {
    width: '100%',
    height: 220,
  },

  imageOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  previewBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.95)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },

  previewBadgeText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '800',
  },

  removeButton: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: COLORS.dangerBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeButtonText: {
    color: COLORS.error,
    fontSize: 23,
    lineHeight: 26,
    fontWeight: '700',
  },

  changeImageButton: {
    minHeight: 43,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
  },

  changeImageText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  helperText: {
    color: COLORS.secondary,
    fontSize: 11,
    marginTop: 7,
    lineHeight: 16,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 11,
    marginTop: 7,
  },
});

export default ImagePickerField;