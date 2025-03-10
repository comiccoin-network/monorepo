// contexts/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import {
  AUTH_STORAGE_KEY,
  saveData,
  loadData,
  removeData,
  updateData,
} from "../utils/secureStorage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Debug auth data when component mounts
  useEffect(() => {
    const debugAuthData = async () => {
      try {
        const authData = (await loadData(AUTH_STORAGE_KEY)) || {};

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
        console.log("Error parsing auth data for debug:", error);
      }
    };

    debugAuthData();
  }, []);

  // Function to load user from storage
  const loadUserFromStorage = useCallback(async () => {
    try {
      const authData = (await loadData(AUTH_STORAGE_KEY)) || {};

      if (authData.user) {
        setUser(authData.user);
      }
    } catch (error) {
      console.log("Failed to load user from storage:", error);
      await removeData(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for stored user on mount
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // Update tokens after refresh
  const updateTokens = useCallback(async (newAuthData) => {
    try {
      // Update only the token-related fields using our new updateData function
      await updateData(AUTH_STORAGE_KEY, {
        access_token: newAuthData.access_token,
        access_token_expiry_time: newAuthData.access_token_expiry_time,
        refresh_token: newAuthData.refresh_token,
        refresh_token_expiry_time: newAuthData.refresh_token_expiry_time,
      });

      console.log("🔄 Tokens updated successfully:", {
        accessTokenExpiry: new Date(
          newAuthData.access_token_expiry_time,
        ).toLocaleString(),
      });
    } catch (error) {
      console.log("Failed to update tokens:", error);
    }
  }, []);

  const updateUser = useCallback(async (newUserData) => {
    // Update user state
    setUser(newUserData);

    // Update in SecureStorage
    try {
      await updateData(AUTH_STORAGE_KEY, { user: newUserData });
      console.log("👤 User data updated in storage");
    } catch (error) {
      console.log("❌ Failed to update user in storage:", error);
    }
  }, []);

  // Proactive token refresh mechanism
  useEffect(() => {
    if (!user) return;

    // Function to check and refresh token if it's close to expiring
    const checkTokenExpiry = async () => {
      try {
        const authData = (await loadData(AUTH_STORAGE_KEY)) || {};

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

          // Try with the correct payload format
          await refreshTokenWithAllFormats(authData.refresh_token);
        }
      } catch (error) {
        console.log("Error checking token expiry:", error);
      }
    };

    // Refresh token with correct payload format
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

        await updateTokens(tokenData);
      } catch (error) {
        console.log(
          "❌ Proactive token refresh failed:",
          error.response?.data || error.message,
        );
        // Only logout if refresh token is actually invalid/expired
        if (error.response?.status === 401) {
          console.log("🚪 Token refresh returned 401, logging out");
          await logout();
        }
      }
    };

    // Check token status every 30 seconds
    const tokenCheckInterval = setInterval(checkTokenExpiry, 30000);

    // Run once immediately
    checkTokenExpiry();

    return () => clearInterval(tokenCheckInterval);
  }, [user, updateTokens]);

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const { data } = await axiosClient.post("/login", credentials);

      // Log the expiry times
      console.log("🔐 Login successful, token details:", {
        accessTokenExpiry: data.access_token_expiry_time
          ? new Date(data.access_token_expiry_time).toLocaleString()
          : "Not set",
        refreshTokenExpiry: data.refresh_token_expiry_time
          ? new Date(data.refresh_token_expiry_time).toLocaleString()
          : "Not set",
      });

      // Store the complete auth data object with our secure storage
      await saveData(AUTH_STORAGE_KEY, data);

      // Update user state with the user object
      setUser(data.user);

      // Navigate to home screen after successful login
      router.replace("/(tabs)/dashboard");

      return data.user;
    } catch (error) {
      console.log("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(async () => {
    console.log("🚪 Logging out and resetting navigation...");

    // First clear the stored data with our new secure storage method
    await removeData(AUTH_STORAGE_KEY);

    // Then update state to trigger auth change
    setUser(null);

    // Clear all queries
    queryClient.clear();

    // Use a more forceful navigation reset approach
    try {
      // Reset to root route
      router.replace("/");

      // Add a small delay before navigation to ensure state updates first
      setTimeout(() => {
        console.log("🔄 Navigation redirecting to initial screen...");
        router.replace("/");
      }, 100);
    } catch (error) {
      console.error("Navigation error during logout:", error);
      // Fallback direct navigation
      router.push("/");
    }
  }, [queryClient, router]);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Get current access token
  const getAccessToken = useCallback(async () => {
    try {
      const authData = (await loadData(AUTH_STORAGE_KEY)) || {};
      return authData.access_token || null;
    } catch {
      return null;
    }
  }, []);

  // Get refresh token
  const getRefreshToken = useCallback(async () => {
    try {
      const authData = (await loadData(AUTH_STORAGE_KEY)) || {};
      return authData.refresh_token || null;
    } catch {
      return null;
    }
  }, []);

  // Check if access token is expired
  const isAccessTokenExpired = useCallback(async () => {
    try {
      const authData = (await loadData(AUTH_STORAGE_KEY)) || {};

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
