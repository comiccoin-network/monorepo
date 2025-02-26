// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useGetTransactions.ts
import { useState, useEffect, useCallback, useRef } from "react";
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
  refreshInterval = 60000,
  enabled = true,
}: UseGetTransactionsOptions = {}): UseGetTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use a ref to track mounted state
  const isMountedRef = useRef(true);

  // Use a ref to prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false);

  // Store transactions in a ref to avoid dependency cycle
  const transactionsRef = useRef<Transaction[]>([]);

  const fetchWithAuth = useAuthenticatedFetch();

  const fetchTransactions = useCallback(async (): Promise<Transaction[]> => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log("🚫 TRANSACTIONS FETCH: Already in progress");
      return transactionsRef.current;
    }

    try {
      console.log("💼 TRANSACTIONS FETCH: Starting");

      // Mark that a fetch is in progress
      isFetchingRef.current = true;

      // Only set loading if no transactions exist
      if (transactionsRef.current.length === 0) {
        setIsLoading(true);
      }

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

      const transactionData = await response.json();

      // Ensure transactionData is an array
      const validTransactions: Transaction[] = Array.isArray(transactionData)
        ? transactionData
        : [];

      console.log("✅ TRANSACTIONS FETCH: Success", {
        count: validTransactions.length,
      });

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setTransactions(validTransactions);
        // Also update the ref
        transactionsRef.current = validTransactions;
        setError(null);
      }

      return validTransactions;
    } catch (err) {
      console.log("❌ TRANSACTIONS FETCH: Failed", {
        error: err instanceof Error ? err.message : "Unknown error",
      });

      const error =
        err instanceof Error ? err : new Error("Failed to fetch transactions");

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(error);
        setTransactions([]);
        // Also update the ref
        transactionsRef.current = [];
      }

      throw error;
    } finally {
      // Mark fetch as complete
      isFetchingRef.current = false;

      // Only set loading to false if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchWithAuth]); // Remove transactions.length from dependencies

  // Initial fetch effect
  useEffect(() => {
    // Reset mounted ref
    isMountedRef.current = true;

    // Fetch only if enabled
    if (enabled) {
      console.log("🔄 TRANSACTIONS FETCH: Auto-fetching on mount");
      fetchTransactions().catch((error) => {
        console.log("❌ TRANSACTIONS FETCH: Auto-fetch failed", error);
      });
    }

    // Cleanup function
    return () => {
      // Mark as unmounted
      isMountedRef.current = false;
    };
  }, [enabled, fetchTransactions]); // Remove transactions.length from dependencies

  // Interval effect with more robust management
  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    console.log(
      `⏰ TRANSACTIONS FETCH: Setting up refresh interval of ${refreshInterval}ms`,
    );

    const intervalId = setInterval(() => {
      console.log("⏰ TRANSACTIONS FETCH: Refresh interval triggered");
      // Only fetch if not already fetching
      if (!isFetchingRef.current) {
        fetchTransactions().catch((error) => {
          console.log("❌ TRANSACTIONS FETCH: Refresh failed", error);
        });
      } else {
        console.log("⏰ TRANSACTIONS FETCH: Skipping refresh - already fetching");
      }
    }, refreshInterval);

    // Cleanup interval on unmount or when dependencies change
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
