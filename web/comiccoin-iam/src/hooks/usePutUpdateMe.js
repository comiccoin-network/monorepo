// src/hooks/usePutUpdateMe.js
import { useState, useCallback } from "react";
import { useUpdateMe, prepareUserDataForApi } from "../api/endpoints/userApi";
import { useAuth } from "./useAuth";

/**
 * Custom hook for updating user profile information
 * Provides a clean interface with loading, error and success states
 *
 * @returns {Object} An object containing update function, loading state,
 * error state, success state, and reset function
 */
export function usePutUpdateMe() {
  // Get the mutation hook from API endpoints
  const { mutateAsync, isLoading: isMutating } = useUpdateMe();
  const { updateUser } = useAuth();

  // Additional state management for the update process
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset the hook's state to initial values
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  // Main function to update user profile
  const updateMe = useCallback(
    async (data) => {
      try {
        console.log("🔄 UPDATE PROFILE: Starting update process", {
          email: data.email,
        });

        // Reset states before starting the update
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        // Clean the data to remove null or undefined values
        const cleanData = prepareUserDataForApi(data);

        console.log("📡 UPDATE PROFILE: Calling API");

        // Use the mutation hook to handle the update
        const updatedUser = await mutateAsync(cleanData);

        console.log("✅ UPDATE PROFILE: Success", {
          email: updatedUser.email,
        });

        // Update the user in the auth context if available
        if (updateUser && typeof updateUser === "function") {
          updateUser(updatedUser);
        }

        // Update states to reflect successful update
        setIsSuccess(true);
        setError(null);

        return updatedUser;
      } catch (err) {
        console.error("❌ UPDATE PROFILE: Error occurred", {
          error: err?.message || "Unknown error",
          status: err?.response?.status,
          details: err?.response?.data,
        });

        // Standardize error handling
        const errorObj =
          err instanceof Error
            ? err
            : new Error(err?.message || "Failed to update profile");

        setError(errorObj);
        setIsSuccess(false);

        throw errorObj;
      } finally {
        // Ensure loading state is reset
        setIsLoading(false);
      }
    },
    [mutateAsync, updateUser],
  );

  // Return hook interface
  return {
    updateMe,
    isLoading: isLoading || isMutating,
    error,
    isSuccess,
    reset,
  };
}

export default usePutUpdateMe;
