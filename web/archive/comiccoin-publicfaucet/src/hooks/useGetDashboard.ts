// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useGetDashboard.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { API_CONFIG } from "@/config/env";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

// Type for big.Int values from backend
type BigIntString = string;

// Type for transaction data
interface TransactionDTO {
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
  last_claim_time: string; // ISO timestamp
  next_claim_time: string; // ISO timestamp
  can_claim: boolean;
}

interface UseGetDashboardOptions {
  enabled?: boolean;
  refreshInterval?: number;
}

interface UseGetDashboardReturn {
  dashboard: DashboardDTO | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<DashboardDTO | null>;
}

/**
 * Custom hook to fetch dashboard data
 */
export function useGetDashboard(
  options: UseGetDashboardOptions = {}
): UseGetDashboardReturn {
  // Extract options with defaults
  const enabled = options.enabled !== false; // Default to true if not explicitly set to false
  const refreshInterval = options.refreshInterval || 0;

  const [dashboard, setDashboard] = useState<DashboardDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWithAuth = useAuthenticatedFetch();

  // Store the latest fetchWithAuth function
  const fetchWithAuthRef = useRef(fetchWithAuth);
  useEffect(() => {
    fetchWithAuthRef.current = fetchWithAuth;
  }, [fetchWithAuth]);

  // Store the enabled state and refresh interval
  const enabledRef = useRef(enabled);
  const refreshIntervalRef = useRef(refreshInterval);

  useEffect(() => {
    enabledRef.current = enabled;
    refreshIntervalRef.current = refreshInterval;
  }, [enabled, refreshInterval]);

  const fetchDashboardData = useCallback(async (): Promise<DashboardDTO | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchWithAuthRef.current(
        `${API_CONFIG.baseUrl}/publicfaucet/api/v1/dashboard`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const data: DashboardDTO = await response.json();
      setDashboard(data);
      setError(null);
      return data;
    } catch (err) {
      const errorObj = err instanceof Error
        ? err
        : new Error("Failed to fetch dashboard data");

      setError(errorObj);
      setDashboard(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies, we use refs instead

  // Set up the initial fetch and interval
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Initial fetch
    fetchDashboardData();

    // Set up interval if needed
    if (refreshInterval > 0) {
      const intervalId = setInterval(() => {
        if (enabledRef.current) {
          fetchDashboardData();
        }
      }, refreshInterval);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [enabled, refreshInterval, fetchDashboardData]);

  return {
    dashboard,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}
