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

  console.log("useNFTTransactions - Wallet Address:", walletAddress);

  const { data: transactions = [], isLoading: loading } = useQuery({
    queryKey: ["nftTransactions", walletAddress],
    queryFn: async () => {
      console.log(
        "useNFTTransactions - queryFn starting with wallet:",
        walletAddress,
      );

      if (!walletAddress) {
        console.log("useNFTTransactions - No wallet address provided");
        return [];
      }

      try {
        console.log(
          "useNFTTransactions - Fetching transactions for address:",
          walletAddress,
        );
        const txList = await transactionListService.fetchWalletTransactions(
          walletAddress,
          "token",
        );
        console.log("useNFTTransactions - Raw transaction list:", txList);

        // Create a map to track the most recent owner of each NFT
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

        console.log(
          "useNFTTransactions - NFT Ownership map:",
          Object.fromEntries(nftOwnership),
        );

        // Filter transactions to only include NFTs currently owned
        const filteredTransactions = txList
          .filter((tx) => tx.tokenId && nftOwnership.has(tx.tokenId))
          .sort((a, b) => b.timestamp - a.timestamp);

        console.log(
          "useNFTTransactions - Final filtered transactions:",
          filteredTransactions,
        );
        return filteredTransactions;
      } catch (err) {
        console.error("useNFTTransactions - Error:", err);
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
    console.log("useNFTTransactions - Refreshing query");
    await queryClient.invalidateQueries(["nftTransactions", walletAddress]);
  };

  const statistics = useMemo((): NFTStatistics => {
    const ownedNfts = new Set<string>();
    const processedTransactions = [...transactions].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    processedTransactions.forEach((tx) => {
      if (tx.tokenId && tx.to.toLowerCase() === walletAddress?.toLowerCase()) {
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
