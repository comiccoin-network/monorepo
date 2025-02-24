// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useGetTransactions.ts
// src/hooks/useGetTransactions.ts
import { useState, useEffect, useCallback } from "react";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { API_CONFIG } from "@/config/env";

// Define Transaction interface based on actual data structure
export interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
}

interface UseGetTransactionsOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseGetTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<Transaction[]>;
}

export function useGetTransactions({
  refreshInterval,
  enabled = true,
}: UseGetTransactionsOptions = {}): UseGetTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchWithAuth = useAuthenticatedFetch();

  const fetchTransactions = useCallback(async (): Promise<Transaction[]> => {
    try {
      console.log("💼 TRANSACTIONS FETCH: Starting");

      setIsLoading(true);
      setError(null);

      const url = new URL(
        `${API_CONFIG.baseUrl}/publicfaucet/api/v1/transactions`,
      );

      console.log("📡 TRANSACTIONS FETCH: Calling API");
      const response = await fetchWithAuth(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.statusText}`);
      }

      const transactionData: Transaction[] = await response.json();

      console.log("✅ TRANSACTIONS FETCH: Success", {
        count: transactionData.length,
      });

      setTransactions(transactionData);
      setError(null);

      return transactionData;
    } catch (err) {
      console.log("❌ TRANSACTIONS FETCH: Failed", {
        error: err instanceof Error ? err.message : "Unknown error",
      });

      const error =
        err instanceof Error ? err : new Error("Failed to fetch transactions");
      setError(error);
      setTransactions([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    if (enabled) {
      console.log("🔄 TRANSACTIONS FETCH: Auto-fetching on mount");
      fetchTransactions().catch((error) => {
        console.log("❌ TRANSACTIONS FETCH: Auto-fetch failed", error);
      });
    }
  }, [enabled, fetchTransactions]);

  // Set up interval for periodic refreshing if specified
  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    console.log(
      `⏰ TRANSACTIONS FETCH: Setting up refresh interval of ${refreshInterval}ms`,
    );
    const intervalId = setInterval(() => {
      console.log("⏰ TRANSACTIONS FETCH: Refresh interval triggered");
      fetchTransactions().catch((error) => {
        console.log("❌ TRANSACTIONS FETCH: Refresh failed", error);
      });
    }, refreshInterval);

    return () => {
      console.log("⏰ TRANSACTIONS FETCH: Clearing refresh interval");
      clearInterval(intervalId);
    };
  }, [enabled, fetchTransactions, refreshInterval]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}
