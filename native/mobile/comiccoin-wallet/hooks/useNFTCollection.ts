// monorepo/native/mobile/comiccoin-wallet/hooks/useNFTCollection.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useNFTTransactions } from "./useNFTTransactions";
import { fetchNFTMetadata } from "../services/nft/MetadataService";

// Types for our NFTs and transactions
interface NFTTransaction {
  from: string;
  to: string;
  tokenId: string;
  tokenMetadataURI: string;
  timestamp: string;
}

interface NFTMetadata {
  name?: string;
  image?: string;
  description?: string;
  attributes?: {
    grade?: string;
  };
}

interface NFT {
  tokenId: string;
  tokenMetadataURI: string;
  transactions: NFTTransaction[];
  metadata?: NFTMetadata;
}

export const useNFTCollection = (walletAddress: string | null) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get NFT transactions using the existing hook
  const {
    transactions,
    loading: txLoading,
    error: txError,
    refresh: refreshTransactions,
  } = useNFTTransactions(walletAddress);

  // Helper function to process transactions and get currently owned NFTs
  const processTransactions = useCallback(
    (transactions: NFTTransaction[], walletAddress: string): NFT[] => {
      // Keep track of current ownership state
      const ownedNFTs = new Map<string, NFT>();
      const normalizedWallet = walletAddress.toLowerCase();

      // Sort transactions by timestamp in descending order (newest first)
      const sortedTransactions = [...transactions].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      // Process each transaction to determine current ownership
      for (const tx of sortedTransactions) {
        const isReceived = tx.to.toLowerCase() === normalizedWallet;
        const isSent = tx.from.toLowerCase() === normalizedWallet;

        if (isReceived && !ownedNFTs.has(tx.tokenId)) {
          // We received this NFT and haven't processed a more recent transaction for it
          ownedNFTs.set(tx.tokenId, {
            tokenId: tx.tokenId,
            tokenMetadataURI: tx.tokenMetadataURI,
            transactions: [tx],
          });
        } else if (isSent) {
          // We sent this NFT away, remove it from our owned list
          ownedNFTs.delete(tx.tokenId);
        }
      }

      return Array.from(ownedNFTs.values());
    },
    [],
  );

  // Main query function to fetch NFT collection data
  const fetchNFTCollection = useCallback(async () => {
    if (!walletAddress || !transactions) {
      console.log("⚠️ No wallet address or transactions, skipping fetch");
      return [];
    }

    console.log("🔄 Starting NFT collection fetch...");

    // First get our owned NFTs from transaction history
    const ownedNFTs = processTransactions(transactions, walletAddress);
    console.log("📦 Found owned NFTs:", ownedNFTs.length);

    // Then fetch metadata for each owned NFT
    const nftsWithMetadata = await Promise.all(
      ownedNFTs.map(async (nft) => {
        try {
          const { metadata } = await fetchNFTMetadata(nft.tokenMetadataURI);
          return {
            ...nft,
            metadata,
          };
        } catch (error) {
          console.error(
            `Failed to fetch metadata for NFT ${nft.tokenId}:`,
            error,
          );
          return nft; // Return NFT without metadata if fetch fails
        }
      }),
    );

    console.log(
      "✅ NFT collection fetch complete:",
      nftsWithMetadata.length,
      "NFTs",
    );
    return nftsWithMetadata;
  }, [walletAddress, transactions, processTransactions]);

  // Main query hook with stable configuration
  const {
    data: nftCollection = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["nft-collection", walletAddress],
    queryFn: fetchNFTCollection,
    enabled: Boolean(walletAddress) && Boolean(transactions), // Removed !isRefreshing
    staleTime: 30000,
    cacheTime: 60000,
    retry: 2,
  });

  // Refresh function that coordinates transaction and collection updates
  const refresh = useCallback(async () => {
    if (isRefreshing) {
      console.log("⚠️ Refresh already in progress");
      return;
    }

    setIsRefreshing(true);
    console.log("🔄 Starting NFT collection refresh...");

    try {
      // First refresh transactions
      console.log("1️⃣ Refreshing transactions...");
      await refreshTransactions();

      // Then invalidate and immediately refetch
      console.log("2️⃣ Invalidating and refetching queries...");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["nft-collection", walletAddress],
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: ["nft-transactions"],
          exact: true,
        }),
      ]);

      // Force an immediate refetch
      await queryClient.refetchQueries({
        queryKey: ["nft-collection", walletAddress],
        exact: true,
        type: "active",
      });

      console.log("✅ NFT refresh complete");
    } catch (error) {
      console.error("❌ Error during NFT collection refresh:", error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [walletAddress, refreshTransactions, queryClient, isRefreshing]);

  // Helper for NFT images
  const getNFTImageUrl = useCallback((nft: NFT) => {
    if (!nft?.metadata?.image) return null;
    const imageUrl = nft.metadata.image;
    return imageUrl.startsWith("ipfs://")
      ? imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")
      : imageUrl;
  }, []);

  return {
    nftCollection,
    loading: isLoading || txLoading || isRefreshing,
    error: error || txError,
    refresh,
    getNFTImageUrl,
  };
};

export type { NFT, NFTTransaction, NFTMetadata };
