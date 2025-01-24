// monorepo/native/mobile/comiccoin-wallet/hooks/useNFTTransactions.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
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

  const { data: transactions = [], isLoading: loading } = useQuery({
    queryKey: ["nftTransactions", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];

      try {
        const txList = await transactionListService.fetchWalletTransactions(
          walletAddress,
          "token",
        );
        const nftOwnership = new Map<string, string>();

        const sortedTransactions = [...txList].sort(
          (a, b) => a.timestamp - b.timestamp,
        );

        sortedTransactions.forEach((tx) => {
          if (tx.tokenId) {
            const isBurned =
              tx.to.toLowerCase() ===
              "0x0000000000000000000000000000000000000000";
            if (isBurned) {
              nftOwnership.delete(tx.tokenId);
            } else {
              nftOwnership.set(tx.tokenId, tx.to.toLowerCase());
            }
          }
        });

        return txList
          .filter(
            (tx) =>
              tx.tokenId &&
              nftOwnership.get(tx.tokenId) === walletAddress.toLowerCase(),
          )
          .sort((a, b) => b.timestamp - a.timestamp);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching NFT transactions");
        }
        return [];
      }
    },
    enabled: !!walletAddress,
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,
  });

  const refresh = async () => {
    await queryClient.invalidateQueries(["nftTransactions", walletAddress]);
  };

  const statistics = useMemo((): NFTStatistics => {
    const ownedNfts = new Set<string>();
    const processedTransactions = [...transactions].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    processedTransactions.forEach((tx) => {
      if (
        tx.tokenId &&
        tx.to.toLowerCase() === walletAddress?.toLowerCase() &&
        tx.to.toLowerCase() !== "0x0000000000000000000000000000000000000000"
      ) {
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
