// monorepo/native/mobile/comiccoin-wallet/hooks/useAllTransactions.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import transactionListService, {
  Transaction,
} from "../services/transaction/ListService";

/**
 * Represents the calculated statistics for all wallet transactions.
 * All numeric values are stored as integers to ensure precise calculations.
 */
interface TransactionStatistics {
  totalTransactions: number;
  coinTransactionsCount: number;
  nftTransactionsCount: number;
  totalCoinValue: number;
  totalNftCount: number;
}

/**
 * Extends the base Transaction type to include calculated actual value
 * This helps with displaying transaction values that account for fees
 */
interface ProcessedTransaction extends Transaction {
  actualValue: number;
}

/**
 * Defines the complete return type of the useAllTransactions hook
 * This provides type safety and documentation for all returned values
 */
interface UseAllTransactionsReturn {
  transactions: ProcessedTransaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  statistics: TransactionStatistics;
  coinTransactions: ProcessedTransaction[];
  nftTransactions: ProcessedTransaction[];
}

/**
 * A comprehensive hook for managing all transactions (both coins and NFTs) for a wallet.
 * This hook provides functionality for fetching, processing, and analyzing all transaction types.
 * All numeric calculations are performed using integer math to prevent floating-point precision issues.
 *
 * @param walletAddress - The Ethereum address of the wallet to track
 * @returns UseAllTransactionsReturn - Object containing processed transactions, statistics, and state
 */
export const useAllTransactions = (
  walletAddress: string | undefined,
): UseAllTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all transactions for the wallet address and sorts them by timestamp.
   * This includes both coin and NFT transactions.
   */
  const fetchAllTransactions = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    try {
      const txList =
        await transactionListService.fetchWalletTransactions(walletAddress);
      const sortedTransactions = txList.sort(
        (a, b) => b.timestamp - a.timestamp,
      );
      setTransactions(sortedTransactions);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching transactions");
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchAllTransactions();
  }, [fetchAllTransactions]);

  /**
   * Calculates comprehensive statistics about the wallet's transactions.
   * This includes both coin balances and NFT ownership information.
   * All calculations use integer math to prevent floating-point precision issues.
   */
  const statistics = useMemo((): TransactionStatistics => {
    const coinTxs = transactions.filter((tx) => tx.type === "coin");
    const nftTxs = transactions.filter((tx) => tx.type === "token");
    const currentAddress = walletAddress?.toLowerCase();

    // Calculate total coin value with proper fee handling
    const totalCoinValue = transactions.reduce((sum, tx) => {
      const txValue = Math.floor(Number(tx.value)) || 0;
      const txFee = Math.floor(Number(tx.fee)) || 0;

      if (tx.type === "coin") {
        if (tx.from.toLowerCase() === currentAddress) {
          // Outgoing transaction - value includes fee
          return sum - txValue;
        } else if (tx.to.toLowerCase() === currentAddress) {
          // Incoming transaction - subtract fee from value
          return sum + (txValue - txFee);
        }
      }
      // NFT transactions don't affect coin balance
      return sum;
    }, 0);

    // Track NFT ownership using a map for efficient lookups
    const nftOwnership = new Map<string, string>();
    nftTxs.forEach((tx) => {
      if (tx.tokenId) {
        const isBurned =
          tx.to.toLowerCase() === "0x0000000000000000000000000000000000000000";
        if (!isBurned) {
          nftOwnership.set(tx.tokenId, tx.to.toLowerCase());
        } else {
          nftOwnership.delete(tx.tokenId);
        }
      }
    });

    // Calculate currently owned NFTs
    const ownedNfts = new Set(
      Array.from(nftOwnership.entries())
        .filter(([_, owner]) => owner === currentAddress)
        .map(([tokenId]) => tokenId),
    );

    return {
      totalTransactions: transactions.length,
      coinTransactionsCount: coinTxs.length,
      nftTransactionsCount: nftTxs.length,
      totalCoinValue: Math.max(0, Math.floor(totalCoinValue)),
      totalNftCount: ownedNfts.size,
    };
  }, [transactions, walletAddress]);

  /**
   * Processes transactions to include calculated actual values.
   * This helps with displaying transaction amounts that account for fees.
   * All calculations use integer math for precision.
   */
  const processedTransactions = useMemo((): ProcessedTransaction[] => {
    return transactions.map((tx) => {
      const isSender = tx.from.toLowerCase() === walletAddress?.toLowerCase();
      const txValue = Math.floor(Number(tx.value)) || 0;
      const txFee = Math.floor(Number(tx.fee)) || 0;

      let actualValue: number;
      if (tx.type === "token") {
        actualValue = 0; // NFTs have no coin value
      } else if (isSender) {
        actualValue = txValue; // For sent transactions, show total amount (fee included)
      } else {
        actualValue = txValue - txFee; // For received transactions, subtract fee
      }

      return {
        ...tx,
        actualValue: Math.floor(actualValue),
      };
    });
  }, [transactions, walletAddress]);

  // Split transactions by type for convenience
  const coinTransactions = processedTransactions.filter(
    (tx) => tx.type === "coin",
  );
  const nftTransactions = processedTransactions.filter(
    (tx) => tx.type === "token",
  );

  return {
    transactions: processedTransactions,
    loading,
    error,
    refresh: fetchAllTransactions,
    statistics,
    coinTransactions,
    nftTransactions,
  };
};
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import transactionListService, {
  Transaction,
} from "../services/transaction/ListService";

