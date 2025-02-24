// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useGetFaucet.ts
import { useState, useEffect } from "react";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
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

interface UseGetFaucetOptions {
  enabled?: boolean;
  refreshInterval?: number;
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
  const { enabled = true, refreshInterval = 0 } = options;

  const [faucet, setFaucet] = useState<FaucetDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create authenticated fetch instance
  const fetchWithAuth = useAuthenticatedFetch();

  // Fetch faucet data
  const fetchFaucetData = async () => {
    try {
      console.log(`🔄 Fetching faucet data for chain ID: ${chainId}`);
      setIsLoading(true);
      setError(null);

      const response = await fetchWithAuth(
        `${API_CONFIG.baseUrl}/publicfaucet/api/v1/faucet/${chainId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch faucet data: ${response.statusText}`);
      }

      const data: FaucetDTO = await response.json();
      console.log("✅ Faucet data received:", {
        chainId: data.chain_id,
        balance: data.balance,
        usersCount: data.users_count,
      });

      setFaucet(data);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching faucet data:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch faucet data"),
      );
      setFaucet(null);
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
  }, [enabled, chainId, refreshInterval]);

  return {
    faucet,
    isLoading,
    error,
    refetch: fetchFaucetData,
  };
}

// Example usage:
/*
import { useGetFaucet } from '@/hooks/useGetFaucet';

function FaucetInfo({ chainId }: { chainId: number }) {
  const {
    faucet,
    isLoading,
    error,
    refetch
  } = useGetFaucet(chainId, {
    enabled: true,
    refreshInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return <div>Loading faucet data...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  if (!faucet) {
    return <div>No faucet data available</div>;
  }

  return (
    <div>
      <h2>Faucet Info for Chain {faucet.chain_id}</h2>
      <p>Balance: {faucet.balance}</p>
      <p>Users: {faucet.users_count}</p>
      <p>Total Distributed: {faucet.total_coins_distributed}</p>
      <p>Distribution Rate: {faucet.distribution_rate_per_day} per day</p>
    </div>
  );
}
*/
