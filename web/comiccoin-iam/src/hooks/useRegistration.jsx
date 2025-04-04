// monorepo/web/comiccoin-iam/src/hooks/useRegistration.js
import { useState } from "react";
import registrationApi from "../api/endpoints/registrationApi";

/**
 * Custom hook for handling user registration functionality
 */
export const useRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Register a new user
   * @param {Object} data Registration form data
   * @returns {Promise} Promise with registration result
   */
  const register = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Call the registration API
      const response = await registrationApi.registerCustomer(data);

      setSuccess(true);
      return response;
    } catch (err) {
      // Set the error state
      const registrationError = err;
      setError(registrationError);

      // Re-throw the error so the component can handle it if needed
      throw registrationError;
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
    register,
    isLoading,
    error,
    success,
    resetState,
  };
};

export default useRegistration;
