// mobile/src/utils/imageCompressor.ts

import * as ImageManipulator from "expo-image-manipulator";

// ============================================================
// TYPES
// ============================================================

export type ImageOutputFormat = "jpeg" | "png" | "webp";

export interface ImageCompressionOptions {
  quality?: number;

  maxWidth?: number;

  maxHeight?: number;

  format?: ImageOutputFormat;

  compress?: boolean;
}

export interface ImageCompressionResult {
  success: boolean;

  uri: string;

  width: number;

  height: number;

  format: ImageOutputFormat;

  error?: string;
}

export interface ImageFileInformation {
  uri: string;

  fileName: string;

  mimeType: string;

  extension: string;

  size?: number;
}

export interface ImageValidationResult {
  isValid: boolean;

  message: string;
}

export interface BatchCompressionResult {
  successful: ImageCompressionResult[];

  failed: {
    uri: string;

    error: string;
  }[];

  total: number;
}

// ============================================================
// DEFAULT CONFIGURATION
// ============================================================

export const DEFAULT_IMAGE_OPTIONS: Required<ImageCompressionOptions> = {
  quality: 0.75,

  maxWidth: 1280,

  maxHeight: 1280,

  format: "jpeg",

  compress: true,
};

// ============================================================
// IMAGE LIMITS
// ============================================================

export const IMAGE_LIMITS = {
  MAX_IMAGES_PER_ITEM: 5,

  MAX_IMAGE_SIZE_MB: 10,

  MAX_WIDTH: 4096,

  MAX_HEIGHT: 4096,

  MIN_WIDTH: 100,

  MIN_HEIGHT: 100,

  MAX_BATCH_SIZE: 10,
} as const;

// ============================================================
// IMAGE MIME TYPES
// ============================================================

export const IMAGE_MIME_TYPES: Record<ImageOutputFormat, string> = {
  jpeg: "image/jpeg",

  png: "image/png",

  webp: "image/webp",
};

// ============================================================
// FILE EXTENSIONS
// ============================================================

export const IMAGE_EXTENSIONS: Record<ImageOutputFormat, string> = {
  jpeg: "jpg",

  png: "png",

  webp: "webp",
};

// ============================================================
// GET EXPO OUTPUT FORMAT
// ============================================================

function getExpoOutputFormat(
  format: ImageOutputFormat,
): ImageManipulator.SaveFormat {
  switch (format) {
    case "png":
      return ImageManipulator.SaveFormat.PNG;

    case "webp":
      return ImageManipulator.SaveFormat.WEBP;

    case "jpeg":
    default:
      return ImageManipulator.SaveFormat.JPEG;
  }
}

// ============================================================
// NORMALIZE QUALITY
// ============================================================

function normalizeQuality(quality: number | undefined): number {
  if (quality === undefined || !Number.isFinite(quality)) {
    return DEFAULT_IMAGE_OPTIONS.quality;
  }

  return Math.min(1, Math.max(0.1, quality));
}

// ============================================================
// VALIDATE COMPRESSION OPTIONS
// ============================================================

