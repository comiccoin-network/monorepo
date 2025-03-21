// src/api/endpoints/verifyProfileApi.js
import { useState, useCallback } from "react";
import { usePrivateMutation } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

/**
 * Custom hook for submitting profile verification data
 *
 * @param {Object} options - Hook options
 * @returns {Object} Object containing verification functions and state
 */
export function useVerifyProfile(options = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { updateUser } = useAuth();

  // Use the private mutation hook
  const {
    mutateAsync,
    isLoading: isMutating,
    error: apiError,
  } = usePrivateMutation("/me/verify-profile", "post", {
    // Invalidate me and user queries to refresh user data after verification
    invalidateQueries: ["me", "user"],
    ...options,
  });

  /**
   * Submit profile verification data to the API
   *
   * @param {Object} data - Profile verification data
   * @param {number} [userRole] - Optional explicit user role (3 for Customer, 2 for Retailer)
   * @returns {Promise<Object>} Promise resolving to the response data
   */
  const verifyProfile = useCallback(
    async (data) => {
      console.log("🔄 Starting profile verification process");

      // Reset states
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        // Make the API call
        const response = await mutateAsync(data);

        console.log("✅ Profile verification submitted successfully", response);

        // Update success state
        setSuccess(true);

        // If the response includes user data, update user in auth context
        if (response?.user && updateUser) {
          updateUser(response.user);
        }

        return response;
      } catch (err) {
        console.error("❌ Profile verification error:", err);

        // Check if the error has a validation response (usually 400 status)
        if (err.response?.status === 400 && err.response.data) {
          console.log("Validation errors from API:", err.response.data);

          // Pass through the validation errors from the backend
          // We'll let the hook handle the transformation from snake_case to camelCase
          throw err;
        }

        // Format error message for all other errors
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to submit profile verification";

        // Set error state
        setError(new Error(errorMessage));

        // Re-throw for component handling
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [mutateAsync, updateUser],
  );

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    verifyProfile,
    isLoading: isLoading || isMutating,
    error: error || apiError,
    success,
    reset,
  };
}

export default { useVerifyProfile };
