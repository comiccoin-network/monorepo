// monorepo/native/mobile/comiccoin-wallet/hooks/useNFTTransactions.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
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
      if (!walletAddress) {
        return [];
      }

      try {
        const txList = await transactionListService.fetchWalletTransactions(
          walletAddress,
          "token",
        );

        // Create a map to track current ownership
        const nftOwnership = new Map<string, string>();
        const currentAddress = walletAddress.toLowerCase();

        // Sort by timestamp to process in chronological order
        const sortedTransactions = [...txList].sort(
          (a, b) => a.timestamp - b.timestamp,
        );

        sortedTransactions.forEach((tx) => {
          if (tx.tokenId) {
            const toAddress = tx.to.toLowerCase();
            const fromAddress = tx.from.toLowerCase();

            // If current wallet is receiver and not sending to self
            if (
              toAddress === currentAddress &&
              fromAddress !== currentAddress
            ) {
              nftOwnership.set(tx.tokenId, currentAddress);
            }
            // If current wallet is sender
            else if (fromAddress === currentAddress) {
              nftOwnership.delete(tx.tokenId);
            }
          }
        });

        // Filter transactions to only include NFTs currently owned
        const filteredTransactions = txList
          .filter((tx) => tx.tokenId && nftOwnership.has(tx.tokenId))
          .sort((a, b) => b.timestamp - a.timestamp);

        return filteredTransactions;
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
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache the data
  });

  const refresh = async () => {
    // Invalidate all related queries
    await queryClient.invalidateQueries(["nftTransactions"]);
    await queryClient.invalidateQueries(["nft-collection"]);
    await queryClient.invalidateQueries(["nft-metadata"]);

    // Force refetch
    await queryClient.refetchQueries(["nftTransactions", walletAddress]);
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

    // Process transactions chronologically
    const sortedTransactions = [...transactions].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    sortedTransactions.forEach((tx) => {
      if (!tx.tokenId) return;

      const fromAddress = tx.from.toLowerCase();
      const toAddress = tx.to.toLowerCase();

      // Remove from ownership if we sent it
      if (fromAddress === currentAddress) {
        ownedNfts.delete(tx.tokenId);
      }
      // Add to ownership if we received it
      else if (toAddress === currentAddress) {
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
