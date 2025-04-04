// monorepo/web/comiccoin-iam/src/hooks/useEmailVerification.js
import { useState, useCallback } from "react";
import { verifyEmail } from "../api/endpoints/emailVerificationApi";

/**
 * Custom hook for email verification
 * @param {Function} onSuccess - Optional callback for successful verification
 * @param {Function} onError - Optional callback for verification error
 * @param {Function} onDone - Optional callback when verification is complete regardless of outcome
 * @returns {Object} An object with verification methods and state
 */
export const useEmailVerification = (onSuccess, onError, onDone) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Verify email with the given code
   * @param {string} code - Verification code to send
   */
  const verifyEmailFn = useCallback(
    async (code) => {
      // Skip if already loading
      if (isLoading) return;

      // Reset previous state
      setError(null);
      setIsLoading(true);

      try {
        // Call the verification API
        const result = await verifyEmail(code);

        // Call success callback if provided
        if (onSuccess && typeof onSuccess === "function") {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        // Handle and set error
        const errorMessage = err.message || "Verification failed";
        setError(errorMessage);

        // Call error callback if provided
        if (onError && typeof onError === "function") {
          onError(errorMessage);
        }

        throw err;
      } finally {
        // Always set loading to false
        setIsLoading(false);

        // Call done callback if provided
        if (onDone && typeof onDone === "function") {
          onDone();
        }
      }
    },
    [isLoading, onSuccess, onError, onDone],
  );

  /**
   * Reset the hook's state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    verifyEmail: verifyEmailFn,
    reset,
  };
};

export default useEmailVerification;
