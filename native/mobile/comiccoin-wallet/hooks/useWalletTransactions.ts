// monorepo/native/mobile/comiccoin-wallet/hooks/useWalletTransactions.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import blockchainService, {
  Transaction,
} from "../services/blockchain/BlockchainService";

// Define the return type for our statistics calculations
interface TransactionStatistics {
  totalTransactions: number;
  coinTransactionsCount: number;
  nftTransactionsCount: number;
  totalCoinValue: number;
  totalNftCount: number;
}

// Define the hook's return type for better type safety
interface UseWalletTransactionsReturn {
  transactions: ProcessedTransaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getNftTransactions: () => Promise<void>;
  statistics: TransactionStatistics;
  coinTransactionsCount: number;
  nftTransactionsCount: number;
  totalTransactions: number;
}

// Define a type for our processed transactions
interface ProcessedTransaction extends Transaction {
  actualValue: number;
}

export const useWalletTransactions = (
  walletAddress: string | undefined,
): UseWalletTransactionsReturn => {
  // State with proper typing
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all transactions with proper error handling
  const fetchTransactions = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    try {
      const txList =
        await blockchainService.fetchWalletTransactions(walletAddress);
      const sortedTransactions = txList.sort(
        (a, b) => b.timestamp - a.timestamp,
      );
      setTransactions(sortedTransactions);
    } catch (err) {
      // Proper error handling with type checking
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  // NFT-specific transaction fetch
  const getNftTransactions = useCallback(async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    try {
      const txList = await blockchainService.fetchWalletTransactions(
        walletAddress,
        "token",
      );
      const sortedTransactions = txList.sort(
        (a, b) => b.timestamp - a.timestamp,
      );
      setTransactions(sortedTransactions);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  // Auto-fetch on mount and wallet change
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate statistics with proper typing
  const statistics = useMemo((): TransactionStatistics => {
    const coinTxs = transactions.filter((tx) => tx.type === "coin");
    const nftTxs = transactions.filter((tx) => tx.type === "token");
    const currentAddress = walletAddress?.toLowerCase();

    // Calculate total coin value with proper fee handling
    const totalCoinValue = transactions.reduce((sum, tx) => {
      const txValue = Number(tx.value) || 0;
      const txFee = Number(tx.fee) || 0;

      if (tx.type === "coin") {
        if (tx.from.toLowerCase() === currentAddress) {
          // When sending coins - value already includes fee deduction
          return sum - txValue;
        } else if (tx.to.toLowerCase() === currentAddress) {
          // When receiving coins - subtract fee from received amount
          return sum + (txValue - txFee);
        }
      }
      // NFT transactions don't affect the coin value
      return sum;
    }, 0);

    // Calculate NFT ownership with proper type safety
    const ownedNfts = new Set<string>();
    nftTxs.forEach((tx) => {
      const isBurned =
        tx.to.toLowerCase() === "0x0000000000000000000000000000000000000000";

      if (tx.from.toLowerCase() === currentAddress) {
        if (tx.tokenId) {
          ownedNfts.delete(tx.tokenId);
        }
      } else if (
        tx.to.toLowerCase() === currentAddress &&
        !isBurned &&
        tx.tokenId
      ) {
        ownedNfts.add(tx.tokenId);
      }
    });

    return {
      totalTransactions: transactions.length,
      coinTransactionsCount: coinTxs.length,
      nftTransactionsCount: nftTxs.length,
      totalCoinValue: Math.max(0, totalCoinValue), // Ensure non-negative
      totalNftCount: ownedNfts.size,
    };
  }, [transactions, walletAddress]);

  // Process transactions for display with proper typing
  const processedTransactions = useMemo((): ProcessedTransaction[] => {
    return transactions.map((tx) => {
      const isSender = tx.from.toLowerCase() === walletAddress?.toLowerCase();
      const txValue = Number(tx.value) || 0;
      const txFee = Number(tx.fee) || 0;

      let actualValue: number;
      if (tx.type === "token") {
        actualValue = 0; // NFTs don't have a CC value
      } else if (isSender) {
        actualValue = txValue; // For sent transactions, show the total amount (fee already included)
      } else {
        actualValue = txValue - txFee; // For received transactions, subtract the fee
      }

      return {
        ...tx,
        actualValue: parseFloat(actualValue.toFixed(6)),
      };
    });
  }, [transactions, walletAddress]);

  return {
    transactions: processedTransactions,
    loading,
    error,
    refresh: fetchTransactions,
    getNftTransactions,
    statistics,
    coinTransactionsCount: statistics.coinTransactionsCount,
    nftTransactionsCount: statistics.nftTransactionsCount,
    totalTransactions: statistics.totalTransactions,
  };
};
