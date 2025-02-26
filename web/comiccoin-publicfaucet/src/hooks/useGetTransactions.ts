// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useGetTransactions.ts
// Enhanced useGetTransactions hook with anti-loop protection
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

  // Add a ref to track if initial fetch has been performed
  const hasInitialFetchedRef = useRef(false);

  // Add a ref to track the last fetch time to prevent excessive fetching
  const lastFetchTimeRef = useRef(0);

  // Store refresh attempts count to prevent infinite refresh loops
  const refreshAttemptsRef = useRef(0);
  const MAX_REFRESH_ATTEMPTS = 3;

  const fetchWithAuth = useAuthenticatedFetch();

  const fetchTransactions = useCallback(async (force = false): Promise<Transaction[]> => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current && !force) {
      console.log("🚫 TRANSACTIONS FETCH: Already in progress");
      return transactions;
    }

    // Throttle fetches to prevent too many in short succession
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (!force && timeSinceLastFetch < 2000 && lastFetchTimeRef.current !== 0) {
      console.log("🚫 TRANSACTIONS FETCH: Throttled (too frequent)");
      return transactions;
    }

    // Update last fetch time
    lastFetchTimeRef.current = now;

    try {
      console.log("💼 TRANSACTIONS FETCH: Starting");

      // Mark that a fetch is in progress
      isFetchingRef.current = true;

      // Only set loading state on initial fetch or forced refresh
      if (!hasInitialFetchedRef.current || force) {
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
        setError(null);

        // Reset refresh attempts on successful fetch
        refreshAttemptsRef.current = 0;
      }

      // Mark that we've done the initial fetch
      hasInitialFetchedRef.current = true;

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
  }, [fetchWithAuth, transactions]);

  // Initial fetch effect - simplified to run only once on mount
  useEffect(() => {
    // Reset mounted ref
    isMountedRef.current = true;

    // Reset fetch tracking
    hasInitialFetchedRef.current = false;
    lastFetchTimeRef.current = 0;

    // Perform initial fetch only if enabled
    if (enabled && !hasInitialFetchedRef.current) {
      console.log("🔄 TRANSACTIONS FETCH: Auto-fetching on mount");
      fetchTransactions(true).catch((error) => {
        console.log("❌ TRANSACTIONS FETCH: Auto-fetch failed", error);
      });
    } else if (!enabled) {
      // If not enabled, we're not loading
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      console.log("🧹 TRANSACTIONS FETCH: Component unmounting");
      isMountedRef.current = false;
    };
  }, [enabled]); // Remove fetchTransactions from dependencies to prevent re-fetching on every hook recreation

  // Separate effect for the interval to avoid it being re-created unnecessarily
  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    console.log(
      `⏰ TRANSACTIONS FETCH: Setting up refresh interval of ${refreshInterval}ms`,
    );

    const intervalId = setInterval(() => {
      // Skip refresh if component is unmounted or if we've hit max attempts
      if (!isMountedRef.current) {
        console.log("⏰ TRANSACTIONS FETCH: Skipping refresh - component unmounted");
        return;
      }

      if (refreshAttemptsRef.current >= MAX_REFRESH_ATTEMPTS) {
        console.log("⏰ TRANSACTIONS FETCH: Max refresh attempts reached, skipping");
        return;
      }

      console.log("⏰ TRANSACTIONS FETCH: Refresh interval triggered");

      // Only fetch if not already fetching
      if (!isFetchingRef.current) {
        // Increment refresh attempts
        refreshAttemptsRef.current++;

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
  }, [enabled, refreshInterval]); // Keep fetchTransactions out of dependencies

  return {
    transactions,
    isLoading,
    error,
    refetch: () => fetchTransactions(true), // Force refresh on manual refetch
  };
}