interface TransactionStatistics {
  totalTransactions: number;
  coinTransactionsCount: number;
  nftTransactionsCount: number;
  totalCoinValue: number;
  totalNftCount: number;
}

interface ProcessedTransaction extends Transaction {
  actualValue: number;
}

interface UseAllTransactionsReturn {
  transactions: ProcessedTransaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  statistics: TransactionStatistics;
  coinTransactions: ProcessedTransaction[];
  nftTransactions: ProcessedTransaction[];
}

export const useAllTransactions = (
  walletAddress: string | undefined,
): UseAllTransactionsReturn => {
  const queryClient = useQueryClient();

  const {
    data: transactions = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["allTransactions", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];

      const txList =
        await transactionListService.fetchWalletTransactions(walletAddress);
      return txList.sort((a, b) => b.timestamp - a.timestamp);
    },
    enabled: !!walletAddress,
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,
  });

  const statistics = useMemo((): TransactionStatistics => {
    const coinTxs = transactions.filter((tx) => tx.type === "coin");
    const nftTxs = transactions.filter((tx) => tx.type === "token");
    const currentAddress = walletAddress?.toLowerCase();

    const totalCoinValue = transactions.reduce((sum, tx) => {
      const txValue = Math.floor(Number(tx.value)) || 0;
      const txFee = Math.floor(Number(tx.fee)) || 0;

      if (tx.type === "coin") {
        if (tx.from.toLowerCase() === currentAddress) {
          return sum - txValue;
        } else if (tx.to.toLowerCase() === currentAddress) {
          return sum + (txValue - txFee);
        }
      }
      return sum;
    }, 0);

    const nftOwnership = new Map<string, string>();
    nftTxs.forEach((tx) => {
      if (tx.tokenId) {
        const isBurned =
          tx.to.toLowerCase() === "0x0000000000000000000000000000000000000000";
        if (!isBurned) {
          nftOwnership.set(tx.tokenId, tx.to.toLowerCase());
        } else {
          nftOwnership.delete(tx.tokenId);
        }
      }
    });

    const ownedNfts = new Set(
      Array.from(nftOwnership.entries())
        .filter(([_, owner]) => owner === currentAddress)
        .map(([tokenId]) => tokenId),
    );

    return {
      totalTransactions: transactions.length,
      coinTransactionsCount: coinTxs.length,
      nftTransactionsCount: nftTxs.length,
      totalCoinValue: Math.max(0, Math.floor(totalCoinValue)),
      totalNftCount: ownedNfts.size,
    };
  }, [transactions, walletAddress]);

  const processedTransactions = useMemo((): ProcessedTransaction[] => {
    return transactions.map((tx) => {
      const isSender = tx.from.toLowerCase() === walletAddress?.toLowerCase();
      const txValue = Math.floor(Number(tx.value)) || 0;
      const txFee = Math.floor(Number(tx.fee)) || 0;

      let actualValue: number;
      if (tx.type === "token") {
        actualValue = 0;
      } else if (isSender) {
        actualValue = txValue;
      } else {
        actualValue = txValue - txFee;
      }

      return {
        ...tx,
        actualValue: Math.floor(actualValue),
      };
    });
  }, [transactions, walletAddress]);

  const coinTransactions = processedTransactions.filter(
    (tx) => tx.type === "coin",
  );
  const nftTransactions = processedTransactions.filter(
    (tx) => tx.type === "token",
  );

  return {
    transactions: processedTransactions,
    loading,
    error: error instanceof Error ? error.message : null,
    refresh: () => refetch(),
    statistics,
    coinTransactions,
    nftTransactions,
  };
};
