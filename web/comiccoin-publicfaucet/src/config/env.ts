// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/config/env.ts
// This file provides type-safe access to environment variables
// and ensures they are properly validated at runtime

// These environment variables are loaded by Next.js and will be available
// through process.env in both client and server components
// No need for a complex check since Next.js handles this

// Helper function with better error handling and default values
const getEnvVar = (key: string, defaultValue?: string): string => {
  // In Next.js, environment variables that should be exposed to the client
  // must be prefixed with NEXT_PUBLIC_
  const fullKey = `NEXT_PUBLIC_${key}`;

  // Access the environment variable safely
  // process.env is populated by Next.js with the environment variables
  const value =
    typeof process !== "undefined" && process.env && fullKey in process.env
      ? process.env[fullKey]
      : undefined;

  if (value) {
    return value;
  }

  // If we have a default value, use it
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  // Only warn if we have no value and no default
  console.warn(
    `Environment variable ${fullKey} is not set, using empty string`,
  );
  return "";
};

// Hardcoded development fallback values
const DEV_API_DOMAIN = "localhost:8000";
const DEV_API_PROTOCOL = "http";

// API Configuration with production-ready defaults
export const API_CONFIG = {
  domain: getEnvVar("API_DOMAIN", DEV_API_DOMAIN),
  protocol: getEnvVar("API_PROTOCOL", DEV_API_PROTOCOL),
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

// Log loaded configuration in development to help with debugging
if (process.env.NODE_ENV === "development") {
  console.log("🔧 Loaded Environment Configuration:", {
    api: {
      domain: API_CONFIG.domain,
      protocol: API_CONFIG.protocol,
      baseUrl: API_CONFIG.baseUrl,
    },
    frontend: {
      domain: FRONTEND_CONFIG.domain,
      protocol: FRONTEND_CONFIG.protocol,
      baseUrl: FRONTEND_CONFIG.baseUrl,
    },
  });
}

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
