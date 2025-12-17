/**
 * Validation utilities for API requests
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate PIN format (4 digits)
 */
export function validatePIN(pin: string): ValidationResult {
  if (!pin || typeof pin !== "string") {
    return { valid: false, error: "PIN must be a string" };
  }
  if (!/^\d{4}$/.test(pin)) {
    return { valid: false, error: "PIN must be exactly 4 digits" };
  }
  return { valid: true };
}

/**
 * Validate filename
 */
export function validateFilename(filename: string): ValidationResult {
  if (!filename || typeof filename !== "string") {
    return { valid: false, error: "Filename must be a string" };
  }
  if (filename.trim().length === 0) {
    return { valid: false, error: "Filename cannot be empty" };
  }
  if (filename.length > 255) {
    return { valid: false, error: "Filename too long (max 255 characters)" };
  }
  
  // Check for dangerous characters
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return { valid: false, error: "Filename contains invalid characters" };
  }
  
  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSize: number = 100 * 1024 * 1024): ValidationResult {
  if (typeof size !== "number" || isNaN(size)) {
    return { valid: false, error: "File size must be a number" };
  }
  if (size <= 0) {
    return { valid: false, error: "File size must be greater than 0" };
  }
  if (size > maxSize) {
    const maxMB = (maxSize / 1024 / 1024).toFixed(0);
    return { valid: false, error: `File size exceeds maximum of ${maxMB}MB` };
  }
  return { valid: true };
}

/**
 * Validate MIME type
 */
export function validateMimeType(mimeType: string): ValidationResult {
  if (!mimeType || typeof mimeType !== "string") {
    return { valid: false, error: "MIME type must be a string" };
  }
  // Basic MIME type validation
  if (!/^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/.test(mimeType)) {
    return { valid: false, error: "Invalid MIME type format" };
  }
  return { valid: true };
}

/**
 * Validate MongoDB ObjectId format
 */
export function validateObjectId(id: string): ValidationResult {
  if (!id || typeof id !== "string") {
    return { valid: false, error: "ID must be a string" };
  }
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return { valid: false, error: "Invalid ID format" };
  }
  return { valid: true };
}

/**
 * Sanitize filename to prevent directory traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  let sanitized = filename.replace(/^.*[\\/]/, "");
  
  // Replace dangerous characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf("."));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }
  
  return sanitized;
}

