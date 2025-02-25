// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/config/env.ts

// Check if we're in development mode
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// Simple helper to get environment variables with defaults
const getEnvVar = (key: string, defaultValue: string = ""): string => {
  const value = process.env[key];
  return value || defaultValue;
};

// API Configuration
export const API_CONFIG = {
  domain: getEnvVar("NEXT_PUBLIC_API_DOMAIN", "127.0.0.1:8000"),
  protocol: getEnvVar("NEXT_PUBLIC_API_PROTOCOL", "http"),
  get baseUrl() {
    return `${this.protocol}://${this.domain}`;
  },
};

// Frontend Configuration
export const FRONTEND_CONFIG = {
  domain: getEnvVar("NEXT_PUBLIC_WWW_DOMAIN", "localhost:3000"),
  protocol: getEnvVar("NEXT_PUBLIC_WWW_PROTOCOL", "http"),
  get baseUrl() {
    return `${this.protocol}://${this.domain}`;
  },
};

// Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSizeBytes: parseInt(
    getEnvVar("NEXT_PUBLIC_IMAGE_UPLOAD_MAX_FILESIZE_IN_BYTES", "5242880"),
    10
  ),
  maxFileSizeErrorMessage: getEnvVar(
    "NEXT_PUBLIC_IMAGE_UPLOAD_MAX_FILESIZE_ERROR_MESSAGE",
    "File size must be less than 5MB"
  ),
};


// Export types for better TypeScript support
export type ApiConfig = typeof API_CONFIG;
export type FrontendConfig = typeof FRONTEND_CONFIG;
export type UploadConfig = typeof UPLOAD_CONFIG;
