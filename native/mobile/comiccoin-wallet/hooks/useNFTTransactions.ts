// monorepo/native/mobile/comiccoin-wallet/hooks/useNFTTransactions.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import transactionListService, {
  Transaction,
} from "../services/transaction/ListService";

interface NFTStatistics {
  totalNftCount: number;
  nftTransactionsCount: number;
}

interface UseNFTTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  statistics: NFTStatistics;
}

export const useNFTTransactions = (
  walletAddress: string | undefined,
): UseNFTTransactionsReturn => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!walletAddress) {
      return [];
    }

    try {
      const txList = await transactionListService.fetchWalletTransactions(
        walletAddress,
        "token",
      );

      const currentAddress = walletAddress.toLowerCase();
      const nftOwnership = new Map<string, string>();

      const sortedTransactions = [...txList].sort(
        (a, b) => a.timestamp - b.timestamp,
      );

      sortedTransactions.forEach((tx) => {
        if (tx.tokenId) {
          const toAddress = tx.to.toLowerCase();
          const fromAddress = tx.from.toLowerCase();

          if (toAddress === currentAddress && fromAddress !== currentAddress) {
            nftOwnership.set(tx.tokenId, currentAddress);
          } else if (fromAddress === currentAddress) {
            nftOwnership.delete(tx.tokenId);
          }
        }
      });

      const filteredTx = txList
        .filter((tx) => tx.tokenId && nftOwnership.has(tx.tokenId))
        .sort((a, b) => b.timestamp - a.timestamp);

      return filteredTx;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching NFT transactions");
      }
      throw err;
    }
  };

  const {
    data: transactions = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["nftTransactions", walletAddress],
    queryFn: fetchTransactions,
    enabled: !!walletAddress,
    staleTime: 300000, // 5 minutes
    cacheTime: 300000, // 5 minutes
    refetchOnMount: true, // Changed to true for initial load
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    initialData: [],
  });

  // Force initial fetch when wallet address is available
  useEffect(() => {
    if (walletAddress) {
      queryClient.prefetchQuery({
        queryKey: ["nftTransactions", walletAddress],
        queryFn: fetchTransactions,
      });
    }
  }, [walletAddress]);

  const refresh = async () => {
    try {
      await queryClient.invalidateQueries(["nftTransactions", walletAddress]);
      const result = await queryClient.fetchQuery({
        queryKey: ["nftTransactions", walletAddress],
        queryFn: fetchTransactions,
      });
      return result;
    } catch (err) {
      console.error("Error during refresh:", err);
      throw err;
    }
  };

  const statistics = useMemo((): NFTStatistics => {
    if (!transactions || !walletAddress) {
      return {
        totalNftCount: 0,
        nftTransactionsCount: 0,
      };
    }

    const ownedNfts = new Set<string>();
    const currentAddress = walletAddress.toLowerCase();

    const sortedTransactions = [...transactions].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    sortedTransactions.forEach((tx) => {
      if (!tx.tokenId) return;

      const fromAddress = tx.from.toLowerCase();
      const toAddress = tx.to.toLowerCase();

      if (fromAddress === currentAddress) {
        ownedNfts.delete(tx.tokenId);
      } else if (toAddress === currentAddress) {
        ownedNfts.add(tx.tokenId);
      }
    });

    return {
      totalNftCount: ownedNfts.size,
      nftTransactionsCount: transactions.length,
    };
  }, [transactions, walletAddress]);

  return {
    transactions,
    loading,
    error,
    refresh,
    statistics,
  };
};
