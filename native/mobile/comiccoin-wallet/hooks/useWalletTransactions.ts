// monorepo/native/mobile/comiccoin-wallet/hooks/useWalletTransactions.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useMemo } from "react";
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

interface ProcessedTransaction extends Transaction {
  actualValue: number;
}

export const useWalletTransactions = (
  walletAddress: string | undefined,
): UseWalletTransactionsReturn => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: transactions = [], isLoading: loading } = useQuery({
    queryKey: ["transactions", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      try {
        const txList =
          await transactionListService.fetchWalletTransactions(walletAddress);
        return txList.sort((a, b) => b.timestamp - a.timestamp);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
        return [];
      }
    },
    enabled: !!walletAddress,
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,
  });

  const getNftTransactions = useCallback(async () => {
    if (!walletAddress) return;
    try {
      const txList = await transactionListService.fetchWalletTransactions(
        walletAddress,
        "token",
      );
      const sortedTransactions = txList.sort(
        (a, b) => b.timestamp - a.timestamp,
      );
      queryClient.setQueryData(
        ["transactions", walletAddress],
        sortedTransactions,
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  }, [walletAddress, queryClient]);

  const refresh = async () => {
    await queryClient.invalidateQueries(["transactions", walletAddress]);
  };

  const statistics = useMemo((): TransactionStatistics => {
    const coinTxs = transactions.filter((tx) => tx.type === "coin");
    const nftTxs = transactions.filter((tx) => tx.type === "token");
    const currentAddress = walletAddress?.toLowerCase();

    const totalCoinValue = transactions.reduce((sum, tx) => {
      const txValue = Number(tx.value) || 0;
      const txFee = Number(tx.fee) || 0;

      if (tx.from.toLowerCase() === currentAddress) {
        return sum - txValue;
      } else if (tx.to.toLowerCase() === currentAddress) {
        return sum + (txValue - txFee);
      }
      return sum;
    }, 0);

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
      totalCoinValue: Math.max(0, totalCoinValue),
      totalNftCount: ownedNfts.size,
    };
  }, [transactions, walletAddress]);

  const processedTransactions = useMemo((): ProcessedTransaction[] => {
    return transactions.map((tx) => {
      const isSender = tx.from.toLowerCase() === walletAddress?.toLowerCase();
      const txValue = Number(tx.value) || 0;
      const txFee = Number(tx.fee) || 0;

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
        actualValue: parseFloat(actualValue.toFixed(6)),
      };
    });
  }, [transactions, walletAddress]);

  return {
    transactions: processedTransactions,
    loading,
    error,
    refresh,
    getNftTransactions,
    statistics,
    coinTransactionsCount: statistics.coinTransactionsCount,
    nftTransactionsCount: statistics.nftTransactionsCount,
    totalTransactions: statistics.totalTransactions,
  };
};
