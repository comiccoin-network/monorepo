// src/hooks/useRegistration.jsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import registrationApi from "../api/endpoints/registrationApi";

/**
 * Custom hook for handling user registration functionality
 */
export const useRegistration = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Use React Query's useMutation for better caching and state management
  const {
    mutate: register,
    isLoading,
    isError,
    isSuccess,
    reset: resetMutation,
  } = useMutation({
    mutationFn: (data) => registrationApi.registerUser(data),
    onSuccess: (data) => {
      setSuccess(true);
      return data;
    },
    onError: (err) => {
      setError(err);
    },
  });

  /**
   * Resend verification email
   */
  const {
    mutate: resendVerification,
    isLoading: isResending,
    isError: isResendError,
    isSuccess: isResendSuccess,
    reset: resetResend,
  } = useMutation({
    mutationFn: (email) => registrationApi.resendVerificationEmail(email),
  });

  /**
   * Reset all state variables to their initial values
   */
  const resetState = () => {
    setError(null);
    setSuccess(false);
    resetMutation();
    resetResend();
  };

  return {
    register,
    resendVerification,
    isLoading,
    isResending,
    error,
    success,
    isError,
    isSuccess,
    isResendError,
    isResendSuccess,
    resetState,
  };
};

export default useRegistration;