export function validateCompressionOptions(
  options: ImageCompressionOptions,
): ImageValidationResult {
  if (
    options.quality !== undefined &&
    (!Number.isFinite(options.quality) ||
      options.quality < 0.1 ||
      options.quality > 1)
  ) {
    return {
      isValid: false,
      message: "Image quality must be between 0.1 and 1.",
    };
  }

  if (
    options.maxWidth !== undefined &&
    (!Number.isInteger(options.maxWidth) || options.maxWidth <= 0)
  ) {
    return {
      isValid: false,
      message: "Maximum width must be a positive integer.",
    };
  }

  if (
    options.maxHeight !== undefined &&
    (!Number.isInteger(options.maxHeight) || options.maxHeight <= 0)
  ) {
    return {
      isValid: false,
      message: "Maximum height must be a positive integer.",
    };
  }

  if (
    options.format !== undefined &&
    !["jpeg", "png", "webp"].includes(options.format)
  ) {
    return {
      isValid: false,
      message: "Unsupported image output format.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// GET FILE EXTENSION
// ============================================================

export function getImageExtension(uri: string): string {
  const cleanUri = uri.split("?")[0] ?? uri;

  const parts = cleanUri.split(".");

  return (parts[parts.length - 1] ?? "").toLowerCase();
}

// ============================================================
// DETECT IMAGE FORMAT
// ============================================================

export function detectImageFormat(uri: string): ImageOutputFormat {
  const extension = getImageExtension(uri);

  switch (extension) {
    case "png":
      return "png";

    case "webp":
      return "webp";

    case "jpg":
    case "jpeg":
    default:
      return "jpeg";
  }
}

// ============================================================
// GET IMAGE MIME TYPE
// ============================================================

export function getImageMimeType(format: ImageOutputFormat): string {
  return IMAGE_MIME_TYPES[format];
}

// ============================================================
// GENERATE IMAGE FILE NAME
// ============================================================

export function generateImageFileName(
  format: ImageOutputFormat = "jpeg",
): string {
  const timestamp = Date.now();

  const random = Math.random().toString(36).substring(2, 10);

  return `campus-item-${timestamp}-${random}.${IMAGE_EXTENSIONS[format]}`;
}

// ============================================================
// VALIDATE IMAGE URI
// ============================================================

export function validateImageUri(uri: string): ImageValidationResult {
  if (!uri || !uri.trim()) {
    return {
      isValid: false,
      message: "Image URI is required.",
    };
  }

  const validPrefixes = [
    "file://",
    "content://",
    "ph://",
    "assets-library://",
    "https://",
    "http://",
    "/",
  ];

  const isSupported = validPrefixes.some((prefix) => uri.startsWith(prefix));

  if (!isSupported) {
    return {
      isValid: false,
      message: "Unsupported image URI.",
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// VALIDATE IMAGE COUNT
// ============================================================

export function validateImageCount(
  count: number,
  maximum = IMAGE_LIMITS.MAX_IMAGES_PER_ITEM,
): ImageValidationResult {
  if (!Number.isInteger(count) || count < 0) {
    return {
      isValid: false,
      message: "Invalid image count.",
    };
  }

  if (count > maximum) {
    return {
      isValid: false,
      message: `You can upload a maximum of ${maximum} images.`,
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// VALIDATE IMAGE SIZE
// ============================================================

export function validateImageSize(
  sizeInBytes: number,
  maximumMB = IMAGE_LIMITS.MAX_IMAGE_SIZE_MB,
): ImageValidationResult {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes < 0) {
    return {
      isValid: false,
      message: "Invalid image size.",
    };
  }

  const maximumBytes = maximumMB * 1024 * 1024;

  if (sizeInBytes > maximumBytes) {
    return {
      isValid: false,
      message: `Image must be smaller than ${maximumMB} MB.`,
    };
  }

  return {
    isValid: true,
    message: "",
  };
}

// ============================================================
// FORMAT IMAGE SIZE
// ============================================================

export function formatImageSize(sizeInBytes: number): string {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes < 0) {
    return "Unknown size";
  }

  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ============================================================
// CALCULATE COMPRESSION SAVINGS
// ============================================================

export function calculateCompressionSavings(
  originalSize: number,
  compressedSize: number,
): {
  savedBytes: number;

  savedPercentage: number;

  originalSizeFormatted: string;

  compressedSizeFormatted: string;
} {
  if (
    originalSize <= 0 ||
    compressedSize < 0 ||
    !Number.isFinite(originalSize) ||
    !Number.isFinite(compressedSize)
  ) {
    return {
      savedBytes: 0,
      savedPercentage: 0,
      originalSizeFormatted: formatImageSize(0),
      compressedSizeFormatted: formatImageSize(0),
    };
  }

  const savedBytes = Math.max(0, originalSize - compressedSize);

  const savedPercentage = (savedBytes / originalSize) * 100;

  return {
    savedBytes,

    savedPercentage: Number(savedPercentage.toFixed(2)),

    originalSizeFormatted: formatImageSize(originalSize),

    compressedSizeFormatted: formatImageSize(compressedSize),
  };
}

// ============================================================
// CALCULATE RESIZED DIMENSIONS
// ============================================================

export function calculateResizedDimensions(
  width: number,
  height: number,
  maxWidth = DEFAULT_IMAGE_OPTIONS.maxWidth,
  maxHeight = DEFAULT_IMAGE_OPTIONS.maxHeight,
): {
  width: number;

  height: number;

  resized: boolean;
} {
  if (width <= 0 || height <= 0 || maxWidth <= 0 || maxHeight <= 0) {
    throw new Error("Invalid image dimensions.");
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

  const newWidth = Math.max(1, Math.round(width * ratio));

  const newHeight = Math.max(1, Math.round(height * ratio));

  return {
    width: newWidth,

    height: newHeight,

    resized: newWidth !== width || newHeight !== height,
  };
}

// ============================================================
// COMPRESS SINGLE IMAGE
// ============================================================

export async function compressImage(
  uri: string,
  options: ImageCompressionOptions = {},
): Promise<ImageCompressionResult> {
  const uriValidation = validateImageUri(uri);

  if (!uriValidation.isValid) {
    throw new Error(uriValidation.message);
  }

  const optionValidation = validateCompressionOptions(options);

  if (!optionValidation.isValid) {
    throw new Error(optionValidation.message);
  }

  const {
    quality = DEFAULT_IMAGE_OPTIONS.quality,
    maxWidth = DEFAULT_IMAGE_OPTIONS.maxWidth,
    maxHeight = DEFAULT_IMAGE_OPTIONS.maxHeight,
    format = DEFAULT_IMAGE_OPTIONS.format,
    compress = true,
  } = options;

  const actions: ImageManipulator.Action[] = [];

  if (compress) {
    actions.push({
      resize: {
        width: maxWidth,
        height: maxHeight,
      },
    });
  }

  try {
    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: normalizeQuality(quality),

      format: getExpoOutputFormat(format),
    });

    return {
      success: true,

      uri: result.uri,

      width: result.width,

      height: result.height,

      format,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to compress image.";

    throw new Error(message);
  }
}

// ============================================================
// COMPRESS IMAGE WITH SAFE RESULT
// ============================================================

export async function compressImageSafely(
  uri: string,
  options: ImageCompressionOptions = {},
): Promise<ImageCompressionResult> {
  try {
    return await compressImage(uri, options);
  } catch (error) {
    return {
      success: false,

      uri,

      width: 0,

      height: 0,

      format: options.format ?? "jpeg",

      error:
        error instanceof Error ? error.message : "Image compression failed.",
    };
  }
}

// ============================================================
// COMPRESS MULTIPLE IMAGES
// ============================================================

export async function compressMultipleImages(
  uris: string[],
  options: ImageCompressionOptions = {},
): Promise<BatchCompressionResult> {
  if (uris.length > IMAGE_LIMITS.MAX_BATCH_SIZE) {
    throw new Error(
      `A maximum of ${IMAGE_LIMITS.MAX_BATCH_SIZE} images can be processed at once.`,
    );
  }

  const successful: ImageCompressionResult[] = [];

  const failed: BatchCompressionResult["failed"] = [];

  for (const uri of uris) {
    const result = await compressImageSafely(uri, options);

    if (result.success) {
      successful.push(result);
    } else {
      failed.push({
        uri,

        error: result.error ?? "Compression failed.",
      });
    }
  }

  return {
    successful,

    failed,

    total: uris.length,
  };
}

// ============================================================
// COMPRESS IMAGES CONCURRENTLY
// ============================================================

export async function compressImagesConcurrently(
  uris: string[],
  options: ImageCompressionOptions = {},
  concurrency = 2,
): Promise<BatchCompressionResult> {
  if (uris.length > IMAGE_LIMITS.MAX_BATCH_SIZE) {
    throw new Error("Too many images to process.");
  }

  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error("Concurrency must be at least 1.");
  }

  const successful: ImageCompressionResult[] = [];

  const failed: BatchCompressionResult["failed"] = [];

  let currentIndex = 0;

  const worker = async () => {
    while (true) {
      const index = currentIndex++;

      if (index >= uris.length) {
        return;
      }

      const uri = uris[index];

      if (!uri) {
        continue;
      }

      const result = await compressImageSafely(uri, options);

      if (result.success) {
        successful.push(result);
      } else {
        failed.push({
          uri,

          error: result.error ?? "Compression failed.",
        });
      }
    }
  };

  const workers = Array.from(
    {
      length: Math.min(concurrency, uris.length),
    },
    () => worker(),
  );

  await Promise.all(workers);

  return {
    successful,

    failed,

    total: uris.length,
  };
}

// ============================================================
// PREPARE IMAGE FOR UPLOAD
// ============================================================

export async function prepareImageForUpload(
  uri: string,
  options: ImageCompressionOptions = {},
): Promise<ImageFileInformation> {
  const result = await compressImage(uri, options);

  const format = result.format;

  return {
    uri: result.uri,

    fileName: generateImageFileName(format),

    mimeType: getImageMimeType(format),

    extension: IMAGE_EXTENSIONS[format],
  };
}

// ============================================================
// PREPARE MULTIPLE IMAGES FOR UPLOAD
// ============================================================

export async function prepareImagesForUpload(
  uris: string[],
  options: ImageCompressionOptions = {},
): Promise<ImageFileInformation[]> {
  const results: ImageFileInformation[] = [];

  for (const uri of uris) {
    const image = await prepareImageForUpload(uri, options);

    results.push(image);
  }

  return results;
}

// ============================================================
// DEFAULT ITEM IMAGE OPTIONS
// ============================================================

export const ITEM_IMAGE_OPTIONS: ImageCompressionOptions = {
  quality: 0.7,

  maxWidth: 1280,

  maxHeight: 1280,

  format: "jpeg",

  compress: true,
};

// ============================================================
// THUMBNAIL IMAGE OPTIONS
// ============================================================

export const THUMBNAIL_IMAGE_OPTIONS: ImageCompressionOptions = {
  quality: 0.55,

  maxWidth: 400,

  maxHeight: 400,

  format: "jpeg",

  compress: true,
};

// ============================================================
// HIGH QUALITY IMAGE OPTIONS
// ============================================================

export const HIGH_QUALITY_IMAGE_OPTIONS: ImageCompressionOptions = {
  quality: 0.9,

  maxWidth: 1920,

  maxHeight: 1920,

  format: "jpeg",

  compress: true,
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  compressImage,

  compressImageSafely,

  compressMultipleImages,

  compressImagesConcurrently,

  prepareImageForUpload,

  prepareImagesForUpload,

  validateImageUri,

  validateImageSize,

  validateImageCount,

  formatImageSize,

  calculateCompressionSavings,

  calculateResizedDimensions,
};
