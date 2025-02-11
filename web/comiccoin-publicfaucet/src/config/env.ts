// This file provides type-safe access to environment variables
// and ensures they are properly validated at runtime

// Helper function to get environment variables with validation
const getEnvVar = (key: string): string => {
  const value = process.env[`NEXT_PUBLIC_${key}`];
  if (!value) {
    throw new Error(
      `Missing required environment variable: NEXT_PUBLIC_${key}`,
    );
  }
  return value;
};

// API Configuration
export const API_CONFIG = {
  domain: getEnvVar("API_DOMAIN"),
  protocol: getEnvVar("API_PROTOCOL"),
  get baseUrl() {
    return `${this.protocol}://${this.domain}`;
  },
} as const;

// Frontend Configuration
export const FRONTEND_CONFIG = {
  domain: getEnvVar("WWW_DOMAIN"),
  protocol: getEnvVar("WWW_PROTOCOL"),
  get baseUrl() {
    return `${this.protocol}://${this.domain}`;
  },
} as const;

// Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSizeBytes: parseInt(
    getEnvVar("IMAGE_UPLOAD_MAX_FILESIZE_IN_BYTES"),
    10,
  ),
  maxFileSizeErrorMessage: getEnvVar("IMAGE_UPLOAD_MAX_FILESIZE_ERROR_MESSAGE"),
  get maxFileSizeMB() {
    return this.maxFileSizeBytes / (1024 * 1024);
  },
} as const;

// Utility function to validate file size
export const isValidFileSize = (fileSize: number): boolean => {
  return fileSize <= UPLOAD_CONFIG.maxFileSizeBytes;
};

// Type definitions for our configuration
export type ApiConfig = typeof API_CONFIG;
export type FrontendConfig = typeof FRONTEND_CONFIG;
export type UploadConfig = typeof UPLOAD_CONFIG;

// Export a complete config object
export const CONFIG = {
  api: API_CONFIG,
  frontend: FRONTEND_CONFIG,
  upload: UPLOAD_CONFIG,
} as const;

// Type for the complete config
export type Config = typeof CONFIG;
