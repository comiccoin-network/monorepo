// monorepo/native/mobile/comiccoin-wallet/hooks/useCoinTransactions.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import transactionListService, {
  Transaction,
} from "../services/transaction/ListService";

/**
 * Interface defining the structure of coin-specific transaction statistics.
 * This includes both the total value of coins and the number of transactions.
 */
interface CoinStatistics {
  totalCoinValue: number;
  coinTransactionsCount: number;
}

/**
 * Interface defining the complete return type of the useCoinTransactions hook.
 * This provides type safety for all values returned by the hook.
 */
interface UseCoinTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  statistics: CoinStatistics;
}

/**
 * A custom hook for managing coin transactions for a specific wallet address.
 * This hook handles fetching, sorting, and analyzing coin-specific transactions.
 * It calculates running balances and provides statistics about the wallet's coin activity.
 *
 * @param walletAddress - The Ethereum address of the wallet to track
 * @returns UseCoinTransactionsReturn - Object containing transactions, loading state, error state, and statistics
 */
export const useCoinTransactions = (
  walletAddress: string | undefined,
): UseCoinTransactionsReturn => {
  // Initialize state with proper typing
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches coin transactions for the specified wallet address.
   * This function filters for coin-type transactions and sorts them by timestamp.
   */
  const fetchCoinTransactions = useCallback(async () => {
    // Return early if no wallet address is provided
    if (!walletAddress) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch only coin transactions using the type parameter
      const txList = await transactionListService.fetchWalletTransactions(
        walletAddress,
        "coin",
      );

      // Sort transactions with most recent first
      const sortedTransactions = txList.sort(
        (a, b) => b.timestamp - a.timestamp,
      );

      setTransactions(sortedTransactions);
    } catch (err) {
      // Handle errors with proper type checking
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching coin transactions");
      }
      // Clear transactions on error
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  // Fetch coin transactions when the component mounts or wallet changes
  useEffect(() => {
    fetchCoinTransactions();
  }, [fetchCoinTransactions]);

  /**
   * Calculate coin-specific statistics including total value and transaction count.
   * This calculation takes into account:
   * - Outgoing transactions (subtract value + fee)
   * - Incoming transactions (add value)
   */
  const statistics = useMemo((): CoinStatistics => {
    const totalCoinValue = transactions.reduce((sum, tx) => {
      // Ensure we're working with numbers
      const value = Number(tx.value) || 0;
      const fee = Number(tx.fee) || 0;

      // Normalize addresses for comparison
      const currentAddress = walletAddress?.toLowerCase();
      const fromAddress = tx.from.toLowerCase();
      const toAddress = tx.to.toLowerCase();

      if (fromAddress === currentAddress) {
        // For outgoing transactions, subtract both value and fee
        return sum - value - fee;
      } else if (toAddress === currentAddress) {
        // For incoming transactions, add the value
        return sum + value;
      }

      return sum;
    }, 0);

    return {
      totalCoinValue: Math.max(0, totalCoinValue), // Ensure non-negative balance
      coinTransactionsCount: transactions.length,
    };
  }, [transactions, walletAddress]);

  return {
    transactions,
    loading,
    error,
    refresh: fetchCoinTransactions,
    statistics,
  };
};
