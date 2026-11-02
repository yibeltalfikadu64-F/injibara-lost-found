// mobile/src/services/uploadService.ts

import { Platform } from "react-native";

import api, { ApiError } from "./apiClient";

// ============================================================
// TYPES
// ============================================================

export type UploadCategory =
  | "ITEM_IMAGE"
  | "PROFILE_IMAGE"
  | "CLAIM_EVIDENCE"
  | "DOCUMENT"
  | "OTHER";

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface UploadedFile {
  id?: string;
  url: string;
  filename?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
}

export interface UploadResponse {
  success?: boolean;
  message?: string;
  data?: UploadedFile | UploadedFile[];
  file?: UploadedFile;
  files?: UploadedFile[];
}

export interface UploadOptions {
  category?: UploadCategory;
  itemId?: string;
  claimId?: string;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export interface UploadValidationOptions {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  maxFiles?: number;
}

// ============================================================
// CONFIGURATION
// ============================================================

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

const DEFAULT_MAX_FILES = 10;

const DEFAULT_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const DEFAULT_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];

// ============================================================
// FILE NAME HELPERS
// ============================================================

function getFileExtension(filename: string): string {
  const parts = filename.split(".");

  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function getFileNameFromUri(uri: string): string {
  const cleanUri = uri.split("?")[0];

  const parts = cleanUri.split("/");

  const filename = parts[parts.length - 1];

  return filename || `upload-${Date.now()}`;
}

function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
    pdf: "application/pdf",
    txt: "text/plain",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

// ============================================================
// FILE NORMALIZATION
// ============================================================

function normalizeUploadFile(file: UploadFile): UploadFile {
  if (!file.uri) {
    throw new ApiError("The selected file does not have a valid URI.", {
      code: "INVALID_FILE_URI",
    });
  }

  const name = file.name?.trim() || getFileNameFromUri(file.uri);

  const extension = getFileExtension(name);

  const type = file.type?.trim() || getMimeTypeFromExtension(extension);

  return {
    ...file,
    name,
    type,
  };
}

// ============================================================
// FILE VALIDATION
// ============================================================

function validateFile(
  file: UploadFile,
  options: UploadValidationOptions = {},
): string | null {
  const normalized = normalizeUploadFile(file);

  const maxFileSize = options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;

  const allowedMimeTypes = options.allowedMimeTypes ?? DEFAULT_IMAGE_TYPES;

  if (!normalized.name.trim()) {
    return "A file name is required.";
  }

  if (normalized.type === "application/octet-stream") {
    return `The file type of "${normalized.name}" could not be identified.`;
  }

  if (!allowedMimeTypes.includes(normalized.type)) {
    return `"${normalized.name}" has an unsupported file type.`;
  }

  if (typeof normalized.size === "number" && normalized.size > maxFileSize) {
    return `"${normalized.name}" exceeds the maximum allowed file size.`;
  }

  if (typeof normalized.size === "number" && normalized.size <= 0) {
    return `"${normalized.name}" is empty.`;
  }

  return null;
}

// ============================================================
// VALIDATE MULTIPLE FILES
// ============================================================

function validateFiles(
  files: UploadFile[],
  options: UploadValidationOptions = {},
): string[] {
  const errors: string[] = [];

  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;

  if (!Array.isArray(files) || files.length === 0) {
    return ["Please select at least one file."];
  }

  if (files.length > maxFiles) {
    return [`You can upload a maximum of ${maxFiles} files.`];
  }

  files.forEach((file, index) => {
    const error = validateFile(file, options);

    if (error) {
      errors.push(`File ${index + 1}: ${error}`);
    }
  });

  return errors;
}

// ============================================================
// FORM DATA FILE APPENDER
// ============================================================

function appendFile(
  formData: FormData,
  fieldName: string,
  file: UploadFile,
): void {
  const normalized = normalizeUploadFile(file);

  if (Platform.OS === "web") {
    // Web callers should preferably pass a browser File or Blob
    // through a separate web-specific upload integration.
    // React Native URI objects are used on native platforms.
    formData.append(
      fieldName,
      normalized.uri as unknown as Blob,
      normalized.name,
    );

    return;
  }

  formData.append(fieldName, {
    uri: normalized.uri,
    name: normalized.name,
    type: normalized.type,
  } as unknown as Blob);
}

// ============================================================
// UPLOAD PROGRESS
// ============================================================

function calculateProgress(loaded: number, total?: number): number {
  if (!total || total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((loaded / total) * 100));
}

// ============================================================
// RESPONSE NORMALIZATION
// ============================================================

function extractUploadedFiles(response: UploadResponse): UploadedFile[] {
  if (Array.isArray(response.files)) {
    return response.files;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.file) {
    return [response.file];
  }

  if (
    response.data &&
    !Array.isArray(response.data) &&
    "url" in response.data
  ) {
    return [response.data];
  }

  return [];
}

// ============================================================
// UPLOAD SINGLE FILE
// ============================================================

async function uploadFile(
  file: UploadFile,
  options: UploadOptions = {},
): Promise<UploadedFile> {
  const validationError = validateFile(file);

  if (validationError) {
    throw new ApiError(validationError, {
      code: "FILE_VALIDATION_ERROR",
    });
  }

  const formData = new FormData();

  appendFile(formData, "file", file);

  formData.append("category", options.category ?? "OTHER");

  if (options.itemId) {
    formData.append("itemId", options.itemId);
  }

  if (options.claimId) {
    formData.append("claimId", options.claimId);
  }

  try {
    const response = await api.instance.post<UploadResponse>(
      "/uploads",
      formData,
      {
        signal: options.signal,

        headers: {
          "Content-Type": "multipart/form-data",
        },

        onUploadProgress: (event) => {
          options.onProgress?.(calculateProgress(event.loaded, event.total));
        },
      },
    );

    const uploadedFiles = extractUploadedFiles(response.data);

    const uploadedFile = uploadedFiles[0];

    if (!uploadedFile?.url) {
      throw new ApiError(
        "The server did not return a valid uploaded file URL.",
        {
          code: "INVALID_UPLOAD_RESPONSE",
        },
      );
    }

    options.onProgress?.(100);

    return uploadedFile;
  } catch (error) {
    throw api.normalizeApiError(error);
  }
}

// ============================================================
// UPLOAD MULTIPLE FILES
// ============================================================

async function uploadFiles(
  files: UploadFile[],
  options: UploadOptions = {},
): Promise<UploadedFile[]> {
  const errors = validateFiles(files);

  if (errors.length > 0) {
    throw new ApiError(errors.join("\n"), {
      code: "FILE_VALIDATION_ERROR",
    });
  }

  const formData = new FormData();

  files.forEach((file) => {
    appendFile(formData, "files", file);
  });

  formData.append("category", options.category ?? "ITEM_IMAGE");

  if (options.itemId) {
    formData.append("itemId", options.itemId);
  }

  if (options.claimId) {
    formData.append("claimId", options.claimId);
  }

  try {
    const response = await api.instance.post<UploadResponse>(
      "/uploads/multiple",
      formData,
      {
        signal: options.signal,

        headers: {
          "Content-Type": "multipart/form-data",
        },

        onUploadProgress: (event) => {
          options.onProgress?.(calculateProgress(event.loaded, event.total));
        },
      },
    );

    const uploadedFiles = extractUploadedFiles(response.data);

    if (uploadedFiles.length !== files.length) {
      throw new ApiError(
        "The server returned an unexpected number of uploaded files.",
        {
          code: "UPLOAD_COUNT_MISMATCH",
        },
      );
    }

    options.onProgress?.(100);

    return uploadedFiles;
  } catch (error) {
    throw api.normalizeApiError(error);
  }
}

// ============================================================
// UPLOAD ITEM IMAGES
// ============================================================

async function uploadItemImages(
  files: UploadFile[],
  itemId?: string,
  onProgress?: (progress: number) => void,
): Promise<UploadedFile[]> {
  return uploadFiles(files, {
    category: "ITEM_IMAGE",
    itemId,
    onProgress,
  });
}

// ============================================================
// UPLOAD CLAIM EVIDENCE
// ============================================================

async function uploadClaimEvidence(
  files: UploadFile[],
  claimId?: string,
  onProgress?: (progress: number) => void,
): Promise<UploadedFile[]> {
  return uploadFiles(files, {
    category: "CLAIM_EVIDENCE",
    claimId,
    onProgress,
  });
}

// ============================================================
// UPLOAD PROFILE IMAGE
// ============================================================

async function uploadProfileImage(
  file: UploadFile,
  onProgress?: (progress: number) => void,
): Promise<UploadedFile> {
  return uploadFile(file, {
    category: "PROFILE_IMAGE",
    onProgress,
  });
}

// ============================================================
// DELETE UPLOADED FILE
// ============================================================

async function deleteUploadedFile(fileId: string): Promise<void> {
  if (!fileId.trim()) {
    throw new ApiError("A file ID is required.", {
      code: "INVALID_FILE_ID",
    });
  }

  try {
    await api.instance.delete(`/uploads/${encodeURIComponent(fileId)}`);
  } catch (error) {
    throw api.normalizeApiError(error);
  }
}

// ============================================================
// DELETE MULTIPLE FILES
// ============================================================

async function deleteUploadedFiles(fileIds: string[]): Promise<void> {
  if (fileIds.length === 0) {
    return;
  }

  if (fileIds.some((id) => !id.trim())) {
    throw new ApiError("One or more file IDs are invalid.", {
      code: "INVALID_FILE_ID",
    });
  }

  try {
    await api.instance.post("/uploads/delete-multiple", {
      fileIds,
    });
  } catch (error) {
    throw api.normalizeApiError(error);
  }
}

// ============================================================
// FILE SIZE FORMATTER
// ============================================================

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "Unknown size";
  }

  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const size = bytes / Math.pow(1024, index);

  return `${size.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

// ============================================================
// PUBLIC SERVICE
// ============================================================

const uploadService = {
  uploadFile,
  uploadFiles,

  uploadItemImages,
  uploadClaimEvidence,
  uploadProfileImage,

  deleteUploadedFile,
  deleteUploadedFiles,

  validateFile,
  validateFiles,

  normalizeUploadFile,

  getFileNameFromUri,
  getMimeTypeFromExtension,

  formatFileSize,
};

export default uploadService;
