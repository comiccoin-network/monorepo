// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useGetFaucet.ts
import { useState, useEffect } from "react";
import { API_CONFIG } from "@/config/env";

// Type for big.Int values from backend
type BigIntString = string;

interface FaucetDTO {
  id: string;
  chain_id: number;
  balance: BigIntString;
  users_count: number;
  total_coins_distributed: BigIntString;
  total_transactions: number;
  distribution_rate_per_day: number;
  total_coins_distributed_today: number;
  total_transactions_today: number;
  created_at?: string;
  last_modified_at?: string;
  daily_coins_reward: number;
}

// Fallback data in case API is unavailable (especially important for mobile)
const fallbackData: FaucetDTO = {
  id: "fallback-id",
  chain_id: 1,
  balance: "1000000",
  users_count: 1000,
  total_coins_distributed: "500000",
  total_transactions: 15000,
  distribution_rate_per_day: 500,
  total_coins_distributed_today: 250,
  total_transactions_today: 25,
  daily_coins_reward: 2,
};

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
 * Custom hook to fetch faucet data for a specific chain ID
 *
 * @param chainId - The ID of the blockchain network
 * @param options - Configuration options for the hook
 * @returns Object containing faucet data, loading state, error state, and refetch function
 */
export function useGetFaucet(
  chainId: number,
  options: UseGetFaucetOptions = {},
): UseGetFaucetReturn {
  const {
    enabled = true,
    refreshInterval = 0,
    useFallbackOnError = true,
  } = options;

  const [faucet, setFaucet] = useState<FaucetDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<Error | null>(null);

  // Fetch faucet data
  const fetchFaucetData = async () => {
    try {
      console.log(`🔄 Fetching faucet data for chain ID: ${chainId}`);
      setIsLoading(true);
      setError(null);

      // Check internet connection if available in browser environment
      if (
        typeof navigator !== "undefined" &&
        "onLine" in navigator &&
        !navigator.onLine
      ) {
        throw new Error(
          "You are offline. Please check your internet connection.",
        );
      }

      // Get the API base URL from the config
      // This will now properly use the env variables based on the environment (dev/prod)
      const baseUrl = API_CONFIG.baseUrl;

      if (!baseUrl) {
        throw new Error("API base URL is not configured properly.");
      }

      const apiUrl = `${baseUrl}/publicfaucet/api/v1/faucet/${chainId}`;
      console.log(`📡 Connecting to API: ${apiUrl}`);

      // Set timeout for the fetch to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

      try {
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch faucet data: ${response.statusText}`,
          );
        }

        const data: FaucetDTO = await response.json();
        console.log("✅ Faucet data received:", {
          chainId: data.chain_id,
          balance: data.balance,
          usersCount: data.users_count,
        });

        setFaucet(data);
        setError(null);
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);

        // Type guard to check if the error is an object with a name property
        if (
          fetchError &&
          typeof fetchError === "object" &&
          "name" in fetchError
        ) {
          if (fetchError.name === "AbortError") {
            throw new Error("Request timed out. Please try again.");
          }
        }

        throw fetchError;
      }
    } catch (err) {
      console.error("❌ Error fetching faucet data:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch faucet data"),
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
