/**
 * axiosClient.js - API Client Configuration
 *
 * This file configures and exports an axios HTTP client instance with authentication,
 * token refresh, retry logic, and error handling capabilities.
 *
 * The client handles:
 * 1. Adding authentication tokens to requests
 * 2. Refreshing expired tokens automatically
 * 3. Retrying failed requests with exponential backoff
 * 4. Queueing requests during token refresh
 */

import axios from "axios";
import config from "../config";
import {
  AUTH_STORAGE_KEY,
  loadData,
  saveData,
  removeData,
} from "../utils/secureStorage";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Build the API base URL from configuration
// This pulls the base URL from your config file and appends the API version path
const API_BASE_URL = `${config.PUBLICFAUCET_URL}/publicfaucet/api/v1`;

/**
 * Create and configure the axios client instance
 *
 * baseURL: The root URL for all requests
 * headers: Default headers sent with every request
 * timeout: Maximum time to wait for a response before failing
 */
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // Custom User-Agent helps identify this app in server logs
    // Format: AppName/Version (Platform; PlatformVersion)
    "User-Agent": `ComicCoinFaucet/${Constants.expoConfig?.version || "1.0.0"} (${Platform.OS}; ${Platform.Version})`,
  },
  // Platform-specific timeout - Android might need longer timeouts
  timeout: Platform.OS === "android" ? 30000 : 15000, // 30s for Android, 15s for others
  timeoutErrorMessage: "Request timed out. Please check your connection.",
});

// ====================================
// TOKEN REFRESH LOGIC AND QUEUE SYSTEM
// ====================================

/**
 * Track if a token refresh operation is currently in progress
 * This prevents multiple simultaneous refresh attempts
 * @type {boolean}
 */
let isRefreshing = false;

/**
 * Queue of requests that failed due to expired token and are waiting for a refresh
 * Each item contains resolve/reject functions to continue the request after refresh
 * @type {Array<{resolve: Function, reject: Function}>}
 */
let failedQueue = [];

/**
 * Process all queued requests after a token refresh attempt
 * Either resolves all with the new token or rejects all with the error
 *
 * @param {Error|null} error - Error from token refresh attempt, if any
 * @param {string|null} token - New access token if refresh was successful
 */
const processQueue = (error, token = null) => {
  // Process each queued request
  failedQueue.forEach((prom) => {
    if (error) {
      // If refresh failed, reject the request
      prom.reject(error);
    } else {
      // If refresh succeeded, resolve with new token
      prom.resolve(token);
    }
  });

  // Clear the queue after processing
  failedQueue = [];
};

// ====================================
// REQUEST INTERCEPTOR
// ====================================

/**
 * Request interceptor - runs before each request is sent
 * Primary purpose: Add authentication tokens to requests that need them
 */
axiosClient.interceptors.request.use(
  async (config) => {
    console.log(
      `🚀 Request starting: ${config.method?.toUpperCase()} ${config.url}`,
    );
    console.log(`⏱️ Timeout set to: ${config.timeout}ms`);
    console.log(`🔧 Full request URL: ${config.baseURL}${config.url}`);

    // Skip authentication for login, token refresh, and public endpoints
    // These endpoints don't require an authentication token
    if (
      config.url?.includes("/login") ||
      config.url?.includes("/token/refresh") ||
      config.publicEndpoint
    ) {
      return config;
    }

    try {
      // Load authentication data from secure storage
      const authData = (await loadData(AUTH_STORAGE_KEY)) || {};

      // Check if we have a token before trying to use it
      if (authData && authData.access_token) {
        // Log token information for debugging (without revealing the actual token)
        console.log("Auth header structure:", {
          headerType: "JWT",
          tokenLength: authData.access_token.length,
          tokenStart: authData.access_token.substring(0, 10) + "...",
          platform: Platform.OS,
        });

        // Add the Authorization header with the token
        config.headers = {
          ...config.headers,
          Authorization: `JWT ${authData.access_token}`,
        };
      } else {
        console.log("⚠️ No access token available for authenticated request");
      }
    } catch (error) {
      console.error("🔑 Error adding auth header:", error);
      // We continue without the auth header rather than failing the request
      // The server will return 401 if auth is required, triggering the refresh flow
    }

    // Platform-specific adjustments for Android
    if (Platform.OS === "android") {
      // Force connection close to prevent connection pool issues
      config.headers = {
        ...config.headers,
        Connection: "close",
      };
    }

    return config;
  },
  (error) => {
    // If there's an error setting up the request, reject with the error
    console.log("❌ Request setup error:", error);
    return Promise.reject(error);
  },
);

