// src/api/endpoints/deleteMeApi.js
import { useState, useCallback } from "react";
import { usePrivateMutation } from "../../hooks/useApi";
import { useAuth } from "../../hooks/useAuth";

/**
 * Custom hook for deleting the current user's account
 * Handles password validation and account deletion through the API
 *
 * @param {Object} options - Optional configuration options
 * @returns {Object} Object containing the delete function, loading state, and error state
 */
export function useDeleteAccount(options = {}) {
  const [error, setError] = useState(null);
  const { logout } = useAuth();

  // Use the privateMutation hook from API utilities
  // We're using the DELETE method and targeting the /me endpoint
  const {
    mutateAsync,
    isLoading,
    error: apiError,
  } = usePrivateMutation("/me", "delete", {
    // Set the default options
    onSuccess: () => {
      // On successful deletion, log the user out
      logout();
    },
    // Add any specific options passed by the caller
    ...options,
  });

  /**
   * Delete the user's account by sending a DELETE request with password confirmation
   * The API endpoint will return a 204 status code on success (no content)
   *
   * @param {string} password - The user's password for confirmation
   * @returns {Promise<boolean>} Promise resolving to a boolean indicating success
   */
  const deleteAccount = useCallback(
    async (password) => {
      console.log("🔄 Starting account deletion process");

      // Clear any previous errors
      setError(null);

      try {
        // Validate input
        if (!password) {
          throw new Error("Password is required to confirm account deletion");
        }

        // Make the API call with password in the request body
        // The DELETE method can have a request body even though it's less common
        await mutateAsync({ password });

        console.log("✅ Account deleted successfully");

        // The mutateAsync will return undefined for 204 responses (success, no content)
        // We'll return true to indicate success
        return true;
      } catch (err) {
        console.error("❌ Account deletion error:", err);

        // Extract the actual error message from the API response
        let errorMessage = "Failed to delete account";

        // Check for Axios error with response data
        if (err.response && err.response.data) {
          // Log the entire response for debugging
          console.log("API Error Details:", err.response.data);

          // Extract the message from the response data
          if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (typeof err.response.data === "string") {
            errorMessage = err.response.data;
          } else {
            // If it's an object but doesn't have a message property
            errorMessage = JSON.stringify(err.response.data);
          }
        } else if (err.message) {
          // If there's no response data but there is an error message
          errorMessage = err.message;
        }

        // Create a new error with the extracted message
        const formattedError = new Error(errorMessage);

        // Copy any useful properties from the original error
        if (err.status) formattedError.status = err.status;
        if (err.response) formattedError.response = err.response;

        setError(formattedError);
        return false;
      }
    },
    [mutateAsync, logout],
  );

  return {
    deleteAccount,
    isDeleting: isLoading,
    error: error || apiError,
  };
}

export default { useDeleteAccount };
