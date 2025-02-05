// monorepo/native/mobile/comiccoin-wallet/hooks/useNFTCollection.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, useEffect, useRef } from "react";
import { useNFTTransactions } from "./useNFTTransactions";
import { fetchNFTMetadata } from "../services/nft/MetadataService";

// Types remain the same...
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

const NFT_COLLECTION_KEY = "nft-collection";

export const useNFTCollection = (walletAddress: string | null) => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mountCount = useRef(0);
  const lastProcessedTransactions = useRef<string | null>(null);

  // Track mount/unmount
  useEffect(() => {
    mountCount.current += 1;
    console.log("🎣 useNFTCollection hook mounted", {
      mountCount: mountCount.current,
      walletAddress,
      hasQueryClient: !!queryClient,
    });

    return () => {
      console.log("🔌 useNFTCollection hook unmounting", {
        mountCount: mountCount.current,
        walletAddress,
        lastProcessedTransactions: lastProcessedTransactions.current,
      });
    };
  }, [walletAddress, queryClient]);

  const {
    transactions,
    loading: txLoading,
    error: txError,
    refresh: refreshTransactions,
  } = useNFTTransactions(walletAddress);

  // Track transaction changes
  useEffect(() => {
    const txHash = transactions ? JSON.stringify(transactions) : null;
    console.log("📨 Transaction update detected:", {
      previousHash: lastProcessedTransactions.current,
      newHash: txHash,
      hasChanged: lastProcessedTransactions.current !== txHash,
      count: transactions?.length || 0,
    });
    lastProcessedTransactions.current = txHash;
  }, [transactions]);

  const processTransactions = useCallback(
    (transactions: NFTTransaction[], walletAddress: string): NFT[] => {
      console.log("⚙️ processTransactions starting", {
        transactionCount: transactions?.length || 0,
        walletAddress,
      });

      if (!transactions?.length) {
        console.log("⚠️ No transactions to process");
        return [];
      }

      const ownedNFTs = new Map<string, NFT>();
      const normalizedWallet = walletAddress.toLowerCase();

      const sortedTransactions = [...transactions].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      console.log(
        "🔄 Processing sorted transactions:",
        sortedTransactions.map((tx) => ({
          tokenId: tx.tokenId,
          from: tx.from.toLowerCase(),
          to: tx.to.toLowerCase(),
          timestamp: tx.timestamp,
        })),
      );

      for (const tx of sortedTransactions) {
        const isReceived = tx.to.toLowerCase() === normalizedWallet;
        const isSent = tx.from.toLowerCase() === normalizedWallet;

        if (isReceived && !ownedNFTs.has(tx.tokenId)) {
          console.log(`➕ Adding NFT ${tx.tokenId} to owned collection`);
          ownedNFTs.set(tx.tokenId, {
            tokenId: tx.tokenId,
            tokenMetadataURI: tx.tokenMetadataURI,
            transactions: [tx],
          });
        } else if (isSent) {
          console.log(`➖ Removing NFT ${tx.tokenId} from owned collection`);
          ownedNFTs.delete(tx.tokenId);
        }
      }

      const result = Array.from(ownedNFTs.values());
      console.log("✨ Processed transactions result:", {
        ownedNFTsCount: result.length,
        ownedTokenIds: result.map((nft) => nft.tokenId),
      });

      return result;
    },
    [],
  );

  const fetchNFTCollection = useCallback(async () => {
    console.log("🚀 fetchNFTCollection triggered", {
      hasWallet: !!walletAddress,
      hasTransactions: !!transactions,
      transactionCount: transactions?.length || 0,
    });

    if (!walletAddress || !transactions) {
      console.log("⛔ Missing required data for fetch");
      return [];
    }

    try {
      console.log("📊 Processing transactions...");
      const ownedNFTs = processTransactions(transactions, walletAddress);

      if (ownedNFTs.length === 0) {
        console.log("📭 No owned NFTs found");
        return [];
      }

      console.log("🎨 Fetching metadata for NFTs:", ownedNFTs);
      const nftsWithMetadata = await Promise.all(
        ownedNFTs.map(async (nft) => {
          try {
            const { metadata } = await fetchNFTMetadata(nft.tokenMetadataURI);
            console.log(`✅ Got metadata for NFT ${nft.tokenId}:`, metadata);
            return { ...nft, metadata };
          } catch (error) {
            console.log(
              `❌ Failed to fetch metadata for NFT ${nft.tokenId}:`,
              error,
            );
            return nft;
          }
        }),
      );

      console.log("🎉 NFT collection complete:", nftsWithMetadata);
      return nftsWithMetadata;
    } catch (error) {
      console.log("💥 Error in fetchNFTCollection:", error);
      throw error;
    }
  }, [walletAddress, transactions, processTransactions]);

  // Force refetch when transactions change
  useEffect(() => {
    if (transactions?.length) {
      console.log("🔄 Transactions changed, forcing refetch...");
      queryClient.invalidateQueries({
        queryKey: [NFT_COLLECTION_KEY, walletAddress],
      });
    }
  }, [transactions, walletAddress, queryClient]);

  // Main query with debug
  const query = useQuery({
    queryKey: [NFT_COLLECTION_KEY, walletAddress],
    queryFn: fetchNFTCollection,
    enabled: Boolean(walletAddress) && Boolean(transactions?.length),
    gcTime: Infinity,
    staleTime: 0,
    retry: 2,
    retryDelay: 1000,
  });

  // Debug query state changes
  useEffect(() => {
    console.log("🔄 Query state changed:", {
      dataLength: query.data?.length || 0,
      isEnabled: Boolean(walletAddress) && Boolean(transactions?.length),
      isFetching: query.isFetching,
      isLoading: query.isLoading,
      isError: query.isError,
      transactions: transactions?.length,
    });
  }, [
    query.data,
    query.isFetching,
    query.isLoading,
    query.isError,
    walletAddress,
    transactions,
  ]);

  const refresh = useCallback(async () => {
    if (isRefreshing) {
      console.log("⏳ Refresh already in progress");
      return;
    }

    setIsRefreshing(true);
    console.log("🔄 Starting forced refresh");

    try {
      await refreshTransactions();
      await queryClient.invalidateQueries({
        queryKey: [NFT_COLLECTION_KEY, walletAddress],
      });
      await queryClient.refetchQueries({
        queryKey: [NFT_COLLECTION_KEY, walletAddress],
      });
      console.log("✅ Forced refresh complete");
    } catch (error) {
      console.log("❌ Refresh failed:", error);
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  }, [walletAddress, queryClient, refreshTransactions, isRefreshing]);

  return {
    nftCollection: query.data || [],
    loading: query.isLoading || txLoading || isRefreshing,
    isFetching: query.isFetching || isRefreshing,
    error: query.error || txError,
    refresh,
    getNFTImageUrl: useCallback((nft: NFT) => {
      if (!nft?.metadata?.image) return null;
      const imageUrl = nft.metadata.image;
      return imageUrl.startsWith("ipfs://")
        ? imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/")
        : imageUrl;
    }, []),
  };
};

export type { NFT, NFTTransaction, NFTMetadata };
