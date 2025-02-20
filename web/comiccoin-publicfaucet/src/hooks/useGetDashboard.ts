import { useState, useEffect } from "react";
import { createAuthenticatedFetch } from "@/utils/api";
import { API_CONFIG } from "@/config/env";

// Type for big.Int values from backend
type BigIntString = string;

// Type for transaction data
interface TransactionDTO {
  // Add transaction fields based on your needs
  id: string;
  // ... other transaction fields
}

// Updated to match the Go DashboardDTO structure
interface DashboardDTO {
  chain_id: number;
  faucet_balance: BigIntString;
  user_balance: BigIntString;
  total_coins_claimed: BigIntString;
  transactions: TransactionDTO[];
  last_modified_at?: string;
}

interface UseGetDashboardOptions {
  enabled?: boolean;
  refreshInterval?: number;
}

interface UseGetDashboardReturn {
  dashboard: DashboardDTO | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch dashboard data for a specific chain ID
 *
 * @param options - Configuration options for the hook
 * @returns Object containing dashboard data, loading state, error state, and refetch function
 */
export function useGetDashboard(
  options: UseGetDashboardOptions = {},
): UseGetDashboardReturn {
  const { enabled = true, refreshInterval = 0 } = options;

  const [dashboard, setDashboard] = useState<DashboardDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWithAuth = createAuthenticatedFetch();

  const fetchDashboardData = async () => {
    try {
      console.log(`🔄 Fetching dashboard data.`);
      setIsLoading(true);
      setError(null);

      const response = await fetchWithAuth(
        `${API_CONFIG.baseUrl}/publicfaucet/api/v1/dashboard`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch dashboard data: ${response.statusText}`,
        );
      }

      const data: DashboardDTO = await response.json();
      console.log("✅ Dashboard data received:", {
        faucetBalance: data.faucet_balance,
        userBalance: data.user_balance,
        totalClaimed: data.total_coins_claimed,
        transactionCount: data.transactions.length,
      });

      setDashboard(data);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch dashboard data"),
      );
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      console.log("⏸️ Dashboard data fetch disabled");
      return;
    }

    fetchDashboardData();

    if (refreshInterval > 0) {
      console.log(`⏰ Setting up refresh interval: ${refreshInterval}ms`);
      const intervalId = setInterval(fetchDashboardData, refreshInterval);

      return () => {
        console.log("🧹 Cleaning up refresh interval");
        clearInterval(intervalId);
      };
    }
  }, [enabled, refreshInterval]);

  return {
    dashboard,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}

// Example usage:
/*
import { useGetDashboard } from '@/hooks/useGetDashboard';

function DashboardInfo({ chainId }: { chainId: number }) {
  const {
    dashboard,
    isLoading,
    error,
    refetch
  } = useGetDashboard(chainId, {
    enabled: true,
    refreshInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  if (!dashboard) {
    return <div>No dashboard data available</div>;
  }

  return (
    <div>
      <h2>Dashboard Info for Chain {dashboard.chain_id}</h2>
      <p>Faucet Balance: {dashboard.faucet_balance}</p>
      <p>Your Balance: {dashboard.user_balance}</p>
      <p>Total Claimed: {dashboard.total_coins_claimed}</p>
      <p>Recent Transactions: {dashboard.transactions.length}</p>
    </div>
  );
}
*/
