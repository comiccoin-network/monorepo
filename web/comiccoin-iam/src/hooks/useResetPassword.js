// monorepo/web/comiccoin-iam/src/hooks/useResetPassword.js
import { useState } from "react";
import { resetPassword } from "../api/endpoints/resetPasswordApi";

/**
 * Custom hook for handling password reset functionality
 * Uses the resetPassword API endpoint to reset a user's password
 */
export const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Reset the user's password with the verification code and new password
   * @param {Object} data - Password reset data including code and new password
   * @returns {Promise} Promise with the reset result
   */
  const resetUserPassword = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("🔄 Attempting to reset password with verification code");

      // Call the API function from resetPasswordApi.js
      const response = await resetPassword(data);

      console.log("✅ Password reset successful");
      setSuccess(true);
      return response;
    } catch (err) {
      console.error("❌ Password reset error:", err);

      // Format the error for consistent handling
      if (typeof err === "string") {
        setError({ message: err });
      } else if (err.message) {
        setError({ message: err.message });
      } else {
        setError({ message: "Failed to reset password. Please try again." });
      }

      // Re-throw the error so the component can handle it if needed
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset all state variables to their initial values
   */
  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    resetUserPassword,
    isLoading,
    error,
    success,
    resetState,
  };
};

export default useResetPassword;
