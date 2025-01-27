// monorepo/native/mobile/comiccoin-wallet/src/hooks/useNFTCollection.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useNFTTransactions } from "./useNFTTransactions";
import { fetchNFTMetadata } from "../services/nft/MetadataService";

interface NFTTransaction {
  from: string;
  to: string;
  tokenId: string;
  tokenMetadataURI: string;
}

interface NFTMetadata {
  metadata: any;
  rawAsset: {
    content: Uint8Array;
    content_type: string | null;
    content_length: number;
  };
}

interface NFT {
  tokenId: string;
  tokenMetadataURI: string;
  transactions: NFTTransaction[];
  metadata?: any;
  rawAsset?: NFTMetadata["rawAsset"];
  source?: "network" | "cache";
  error?: string;
}

interface NFTCollectionResponse {
  nftCollection: NFT[];
  statistics: any;
}

export const useNFTCollection = (walletAddress: string | null) => {
  const queryClient = useQueryClient();
  const {
    transactions,
    loading: txLoading,
    error: txError,
    statistics,
    refresh: refreshTransactions,
  } = useNFTTransactions(walletAddress);

  const getOwnedNFTs = (
    transactions: NFTTransaction[] | null,
    address: string | null,
  ): Map<string, NFT> => {
    if (!transactions || !address) return new Map();

    const nftMap = new Map<string, NFT>();
    const normalizedWallet = address.toLowerCase();

    for (const tx of transactions) {
      const isOutgoing = tx.from.toLowerCase() === normalizedWallet;
      const isIncoming = tx.to.toLowerCase() === normalizedWallet;

      if (isOutgoing) {
        nftMap.delete(tx.tokenId);
      } else if (isIncoming && !nftMap.has(tx.tokenId)) {
        nftMap.set(tx.tokenId, {
          tokenId: tx.tokenId,
          tokenMetadataURI: tx.tokenMetadataURI,
          transactions: [tx],
        });
      }
    }
    return nftMap;
  };

  const fetchNFTCollectionData = async (): Promise<NFTCollectionResponse> => {
    if (txLoading || !walletAddress) {
      return { nftCollection: [], statistics };
    }

    const ownedNFTs = getOwnedNFTs(transactions, walletAddress);
    const nftsWithMetadata: NFT[] = [];

    await Promise.all(
      Array.from(ownedNFTs.values()).map(async (nft) => {
        try {
          // Check for existing metadata and raw asset in cache
          const cachedData = queryClient.getQueryData<NFTMetadata>([
            "nft-metadata",
            nft.tokenId,
          ]);

          // Only fetch new metadata if we don't have it cached
          if (cachedData?.rawAsset?.content) {
            nftsWithMetadata.push({
              ...nft,
              metadata: cachedData.metadata,
              rawAsset: cachedData.rawAsset,
              source: "cache",
            });
            return;
          }

          // Fetch fresh metadata if not in cache
          const { metadata, rawAsset } = await fetchNFTMetadata(
            nft.tokenMetadataURI,
          );

          // Cache the new metadata and raw asset
          queryClient.setQueryData(["nft-metadata", nft.tokenId], {
            metadata,
            rawAsset,
          });

          nftsWithMetadata.push({
            ...nft,
            metadata,
            rawAsset,
            source: "network",
          });
        } catch (err) {
          const error = err instanceof Error ? err.message : "Unknown error";
          nftsWithMetadata.push({
            ...nft,
            metadata: null,
            rawAsset: null,
            error,
          });
        }
      }),
    );

    return { nftCollection: nftsWithMetadata, statistics };
  };

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["nft-collection", walletAddress],
    queryFn: fetchNFTCollectionData,
    enabled: !!walletAddress,
    staleTime: 0, // Always consider data stale
    refetchOnMount: "always", // Refetch whenever component mounts
    refetchOnWindowFocus: true,
  });

  // Enhanced refresh function
  const refresh = useCallback(async () => {
    // Only invalidate transaction and collection data, not metadata
    await queryClient.invalidateQueries(["nft-collection"]);
    await queryClient.invalidateQueries(["nftTransactions"]);

    // Force refetch transactions first
    await refreshTransactions();

    // Then refetch the collection data
    await refetch();
  }, [refreshTransactions, refetch, queryClient]);

  useEffect(() => {
    if (walletAddress) {
      refresh();
    }
  }, [walletAddress, refresh]);

  return {
    nftCollection: data?.nftCollection ?? [],
    loading: isLoading || txLoading,
    error: error ?? txError,
    statistics: data?.statistics,
    refresh,
  };
};
