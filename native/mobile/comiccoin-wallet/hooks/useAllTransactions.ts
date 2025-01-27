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

// Make sure to use a named export here
export function useAllTransactions(
  walletAddress: string | undefined,
): UseAllTransactionsReturn {
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
      const txValue = Number(tx.value) || 0;
      const txFee = Number(tx.fee) || 0;

      if (tx.from.toLowerCase() === currentAddress) {
        return sum - txValue;
      } else if (tx.to.toLowerCase() === currentAddress) {
        return sum + (txValue - txFee);
      }
      return sum;
    }, 0);

    // Track NFT ownership chronologically
    const ownedNfts = new Set<string>();

    // Sort NFT transactions chronologically to properly track ownership
    const sortedNftTxs = [...nftTxs].sort((a, b) => a.timestamp - b.timestamp);

    sortedNftTxs.forEach((tx) => {
      if (!tx.tokenId) return;

      const fromAddress = tx.from.toLowerCase();
      const toAddress = tx.to.toLowerCase();
      const isBurned =
        toAddress === "0x0000000000000000000000000000000000000000";

      // If we sent the NFT, we no longer own it
      if (fromAddress === currentAddress) {
        ownedNfts.delete(tx.tokenId);
      }
      // If we received the NFT and it wasn't burned, we now own it
      else if (toAddress === currentAddress && !isBurned) {
        ownedNfts.add(tx.tokenId);
      }
    });

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
}

// Also add a default export if needed
export default useAllTransactions;
