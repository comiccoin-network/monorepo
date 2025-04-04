// monorepo/web/comiccoin-iam/src/hooks/useForgotPassword.js
import { useState } from "react";
import { requestPasswordReset } from "../api/endpoints/forgotPasswordApi";

/**
 * Custom hook for handling forgot password functionality
 * Uses the dedicated API endpoint for password reset
 */
export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState("");

  /**
   * Request a password reset email for the provided email address
   *
   * @param {string} email - Email address to send password reset to
   * @returns {Promise} Promise with the result
   */
  const sendPasswordResetEmail = async (email) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setEmailSentTo("");

    try {
      console.log("📧 Attempting to send password reset email to:", email);

      // Use the dedicated API function from forgotPasswordApi.js
      const response = await requestPasswordReset({ email });

      console.log("✅ Password reset email sent successfully");

      // Set success state and store email
      setEmailSentTo(email);
      setSuccess(true);

      return response;
    } catch (err) {
      console.error("❌ Password reset error:", err);

      // Set the error state using the formatted error from the API
      setError({
        message: err.message || "Failed to send password reset email",
        fieldErrors: err.fieldErrors || {},
      });

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
    setEmailSentTo("");
  };

  return {
    sendPasswordResetEmail,
    isLoading,
    error,
    success,
    emailSentTo,
    resetState,
  };
};

export default useForgotPassword;
