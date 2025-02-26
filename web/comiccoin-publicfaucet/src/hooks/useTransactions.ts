// src/hooks/useTransactions.ts
import { useState, useEffect, useCallback, useRef } from "react";
import transactionsService, { Transaction } from "../services/transactionsService";

interface UseTransactionsOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<Transaction[]>;
}

/**
 * Hook for fetching and managing transactions with automatic refresh and caching
 * @param options - Configuration options
 * @returns Object containing transactions data, loading/error states, and refetch function
 */
export function useTransactions({
  refreshInterval = 60000,
  enabled = true,
}: UseTransactionsOptions = {}): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to track component state and prevent issues
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const hasInitialFetchedRef = useRef(false);
  const refreshAttemptsRef = useRef(0);
  const MAX_REFRESH_ATTEMPTS = 3;

  /**
   * Fetch transactions data with error handling and state updates
   */
  const fetchTransactions = useCallback(async (force = false): Promise<Transaction[]> => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current && !force) {
      console.log("🚫 TRANSACTIONS HOOK: Already in progress");
      return transactions;
    }

    try {
      console.log("💼 TRANSACTIONS HOOK: Starting fetch", { force });

      // Mark that a fetch is in progress
      isFetchingRef.current = true;

      // Only set loading state on initial fetch or forced refresh
      if (!hasInitialFetchedRef.current || force) {
        setIsLoading(true);
      }

      setError(null);

      // Try to get from cache first for instant response if not forcing
      if (!force) {
        const cachedTransactions = transactionsService.getCachedTransactions();
        if (cachedTransactions && isMountedRef.current) {
          setTransactions(cachedTransactions);
          setIsLoading(false);
        }
      }

      // Fetch fresh data from service
      const transactionData = await transactionsService.getTransactions(force);

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setTransactions(transactionData);
        setError(null);
        setIsLoading(false);

        // Reset refresh attempts on successful fetch
        refreshAttemptsRef.current = 0;
      }

      // Mark that we've done the initial fetch
      hasInitialFetchedRef.current = true;

      return transactionData;
    } catch (err) {
      console.log("❌ TRANSACTIONS HOOK: Fetch failed", {
        error: err instanceof Error ? err.message : "Unknown error",
      });

      const errorObj = err instanceof Error
        ? err
        : new Error("Failed to fetch transactions");

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(errorObj);
        // Keep previous transactions if available
        if (transactions.length === 0) {
          setTransactions([]);
        }
        setIsLoading(false);
      }

      throw errorObj;
    } finally {
      // Mark fetch as complete
      isFetchingRef.current = false;
    }
  }, [transactions]);

  // Effect for initial fetch - runs only once on mount
  useEffect(() => {
    // Reset mounted ref
    isMountedRef.current = true;

    // Try to load from cache first for quick initial render
    const cachedTransactions = transactionsService.getCachedTransactions();
    if (cachedTransactions && enabled) {
      setTransactions(cachedTransactions);
      setIsLoading(false);
    }

    // Perform initial fetch only if enabled
    if (enabled) {
      console.log("🔄 TRANSACTIONS HOOK: Initial fetch on mount");
      fetchTransactions(true).catch((error) => {
        console.log("❌ TRANSACTIONS HOOK: Initial fetch failed", error);
      });
    } else {
      // If not enabled, we're not loading
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      console.log("🧹 TRANSACTIONS HOOK: Component unmounting");
      isMountedRef.current = false;
    };
  }, [enabled]); // Dependencies exclude fetchTransactions to prevent unnecessary re-fetches

  // Separate effect for the refresh interval
  useEffect(() => {
    if (!refreshInterval || !enabled) return;

    console.log(
      `⏰ TRANSACTIONS HOOK: Setting up refresh interval of ${refreshInterval}ms`
    );

    const intervalId = setInterval(() => {
      // Skip refresh if component is unmounted or if we've hit max attempts
      if (!isMountedRef.current) {
        return;
      }

      if (refreshAttemptsRef.current >= MAX_REFRESH_ATTEMPTS) {
        console.log("⏰ TRANSACTIONS HOOK: Max refresh attempts reached, skipping");
        return;
      }

      // Only fetch if not already fetching
      if (!isFetchingRef.current) {
        // Increment refresh attempts
        refreshAttemptsRef.current++;

        console.log("⏰ TRANSACTIONS HOOK: Refresh interval triggered");
        fetchTransactions().catch((error) => {
          console.log("❌ TRANSACTIONS HOOK: Refresh failed", error);
        });
      }
    }, refreshInterval);

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, refreshInterval]); // Dependencies exclude fetchTransactions

  return {
    transactions,
    isLoading,
    error,
    refetch: () => fetchTransactions(true), // Force refresh on manual refetch
  };
}

export default useTransactions;
export type { Transaction };
