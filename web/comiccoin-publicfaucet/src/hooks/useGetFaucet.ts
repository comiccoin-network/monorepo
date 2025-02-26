import { useState, useEffect, useCallback } from 'react';
import faucetService, { FaucetData } from '../services/faucetService';

interface UseFaucetOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseFaucetReturn {
  faucet: FaucetData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to manage faucet data fetching and caching
 * @param options - Configuration options for fetching faucet data
 * @returns Faucet data management object
 */
export function useGetFaucet({
  refreshInterval = 60000,
  enabled = true,
}: UseFaucetOptions = {}): UseFaucetReturn {
  const [faucet, setFaucet] = useState<FaucetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoized fetch function to prevent unnecessary recreations
  const fetchFaucetData = useCallback(async (force = false) => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await faucetService.getFaucetData(force);
      setFaucet(data);
    } catch (err) {
      const processedError = err instanceof Error
        ? err
        : new Error('Failed to fetch faucet data');

      setError(processedError);
      setFaucet(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]); // Only depends on enabled status

  // Initial fetch effect
  useEffect(() => {
    fetchFaucetData(true); // Force initial fetch
  }, [fetchFaucetData]); // Include fetchFaucetData in dependency array

  // Periodic refresh effect
  useEffect(() => {
    if (!enabled || !refreshInterval) return;

    const intervalId = setInterval(() => {
      fetchFaucetData();
    }, refreshInterval);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [enabled, refreshInterval, fetchFaucetData]); // Include all dependencies

  // Refetch method for manual refresh
  const refetch = () => fetchFaucetData(true);

  return {
    faucet,
    isLoading,
    error,
    refetch,
  };
}

export default useGetFaucet;
