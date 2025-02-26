import { useState, useEffect } from "react";
import faucetService, { FaucetDTO, fallbackData } from "../services/faucetService";

interface UseGetFaucetOptions {
  enabled?: boolean;
  refreshInterval?: number;
  useFallbackOnError?: boolean;
}

interface UseGetFaucetReturn {
  faucet: FaucetDTO | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch faucet data for a specific chain ID using the faucet service
 *
 * @param chainId - The ID of the blockchain network
 * @param options - Configuration options for the hook
 * @returns Object containing faucet data, loading state, error state, and refetch function
 */
export function useGetFaucet(
  chainId: number,
  options: UseGetFaucetOptions = {}
): UseGetFaucetReturn {
  const {
    enabled = true,
    refreshInterval = 0,
    useFallbackOnError = true,
  } = options;

  const [faucet, setFaucet] = useState<FaucetDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<Error | null>(null);

  // Fetch faucet data using the service
  const fetchFaucetData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await faucetService.getFaucetData(chainId);
      setFaucet(data);
      setError(null);
    } catch (err) {
      console.error("❌ Error in useGetFaucet hook:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch faucet data")
      );

      // Use fallback data if the option is enabled
      if (useFallbackOnError) {
        setTimeout(() => {
          console.log("Using fallback data due to API error");
          setFaucet(fallbackData);
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and refresh interval setup
  useEffect(() => {
    if (!enabled) {
      console.log("⏸️ Faucet data fetch disabled");
      return;
    }

    // Initial fetch
    fetchFaucetData();

    // Set up refresh interval if specified
    if (refreshInterval > 0) {
      console.log(`⏰ Setting up refresh interval: ${refreshInterval}ms`);
      const intervalId = setInterval(fetchFaucetData, refreshInterval);

      // Cleanup interval on unmount or when dependencies change
      return () => {
        console.log("🧹 Cleaning up refresh interval");
        clearInterval(intervalId);
      };
    }
  }, [enabled, chainId, refreshInterval, useFallbackOnError]);

  return {
    faucet,
    isLoading,
    error,
    refetch: fetchFaucetData,
  };
}

export default useGetFaucet;
