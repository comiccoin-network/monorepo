// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/config/env.ts
// This file provides type-safe access to environment variables
// and ensures they are properly validated at runtime

// Helper function with better error handling and default values
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[`NEXT_PUBLIC_${key}`];

  // If we have a value, return it
  if (value) {
    return value;
  }

  // If we have a default value, use it
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  // Only throw if we have no value and no default
  console.warn(`Environment variable NEXT_PUBLIC_${key} is not set`);
  return "";
};

// API Configuration with development defaults
export const API_CONFIG = {
  domain: getEnvVar("API_DOMAIN", "127.0.0.1:9090"),
  protocol: getEnvVar("API_PROTOCOL", "http"),
  get baseUrl() {
    return `${this.protocol}://${this.domain}`;
  },
} as const;

// Frontend Configuration with development defaults
export const FRONTEND_CONFIG = {
  domain: getEnvVar("WWW_DOMAIN", "localhost:3000"),
  protocol: getEnvVar("WWW_PROTOCOL", "http"),
  get baseUrl() {
    return `${this.protocol}://${this.domain}`;
  },
} as const;

// Upload Configuration with development defaults
export const UPLOAD_CONFIG = {
  maxFileSizeBytes: parseInt(
    getEnvVar("IMAGE_UPLOAD_MAX_FILESIZE_IN_BYTES", "5242880"),
    10,
  ),
  maxFileSizeErrorMessage: getEnvVar(
    "IMAGE_UPLOAD_MAX_FILESIZE_ERROR_MESSAGE",
    "File size must be less than 5MB",
  ),
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
