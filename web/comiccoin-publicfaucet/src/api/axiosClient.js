// src/api/axiosClient.js
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_DOMAIN}/publicfaucet/api/v1`;
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
  (config) => {
    // Don't add token for auth endpoints or public endpoints
    if (
      config.url.includes("/login") ||
      config.url.includes("/token/refresh") ||
      config.publicEndpoint
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
      console.error("Error adding auth header:", error);
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

    let refreshToken;
    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );
      refreshToken = authData.refresh_token;
    } catch (error) {
      refreshToken = null;
    }

    if (!refreshToken) {
      // No refresh token available, redirect to login
      localStorage.removeItem(AUTH_STORAGE_KEY);
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // If already refreshing, add this request to queue
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
      // Try to refresh the token
      const response = await axios.post(
        `${API_BASE_URL}/publicfaucet/api/v1/token/refresh`,
        {
          refreshToken,
        },
      );

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
          access_token_expiry_time: authData.access_token_expiry_time,
          refresh_token: authData.refresh_token,
          refresh_token_expiry_time: authData.refresh_token_expiry_time,
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedAuthData));
      } catch (error) {
        console.error("Failed to update tokens in storage", error);
      }

      // Update authorization header
      originalRequest.headers["Authorization"] = `JWT ${authData.access_token}`;

      // Process queue of pending requests
      processQueue(null, authData.access_token);

      return axiosClient(originalRequest);
    } catch (refreshError) {
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
