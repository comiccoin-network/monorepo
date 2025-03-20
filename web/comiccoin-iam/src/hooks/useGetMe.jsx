// src/hooks/useGetMe.js
import { useState, useCallback } from "react";
import { useGetMe as useGetMeQuery } from "../api/endpoints/meGetApi";
import { useAuth } from "./useAuth";

/**
 * Custom hook for fetching and handling the current user data
 * Provides error handling and refetch capabilities
 *
 * @param {Object} options - Hook options
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {number} options.retry - Number of retries before giving up
 * @returns {Object} Object containing user data, loading state, error state, and refetch function
 */
export function useGetMe(options = {}) {
  const [error, setError] = useState(null);
  const { updateUser: updateAuthUser } = useAuth();

  // Use the private query hook with error handling
  const {
    data: user,
    isLoading,
    error: queryError,
    refetch,
  } = useGetMeQuery({
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
      // Update the auth context with the fresh user data
      if (data && updateAuthUser) {
        updateAuthUser(data);
      }

      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });

  // Function to manually refresh user data
  const refreshUser = useCallback(async () => {
    try {
      console.log("🔄 Refreshing user data");
      const freshData = await refetch();
      return freshData.data;
    } catch (err) {
      console.error("❌ Failed to refresh user data:", err);
      throw err;
    }
  }, [refetch]);

  return {
    user: user || null,
    isLoading,
    error: error || queryError,
    refetch: refreshUser,
  };
}

export default useGetMe;
