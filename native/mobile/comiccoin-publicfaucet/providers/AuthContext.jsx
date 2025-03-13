// AuthContext.jsx - Core authentication provider that manages user state, token handling, and iOS tracking preferences
import { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import { Platform, AppState } from "react-native";
import { getTrackingPermissionsAsync } from "expo-tracking-transparency";

import {
  AUTH_STORAGE_KEY,
  saveData,
  loadData,
  removeData,
  updateData,
} from "../utils/secureStorage";

// Create context to share authentication state throughout the app
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null); // User state storage
  const [isLoading, setIsLoading] = useState(true); // Loading state to track authentication initialization
  const queryClient = useQueryClient(); // Access to React Query cache for data invalidation

  // ******************************************************
  // DEBUGGING USEEFFECT
  // Purpose: Logs authentication data details for debugging
  // Runs: On component mount only
  // ******************************************************
  useEffect(() => {
    const debugAuthData = async () => {
      try {
        // Load authentication data from secure storage
        const authData = (await loadData(AUTH_STORAGE_KEY)) || {};

        // Output detailed debug information about tokens and expiry times
        console.log("🔐 Auth data loaded:", {
          hasAccessToken: !!authData.access_token, // Boolean indicating if access token exists
          hasRefreshToken: !!authData.refresh_token, // Boolean indicating if refresh token exists
          accessTokenExpiry: authData.access_token_expiry_time
            ? new Date(authData.access_token_expiry_time).toLocaleString()
            : "No expiry set", // Formatted date of access token expiry
          refreshTokenExpiry: authData.refresh_token_expiry_time
            ? new Date(authData.refresh_token_expiry_time).toLocaleString()
            : "No expiry set", // Formatted date of refresh token expiry
          timeNow: new Date().toLocaleString(), // Current time for comparison
          isAccessTokenExpired: authData.access_token_expiry_time
            ? new Date() > new Date(authData.access_token_expiry_time)
            : "Cannot determine", // Whether the access token is expired
        });
      } catch (error) {
        console.log("Error parsing auth data for debug:", error);
      }
    };

    // Execute the debug function on mount
    debugAuthData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // ******************************************************
  // USER LOADING FUNCTION
  // Purpose: Loads user data from secure storage
  // Returns: None (sets user state and isLoading flag)
  // ******************************************************
  const loadUserFromStorage = useCallback(async () => {
    try {
      // Attempt to retrieve authentication data from secure storage
      const authData = (await loadData(AUTH_STORAGE_KEY)) || {};

      // If user data exists, update the user state
      if (authData.user) {
        setUser(authData.user);
      }
    } catch (error) {
      console.log("Failed to load user from storage:", error);
      // Clear potentially corrupted auth data
      await removeData(AUTH_STORAGE_KEY);
    } finally {
      // Set loading to false regardless of outcome
      setIsLoading(false);
    }
  }, []); // No dependencies needed as this uses only external storage

  // ******************************************************
  // USER LOADING USEEFFECT
  // Purpose: Initializes user state from secure storage
  // Runs: Once when component mounts
  // ******************************************************
  useEffect(() => {
    loadUserFromStorage(); // Load user data when component mounts
  }, [loadUserFromStorage]); // Dependency on the memoized function

  // ******************************************************
  // TOKEN UPDATE FUNCTION
  // Purpose: Updates only token information in secure storage
  // Params: newAuthData - Object containing new token information
  // ******************************************************
  const updateTokens = useCallback(async (newAuthData) => {
    try {
      // Update only token-related fields in secure storage
      await updateData(AUTH_STORAGE_KEY, {
        access_token: newAuthData.access_token,
        access_token_expiry_time: newAuthData.access_token_expiry_time,
        refresh_token: newAuthData.refresh_token,
        refresh_token_expiry_time: newAuthData.refresh_token_expiry_time,
      });

      console.log("🔄 Tokens updated successfully:", {
        accessTokenExpiry: new Date(
          newAuthData.access_token_expiry_time,
        ).toLocaleString(), // Log the formatted expiry time
      });
    } catch (error) {
      console.log("Failed to update tokens:", error);
    }
  }, []); // No dependencies needed as this uses only external storage

  // ******************************************************
  // USER UPDATE FUNCTION
  // Purpose: Updates user state and persists to secure storage
  // Params: newUserData - Updated user object
  // ******************************************************
  const updateUser = useCallback(async (newUserData) => {
    // First update the in-memory user state
    setUser(newUserData);

    // Then update user data in secure storage
    try {
      await updateData(AUTH_STORAGE_KEY, { user: newUserData });
      console.log("👤 User data updated in storage");
    } catch (error) {
      console.log("❌ Failed to update user in storage:", error);
      // Note: We don't revert the state if storage fails
      // Could consider an approach that keeps state and storage in sync
    }
  }, []); // No dependencies needed

  // ******************************************************
  // TOKEN REFRESH USEEFFECT
  // Purpose: Proactively refreshes tokens before they expire
  // Runs: When user changes and every 30 seconds while mounted
  // ******************************************************
  useEffect(() => {
    // Only run token refresh logic if user is logged in
    if (!user) return;

    // Function to check if token needs refreshing
    const checkTokenExpiry = async () => {
      try {
        // Load auth data from secure storage
        const authData = (await loadData(AUTH_STORAGE_KEY)) || {};

        // Early exit if no expiry time is set
        if (!authData.access_token_expiry_time) {
          console.log("⚠️ No access token expiry time set");
          return;
        }

        // Calculate time until expiry in milliseconds
        const expiryTime = new Date(
          authData.access_token_expiry_time,
        ).getTime();
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;

        console.log(
          "⏰ Access token expires in:",
          Math.round(timeUntilExpiry / 1000), // Convert to seconds for readability
          "seconds",
        );

        // If token will expire in less than 1 minute (60000ms), refresh it
        if (timeUntilExpiry > 0 && timeUntilExpiry < 60000) {
          console.log("🔄 Proactively refreshing token before expiry");
          await refreshTokenWithAllFormats(authData.refresh_token);
        }
      } catch (error) {
        console.log("Error checking token expiry:", error);
      }
    };

    // Function to refresh token using correct payload format
    const refreshTokenWithAllFormats = async (refreshToken) => {
      try {
        // Send refresh token request with correct payload structure
        const response = await axiosClient.post("/token/refresh", {
          value: refreshToken, // Backend expects {value: token} format
        });
        console.log("✅ Proactive token refresh successful");

        // Extract token data from response with field name mapping
        // Backend uses expiry_date while client uses expiry_time
        const tokenData = {
          access_token: response.data.access_token,
          access_token_expiry_time: response.data.access_token_expiry_date,
          refresh_token: response.data.refresh_token,
          refresh_token_expiry_time: response.data.refresh_token_expiry_date,
        };

        // Update tokens in secure storage
        await updateTokens(tokenData);
      } catch (error) {
        console.log(
          "❌ Proactive token refresh failed:",
          error.response?.data || error.message,
        );
        // Only logout if refresh token is actually invalid (401 Unauthorized)
        if (error.response?.status === 401) {
          console.log("🚪 Token refresh returned 401, logging out");
          await logout();
        }
      }
    };

    // Set up interval to check token expiry every 30 seconds
    const tokenCheckInterval = setInterval(checkTokenExpiry, 30000);

    // Also check immediately on effect initialization
    checkTokenExpiry();

    // Clean up interval when component unmounts or user changes
    return () => clearInterval(tokenCheckInterval);
  }, [user, updateTokens]); // Dependencies: user state and updateTokens function

  // ******************************************************
  // LOGIN FUNCTION
  // Purpose: Authenticates user and stores credentials
  // Params: credentials - Object with email and password
  // Returns: User object on success, throws error on failure
  // ******************************************************
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      // Attempt login with provided credentials
      const { data } = await axiosClient.post("/login", credentials);

      // Log token information for debugging
      console.log("🔐 Login successful, token details:", {
        accessTokenExpiry: data.access_token_expiry_time
          ? new Date(data.access_token_expiry_time).toLocaleString()
          : "Not set",
        refreshTokenExpiry: data.refresh_token_expiry_time
          ? new Date(data.refresh_token_expiry_time).toLocaleString()
          : "Not set",
      });

      // Store complete auth data in secure storage
      await saveData(AUTH_STORAGE_KEY, data);

      // Update user state
      setUser(data.user);

      // Navigate to dashboard after successful login
      router.replace("/(tabs)/dashboard");

      return data.user;
    } catch (error) {
      console.log("Login failed:", error);
      throw error; // Re-throw error for caller to handle
    } finally {
      setIsLoading(false); // Always reset loading state
    }
  };

  // ******************************************************
  // LOGOUT FUNCTION
  // Purpose: Clears authentication state and navigates to login
  // Returns: Promise that resolves when logout is complete
  // ******************************************************
  const logout = useCallback(async () => {
    console.log("🚪 Logging out and resetting navigation...");

    // Clear authentication data from secure storage
    await removeData(AUTH_STORAGE_KEY);

    // Update state to trigger auth change in UI
    setUser(null);

    // Clear all React Query cache data
    queryClient.clear();

    // Navigate back to login/home screen
    try {
      // Reset to root route
      router.replace("/");

      // Additional navigation with delay to ensure state updates first
      setTimeout(() => {
        console.log("🔄 Navigation redirecting to initial screen...");
        router.replace("/");
      }, 100);
    } catch (error) {
      console.error("Navigation error during logout:", error);
      // Fallback direct navigation if the replace fails
      router.push("/");
    }
  }, [queryClient, router]); // Dependencies: queryClient and router instances

  // ******************************************************
  // Authentication helper functions
  // These provide convenient access to auth state for components
  // ******************************************************

  // Simple boolean check if user is logged in
  const isAuthenticated = !!user;

  // Get current access token from secure storage
  const getAccessToken = useCallback(async () => {
    try {
      const authData = (await loadData(AUTH_STORAGE_KEY)) || {};
      return authData.access_token || null;
    } catch {
      return null;
    }
  }, []);

  // Get current refresh token from secure storage
  const getRefreshToken = useCallback(async () => {
    try {
      const authData = (await loadData(AUTH_STORAGE_KEY)) || {};
      return authData.refresh_token || null;
    } catch {
      return null;
    }
  }, []);

  // Check if access token is expired based on stored expiry time
  const isAccessTokenExpired = useCallback(async () => {
    try {
      const authData = (await loadData(AUTH_STORAGE_KEY)) || {};

      if (!authData.access_token_expiry_time) {
        return true; // No expiry time means we should consider it expired
      }

      const expiryTime = new Date(authData.access_token_expiry_time).getTime();
      return Date.now() >= expiryTime; // Compare current time to expiry time
    } catch {
      return true; // On any error, assume token is expired
    }
  }, []);

  // Create the context value object to be provided to consumers
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

  // ******************************************************
  // iOS TRACKING PREFERENCE SYNC USEEFFECT
  // Purpose: Synchronizes iOS tracking permissions with user profile
  // Runs: When user changes and when app comes to foreground
  // ******************************************************
  useEffect(() => {
    // Only relevant for iOS platform and when user is logged in
    if (Platform.OS !== "ios" || !user) return;

    // Function to check and update tracking preferences if needed
    const checkAndUpdateTrackingPreference = async () => {
      try {
        // Get current iOS tracking permission status from system settings
        const { status } = await getTrackingPermissionsAsync();
        const isTrackingAllowed = status === "granted";

        // Get current user preference from user state
        const currentPreference =
          !!user.agree_to_tracking_across_third_party_apps_and_services;

        console.log("🔍 Tracking status check:", {
          iosPermission: isTrackingAllowed, // iOS system setting
          userSetting: currentPreference, // User's profile setting
        });

        // If user's iOS privacy setting doesn't match their profile setting
        if (isTrackingAllowed !== currentPreference) {
          console.log(
            "🔄 Updating user profile to match iOS tracking settings...",
          );

          try {
            // Create complete user update object with all fields
            const updateData = {
              // Include all necessary user profile fields
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              phone: user.phone || null,
              country: user.country || null,
              timezone: user.timezone || "",
              wallet_address: user.wallet_address || "",
              agree_promotions: user.agree_promotions || false,
              // Update only the tracking preference to match iOS setting
              agree_to_tracking_across_third_party_apps_and_services:
                isTrackingAllowed,
            };

            console.log(
              "📤 Sending complete profile update with new tracking preference",
            );

            // Make API call to update user profile on backend with complete data
            const response = await axiosClient.put("/me", updateData);

            // If update successful, update local user state to match
            if (response.data) {
              console.log("✅ API update successful, response:", response.data);

              const updatedUser = {
                ...user,
                agree_to_tracking_across_third_party_apps_and_services:
                  isTrackingAllowed,
              };

              // Update in-memory state and secure storage
              updateUser(updatedUser);
              console.log(
                "🎉 Successfully synced tracking preference with iOS settings",
              );
            }
          } catch (error) {
            console.error("❌ Failed to update tracking preference:", error);
            console.log("📋 Error details:", {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            });
          }
        } else {
          console.log(
            "👍 Tracking preferences already in sync - no update needed",
          );
        }
      } catch (error) {
        console.error("⚠️ Error checking tracking permission:", error);
      }
    };

    // Set up AppState event listener to detect when app comes to foreground
    console.log("🔊 Setting up iOS tracking sync listener");
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        // When app becomes active (comes to foreground), check tracking settings
        console.log("📱 App came to foreground - checking tracking settings");
        checkAndUpdateTrackingPreference();
      }
    });

    // Run initial check when component mounts or user changes
    console.log("🚀 Running initial tracking permission check");
    checkAndUpdateTrackingPreference();

    // Clean up the AppState subscription on unmount
    return () => {
      console.log("🧹 Cleaning up tracking sync listener");
      subscription.remove();
    };
  }, [user, updateUser]); // Dependencies on user state and updateUser function

  // Provide the auth context to the component tree
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
