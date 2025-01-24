// monorepo/native/mobile/comiccoin-wallet/hooks/useAllTransactions.ts
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