// ====================================
// RESPONSE INTERCEPTOR FOR TOKEN REFRESH
// ====================================

/**
 * Response interceptor for handling authentication errors
 * Key functionality: Refresh expired tokens and retry failed requests
 */
axiosClient.interceptors.response.use(
  // For successful responses, just pass them through
  (response) => response,

  // For errors, handle token refresh if needed
  async (error) => {
    // Get the original request configuration
    const originalRequest = error.config;

    if (!originalRequest) {
      console.error("❌ Response error with no config:", error.message);
      return Promise.reject(error);
    }

    // Log detailed error information
    console.log(
      "🌐 Response error:",
      error.response?.status,
      error.response?.data,
      "URL:",
      originalRequest.url,
      "Base URL:",
      API_BASE_URL,
    );

    // Special handling for timeout errors
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      console.error("⏱️ Request timeout:", {
        url: originalRequest.url,
        method: originalRequest.method,
        timeout: originalRequest.timeout,
      });
    }

    // Only attempt token refresh for 401 Unauthorized errors on authenticated endpoints
    // Skip if:
    // 1. Error is not 401 (Unauthorized)
    // 2. It's a failed refresh token request
    // 3. We've already tried to refresh once for this request
    // 4. It's a public endpoint that doesn't need authentication
    if (
      error.response?.status !== 401 ||
      originalRequest.url?.includes("/token/refresh") ||
      originalRequest._retry ||
      originalRequest.publicEndpoint
    ) {
      return Promise.reject(error);
    }

    // Mark this request as retried to prevent infinite loops
    originalRequest._retry = true;

    console.log("🔄 Starting token refresh process");

    // Get the refresh token from storage
    let refreshToken;
    try {
      const authData = (await loadData(AUTH_STORAGE_KEY)) || {};
      refreshToken = authData.refresh_token;

      // Debug log to check the refresh token
      console.log("🔑 Refresh token exists:", !!refreshToken);

      // Log token expiry times for debugging
      if (authData.access_token_expiry_time) {
        console.log(
          "⏰ Access token expired at:",
          new Date(authData.access_token_expiry_time).toLocaleString(),
        );
        console.log("⏰ Current time:", new Date().toLocaleString());
      }

      if (authData.refresh_token_expiry_time) {
        console.log(
          "⏰ Refresh token expires at:",
          new Date(authData.refresh_token_expiry_time).toLocaleString(),
        );
      }
    } catch (error) {
      console.error("📝 Error retrieving refresh token:", error);
      refreshToken = null;
    }

    // If no refresh token is available, we can't refresh
    if (!refreshToken) {
      console.log("⚠️ No refresh token available, redirecting to login");
      await removeData(AUTH_STORAGE_KEY); // Clear invalid auth data
      return Promise.reject(error);
    }

    // If a token refresh is already in progress, add this request to the queue
    if (isRefreshing) {
      console.log("⏳ Already refreshing, adding request to queue");
      // Return a new promise that will be resolved/rejected after token refresh
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          // When resolved, retry the original request with the new token
          originalRequest.headers["Authorization"] = `JWT ${token}`;
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Set the flag to indicate we're refreshing
    isRefreshing = true;

    try {
      console.log("🔄 Attempting to refresh token");

      // Send the token refresh request
      // Note: Use direct axios instance to avoid interceptors creating an infinite loop
      const response = await axios.post(
        `${API_BASE_URL}/token/refresh`,
        {
          // The backend expects the refresh token in a field called "value"
          value: refreshToken,
        },
        {
          // Higher timeout for token refresh
          timeout: 30000,
          headers: {
            "Content-Type": "application/json",
            // Cache prevention headers
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );

      console.log("✅ Token refresh successful");

      // Parse the response
      const authData = response.data;

      try {
        // Get existing auth data to preserve user info
        const existingAuthData = (await loadData(AUTH_STORAGE_KEY)) || {};

        // Update only token-related fields
        // Note field name mapping: backend uses expiry_date, we use expiry_time
        const updatedAuthData = {
          ...existingAuthData,
          access_token: authData.access_token,
          access_token_expiry_time: authData.access_token_expiry_date,
          refresh_token: authData.refresh_token,
          refresh_token_expiry_time: authData.refresh_token_expiry_date,
        };

        // Save updated tokens
        await saveData(AUTH_STORAGE_KEY, updatedAuthData);

        // Log the new token expiry time
        console.log(
          "⏰ New access token expires at:",
          new Date(authData.access_token_expiry_date).toLocaleString(),
        );
      } catch (error) {
        console.error("📝 Failed to update tokens in storage", error);
        // Continue anyway to allow this request to complete
      }

      // Update authorization header for the original request
      originalRequest.headers["Authorization"] = `JWT ${authData.access_token}`;

      // Process queue of pending requests
      processQueue(null, authData.access_token);

      // Retry the original request with the new token
      return axiosClient(originalRequest);
    } catch (refreshError) {
      // Log detailed refresh error information
      console.error("❌ Token refresh failed:", {
        status: refreshError.response?.status,
        data: refreshError.response?.data,
        requestURL: `${API_BASE_URL}/token/refresh`,
        sentPayload: { value: refreshToken },
      });

      // Refresh failed, clear tokens to force re-login
      await removeData(AUTH_STORAGE_KEY);

      // Reject all queued requests with the error
      processQueue(refreshError, null);

      return Promise.reject(refreshError);
    } finally {
      // Always reset the refreshing flag
      isRefreshing = false;
    }
  },
);

// ====================================
// REQUEST RETRY SYSTEM WITH EXPONENTIAL BACKOFF
// ====================================

/**
 * Adds retry capability to axios requests with exponential backoff
 * Retries network errors and server errors (5xx) automatically
 *
 * @param {Object} axiosInstance - The axios instance to enhance
 * @param {number} maxRetries - Maximum number of retry attempts per request
 */
const setupAxiosRetry = (axiosInstance, maxRetries = 3) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;

      // Ensure retry count exists on the config
      if (!config || config.retry === undefined) {
        if (config) config.retry = 0;
        else return Promise.reject(error); // No config to retry
      }

      // Check if we've reached the retry limit
      if (config.retry >= maxRetries) {
        console.log(
          `❌ Maximum retries (${maxRetries}) reached for:`,
          config.url,
        );
        return Promise.reject(error);
      }

      // Determine if we should retry based on error type
      // Retry on:
      // 1. Network errors (no response)
      // 2. Timeout errors (ECONNABORTED)
      // 3. Server errors (5xx)
      const shouldRetry =
        !error.response || // Network error
        error.code === "ECONNABORTED" || // Timeout
        (error.response && error.response.status >= 500); // Server error

      if (!shouldRetry) {
        console.log(
          "⛔ Not retrying request, error type:",
          error.response?.status,
        );
        return Promise.reject(error);
      }

      // Increase retry count
      config.retry += 1;

      // Calculate delay with exponential backoff
      // Formula: 2^retry * 1000 milliseconds
      // Examples: 2s, 4s, 8s, 16s, etc.
      const delayMs = Math.min(Math.pow(2, config.retry) * 1000, 30000); // Cap at 30 seconds

      console.log(
        `🔄 Retrying request (${config.retry}/${maxRetries}) after ${delayMs}ms`,
        config.url,
      );

      // Wait for the backoff delay
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      // Return the promise from a new axios request with the same config
      return axiosInstance(config);
    },
  );
};

// ====================================
// HELPER FUNCTIONS AND EXPORTS
// ====================================

/**
 * Marks a request as going to a public endpoint, skipping authentication
 * Public endpoints don't need authentication tokens, even if available
 *
 * @param {Object} config - Axios request config
 * @returns {Object} Modified config
 */
export const publicEndpoint = (config = {}) => {
  return {
    ...config,
    publicEndpoint: true,
  };
};

/**
 * Marks a request as requiring authentication
 * This is the default behavior, but can be used for clarity
 *
 * @param {Object} config - Axios request config
 * @returns {Object} Modified config
 */
export const privateEndpoint = (config = {}) => {
  return {
    ...config,
    publicEndpoint: false,
  };
};

// Apply the retry setup to our axiosClient
setupAxiosRetry(axiosClient);

// Export the configured client as the default export
export default axiosClient;
