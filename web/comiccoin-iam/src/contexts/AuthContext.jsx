// monorepo/web/comiccoin-iam/src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { loginUser } from "../api/endpoints/loginApi";

export const AuthContext = createContext(null);

// Key used for storing auth data in localStorage
const AUTH_STORAGE_KEY = "auth_data";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Debug auth data when component mounts
  useEffect(() => {
    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );
      console.log("🔐 Auth data loaded:", {
        hasAccessToken: !!authData.access_token,
        hasRefreshToken: !!authData.refresh_token,
        accessTokenExpiry: authData.access_token_expiry_time
          ? new Date(authData.access_token_expiry_time).toLocaleString()
          : "No expiry set",
        refreshTokenExpiry: authData.refresh_token_expiry_time
          ? new Date(authData.refresh_token_expiry_time).toLocaleString()
          : "No expiry set",
        timeNow: new Date().toLocaleString(),
        isAccessTokenExpired: authData.access_token_expiry_time
          ? new Date() > new Date(authData.access_token_expiry_time)
          : "Cannot determine",
      });
    } catch (error) {
      console.error("Error parsing auth data for debug:", error);
    }
  }, []);

  // Function to load user from storage
  const loadUserFromStorage = useCallback(() => {
    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );
      if (authData.user) {
        setUser(authData.user);
      }
    } catch (error) {
      console.error("Failed to load user from storage:", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for stored user on mount
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // Update tokens after refresh
  const updateTokens = useCallback((newAuthData) => {
    try {
      // Get existing auth data
      const existingAuthData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );

      // Update only the token-related fields
      const updatedAuthData = {
        ...existingAuthData,
        access_token: newAuthData.access_token,
        access_token_expiry_time: newAuthData.access_token_expiry_time,
        refresh_token: newAuthData.refresh_token,
        refresh_token_expiry_time: newAuthData.refresh_token_expiry_time,
      };

      // Save updated auth data
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedAuthData));

      console.log("🔄 Tokens updated successfully:", {
        accessTokenExpiry: new Date(
          newAuthData.access_token_expiry_time,
        ).toLocaleString(),
      });
    } catch (error) {
      console.error("Failed to update tokens:", error);
    }
  }, []);

  const updateUser = useCallback((newUserData) => {
    // Update user state
    setUser(newUserData);

    // Update in localStorage
    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );

      // Update the user property
      const updatedAuthData = {
        ...authData,
        user: newUserData,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedAuthData));
      console.log("👤 User data updated in storage");
    } catch (error) {
      console.error("❌ Failed to update user in storage:", error);
    }
  }, []);

  // Proactive token refresh mechanism
  useEffect(() => {
    if (!user) return;

    // Function to check and refresh token if it's close to expiring
    const checkTokenExpiry = () => {
      try {
        const authData = JSON.parse(
          localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
        );

        if (!authData.access_token_expiry_time) {
          console.log("⚠️ No access token expiry time set");
          return;
        }

        const expiryTime = new Date(
          authData.access_token_expiry_time,
        ).getTime();
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;

        console.log(
          "⏰ Access token expires in:",
          Math.round(timeUntilExpiry / 1000),
          "seconds",
        );

        // If token will expire in less than 1 minute, refresh it proactively
        if (timeUntilExpiry > 0 && timeUntilExpiry < 60000) {
          console.log("🔄 Proactively refreshing token before expiry");

          // Try all three payload formats
          refreshTokenWithAllFormats(authData.refresh_token);
        }
      } catch (error) {
        console.error("Error checking token expiry:", error);
      }
    };

    // Refresh token with all possible payload formats
    const refreshTokenWithAllFormats = async (refreshToken) => {
      try {
        // Use the correct payload format: { value: refreshToken }
        const response = await axiosClient.post("/token/refresh", {
          value: refreshToken,
        });
        console.log("✅ Proactive token refresh successful");

        // Make sure to handle the field names correctly from backend response
        // The backend uses access_token_expiry_date, not access_token_expiry_time
        const tokenData = {
          access_token: response.data.access_token,
          access_token_expiry_time: response.data.access_token_expiry_date,
          refresh_token: response.data.refresh_token,
          refresh_token_expiry_time: response.data.refresh_token_expiry_date,
        };

        updateTokens(tokenData);
      } catch (error) {
        console.error(
          "❌ Proactive token refresh failed:",
          error.response?.data || error.message,
        );
        // Only logout if refresh token is actually invalid/expired
        if (error.response?.status === 401) {
          console.log("🚪 Token refresh returned 401, logging out");
          logout();
        }
      }
    };

    // Check token status every 30 seconds
    const tokenCheckInterval = setInterval(checkTokenExpiry, 30000);

    // Run once immediately
    checkTokenExpiry();

    return () => clearInterval(tokenCheckInterval);
  }, [user, updateTokens]);

  // Login function - Updated to use the loginUser API function
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const data = await loginUser(credentials);

      // Log the expiry times
      console.log("🔐 Login successful, token details:", {
        accessTokenExpiry: data.access_token_expiry_time
          ? new Date(data.access_token_expiry_time).toLocaleString()
          : "Not set",
        refreshTokenExpiry: data.refresh_token_expiry_time
          ? new Date(data.refresh_token_expiry_time).toLocaleString()
          : "Not set",
      });

      // Store the complete auth data object exactly as received from the API
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));

      // Update user state with the user object
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Login failed:", error);

      // Pass field errors through if they exist
      if (error.fieldErrors) {
        throw {
          response: {
            data: error.fieldErrors,
            status: error.status,
          },
        };
      }

      // Otherwise pass the error as is
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);

    // Clear all queries to avoid showing private data after logout
    queryClient.clear();

    // Redirect to login page
    window.location.href = "/login";
  }, [queryClient]);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Get current access token
  const getAccessToken = useCallback(() => {
    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );
      return authData.access_token || null;
    } catch {
      return null;
    }
  }, []);

  // Get refresh token
  const getRefreshToken = useCallback(() => {
    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );
      return authData.refresh_token || null;
    } catch {
      return null;
    }
  }, []);

  // Check if access token is expired
  const isAccessTokenExpired = useCallback(() => {
    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );
      if (!authData.access_token_expiry_time) {
        return true;
      }

      const expiryTime = new Date(authData.access_token_expiry_time).getTime();
      return Date.now() >= expiryTime;
    } catch {
      return true;
    }
  }, []);

  const value = {
    user,
    updateUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getAccessToken,
    getRefreshToken,
    isAccessTokenExpired,
    updateTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
