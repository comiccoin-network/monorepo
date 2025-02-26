// src/hooks/useClaimCoins.ts
import { useState, useCallback } from "react";
import claimCoinsService, { User } from "../services/claimCoinsService";

/**
 * Interface for the hook's return value
 */
interface UseClaimCoinsReturn {
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  claimCoins: () => Promise<User>;
  reset: () => void;
}

/**
 * Custom hook for claiming coins
 * Manages loading state, error handling, and success state
 *
 * @returns Object containing the claim function and related states
 */
export function useClaimCoins(): UseClaimCoinsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Reset the hook's state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  /**
   * Claim coins for the authenticated user
   * @returns Promise resolving to the updated user data
   */
  const claimCoins = useCallback(async (): Promise<User> => {
    try {
      // Reset states before starting the claim process
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      // Call the service function
      const userData = await claimCoinsService.claimCoins();

      // Update state to reflect success
      setIsSuccess(true);
      return userData;
    } catch (err) {
      // Handle and standardize error
      const processedError = err instanceof Error
        ? err
        : new Error("Failed to claim coins");

      setError(processedError);
      throw processedError;
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    isSuccess,
    claimCoins,
    reset
  };
}

export default useClaimCoins;
export type { User };
