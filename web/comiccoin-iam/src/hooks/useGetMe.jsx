// src/hooks/useGetMe.js
import { useState, useCallback, useEffect } from "react";
import { useGetMe as useGetMeQuery } from "../api/endpoints/meGetApi";
import { useAuth } from "./useAuth";

/**
 * Custom hook for fetching and handling the current user data
 * Provides error handling and refetch capabilities
 *
 * @param {Object} options - Hook options
 * @returns {Object} Object containing user data, loading state, error state, and refetch function
 */
export function useGetMe(options = {}) {
  const [error, setError] = useState(null);
  const { user: authUser, updateUser: updateAuthUser } = useAuth();

  // Use the private query hook with error handling
  const {
    data: userData,
    isLoading,
    error: queryError,
    refetch,
  } = useGetMeQuery({
    // Prevent excessive refetching with longer stale time
    staleTime: 60000, // 1 minute
    ...options,
    onError: (err) => {
      // Format error consistently
      const apiError =
        err instanceof Error
          ? err
          : new Error(err?.message || "Failed to fetch user data");
      apiError.status = err?.response?.status;
      apiError.data = err?.response?.data;
      setError(apiError);

      // Call the original onError if provided
      if (options.onError) {
        options.onError(err);
      }
    },
    onSuccess: (data) => {
      // Log to debug
      console.log("🔄 useGetMe onSuccess - Fresh API data:", {
        apiProfile: data?.profile_verification_status,
        authProfile: authUser?.profile_verification_status,
        pathname: window.location.pathname,
      });

      // Important: Update the auth context with the fresh user data
      // This will update localStorage as well
      if (data && updateAuthUser) {
        updateAuthUser(data);
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });

  // Manually synchronize localStorage when we get fresh data
  useEffect(() => {
    if (userData) {
      try {
        // Get the current auth data from localStorage
        const AUTH_STORAGE_KEY = "auth_data";
        const currentAuthData = JSON.parse(
          localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
        );

        // Check if the profile status has changed
        if (
          currentAuthData.user?.profile_verification_status !==
          userData.profile_verification_status
        ) {
          console.log("🔄 Updating localStorage with new profile status:", {
            old: currentAuthData.user?.profile_verification_status,
            new: userData.profile_verification_status,
          });

          // Update the user object while preserving everything else
          const updatedAuthData = {
            ...currentAuthData,
            user: userData,
          };

          // Save back to localStorage
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify(updatedAuthData),
          );
        }
      } catch (err) {
        console.error("Error updating localStorage:", err);
      }
    }
  }, [userData]);

  // Function to manually refresh user data
  const refreshUser = useCallback(async () => {
    try {
      console.log("🔄 Manually refreshing user data");
      const freshData = await refetch();
      return freshData.data;
    } catch (err) {
      console.error("❌ Failed to refresh user data:", err);
      throw err;
    }
  }, [refetch]);

  return {
    user: userData || authUser, // Use API data first, fall back to auth context
    isLoading,
    error: error || queryError,
    refetch: refreshUser,
  };
}

export default useGetMe;
