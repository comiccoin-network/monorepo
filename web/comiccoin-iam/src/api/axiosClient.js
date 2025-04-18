// monorepo/web/comiccoin-iam/src/api/axiosClient.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_DOMAIN}/iam/api/v1`;
const AUTH_STORAGE_KEY = "auth_data";

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if we're currently refreshing the token
let isRefreshing = false;
// Queue of requests waiting for token refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Fix: Safely check if URL includes a string pattern
const urlIncludes = (url, pattern) => {
  return typeof url === "string" && url.includes(pattern);
};

// Request interceptor - adds authentication token to requests
axiosClient.interceptors.request.use(
  (config) => {
    // Fix: Safely check URLs to prevent "includes is not a function" error
    // Don't add token for auth endpoints or public endpoints
    if (
      config.publicEndpoint ||
      urlIncludes(config.url, "/login") ||
      urlIncludes(config.url, "/token/refresh")
    ) {
      return config;
    }

    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );
      if (authData.access_token) {
        config.headers = {
          ...config.headers,
          Authorization: `JWT ${authData.access_token}`,
        };
      }
    } catch (error) {
      console.error("🔑 Error adding auth header:", error);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handles token refresh on 401 errors
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Add emoji-based logging to help with debugging
    console.log(
      "🌐 Response error:",
      error.response?.status,
      error.response?.data,
    );

    // If the error is not 401 or it's a failed refresh token request
    // or we've already tried to refresh once
    if (
      error.response?.status !== 401 ||
      urlIncludes(originalRequest?.url, "/token/refresh") ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // If this is a public endpoint that doesn't need authentication
    if (originalRequest.publicEndpoint) {
      return Promise.reject(error);
    }

    // Mark as retried to prevent infinite loops
    originalRequest._retry = true;

    console.log("🔄 Starting token refresh process");

    let refreshToken;
    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );
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
      console.error("📝 Error parsing auth data:", error);
      refreshToken = null;
    }

    if (!refreshToken) {
      // No refresh token available, redirect to login
      console.log("⚠️ No refresh token available, redirecting to login");
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // If already refreshing, add this request to queue
      console.log("⏳ Already refreshing, adding request to queue");
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `JWT ${token}`;
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      console.log("🔄 Attempting to refresh token with correct payload format");

      // The correct payload structure according to the Go backend
      const response = await axios.post(`${API_BASE_URL}/token/refresh`, {
        value: refreshToken,
      });

      console.log("✅ Token refresh successful");

      // Store updated tokens in localStorage
      const authData = response.data;
      try {
        // Get existing auth data to preserve user info
        const existingAuthData = JSON.parse(
          localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
        );

        // Update only token-related fields
        const updatedAuthData = {
          ...existingAuthData,
          access_token: authData.access_token,
          access_token_expiry_time: authData.access_token_expiry_date, // Note: backend uses expiry_date not expiry_time
          refresh_token: authData.refresh_token,
          refresh_token_expiry_time: authData.refresh_token_expiry_date, // Note: backend uses expiry_date not expiry_time
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedAuthData));

        // Log the new token expiry time
        console.log(
          "⏰ New access token expires at:",
          new Date(authData.access_token_expiry_date).toLocaleString(),
        );
      } catch (error) {
        console.error("📝 Failed to update tokens in storage", error);
      }

      // Update authorization header
      originalRequest.headers["Authorization"] = `JWT ${authData.access_token}`;

      // Process queue of pending requests
      processQueue(null, authData.access_token);

      return axiosClient(originalRequest);
    } catch (refreshError) {
      // Add detailed logging for refresh errors
      console.error("❌ Token refresh failed:", {
        status: refreshError.response?.status,
        data: refreshError.response?.data,
        requestURL: `${API_BASE_URL}/token/refresh`,
        sentPayload: { value: refreshToken },
      });

      // Refresh failed, clear tokens and redirect to login
      localStorage.removeItem(AUTH_STORAGE_KEY);
      processQueue(refreshError, null);
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// Helper methods for public/private endpoints
export const publicEndpoint = (config) => {
  return {
    ...config,
    publicEndpoint: true,
  };
};

export default axiosClient;
