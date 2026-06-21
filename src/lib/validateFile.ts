/**
 * File upload validation — type + size limits.
 */

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/markdown",
  ],
  image: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  spreadsheet: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ],
};

const ALL_ALLOWED = [
  ...ALLOWED_MIME_TYPES.document,
  ...ALLOWED_MIME_TYPES.image,
  ...ALLOWED_MIME_TYPES.spreadsheet,
];

/** Max file size: 50 MB */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** Max files per upload */
export const MAX_FILES_PER_UPLOAD = 1;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/** Validate a single file before upload. */
export function validateFileUpload(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    const maxMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File "${file.name}" exceeds the maximum size of ${maxMB}MB.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: `File "${file.name}" is empty.`,
    };
  }

  if (!ALL_ALLOWED.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type || "unknown"}" is not allowed. Accepted: PDF, DOC, PPT, TXT, images, CSV, Excel.`,
    };
  }

  // Check for executable extensions
  const name = file.name.toLowerCase();
  const dangerousExts = [".exe", ".bat", ".cmd", ".sh", ".ps1", ".js", ".vbs", ".msi", ".com", ".scr", ".pif"];
  if (dangerousExts.some((ext) => name.endsWith(ext))) {
    return {
      valid: false,
      error: `File "${file.name}" has a potentially dangerous extension.`,
    };
  }

  return { valid: true };
}

/** Validate multiple files. */
export function validateFileUploads(files: File[]): FileValidationResult {
  if (files.length > MAX_FILES_PER_UPLOAD) {
    return {
      valid: false,
      error: `Maximum ${MAX_FILES_PER_UPLOAD} file(s) allowed per upload.`,
    };
  }

  for (const file of files) {
    const result = validateFileUpload(file);
    if (!result.valid) return result;
  }

  return { valid: true };
}
