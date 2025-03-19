// src/hooks/useForgotPassword.js
import { useState } from "react";

/**
 * Custom hook for handling forgot password functionality
 * Provides a mock implementation for password reset
 */
export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState("");

  /**
   * Request a password reset email for the provided email address
   * This is a mock implementation that doesn't make actual API calls
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

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simple email validation
      if (!email.includes("@") || !email.includes(".")) {
        throw new Error("Please enter a valid email address.");
      }

      // Set success state and store email
      setEmailSentTo(email);
      setSuccess(true);

      return { success: true, email };
    } catch (err) {
      // Format and set the error state
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
