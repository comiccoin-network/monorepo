// src/api/axiosClient.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config";

const API_BASE_URL = `${config.PUBLICFAUCET_URL}/publicfaucet/api/v1`;
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

// Request interceptor - adds authentication token to requests
axiosClient.interceptors.request.use(
  async (config) => {
    // Don't add token for auth endpoints or public endpoints
    if (
      config.url.includes("/login") ||
      config.url.includes("/token/refresh") ||
      config.publicEndpoint
    ) {
      return config;
    }

    try {
      const authDataJson = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const authData = authDataJson ? JSON.parse(authDataJson) : {};

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
      originalRequest.url?.includes("/token/refresh") ||
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
      const authDataJson = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const authData = authDataJson ? JSON.parse(authDataJson) : {};
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
      // No refresh token available - React Native can't use window.location.href
      // Instead, we'll let the auth context handle navigation later
      console.log("⚠️ No refresh token available, triggering logout");
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
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

      // Store updated tokens in AsyncStorage (React Native's equivalent of localStorage)
      const authData = response.data;
      try {
        // Get existing auth data to preserve user info
        const existingAuthDataJson =
          await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const existingAuthData = existingAuthDataJson
          ? JSON.parse(existingAuthDataJson)
          : {};

        // Update only token-related fields
        const updatedAuthData = {
          ...existingAuthData,
          access_token: authData.access_token,
          access_token_expiry_time: authData.access_token_expiry_date, // Note: backend uses expiry_date not expiry_time
          refresh_token: authData.refresh_token,
          refresh_token_expiry_time: authData.refresh_token_expiry_date, // Note: backend uses expiry_date not expiry_time
        };

        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify(updatedAuthData),
        );

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

      // Refresh failed, clear tokens
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      processQueue(refreshError, null);

      // In React Native, we don't use window.location.href
      // Navigation to login will be handled by the auth context
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
