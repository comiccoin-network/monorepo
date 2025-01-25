// monorepo/native/mobile/comiccoin-wallet/src/hooks/useNFTAsset.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import nftAssetService from "../services/nft/AssetService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// NFTAssetOptions interface update
interface NFTAssetOptions {
  cacheDuration?: number;
  enabled?: boolean;
  onProgress?: (progress: number) => void;
}

// Constants for cache configuration
const CACHE_CONFIG = {
  STORAGE_PREFIX: "nft_asset_",
  STALE_TIME: 1000 * 60 * 5, // 5 minutes
  CACHE_TIME: 1000 * 60 * 30, // 30 minutes
  MAX_BINARY_SIZE: 10 * 1024 * 1024, // 10MB - adjust based on your needs
};

// useNFTAsset hook update
export const useNFTAsset = (
  cid: string | null,
  options: NFTAssetOptions = {},
) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const queryClient = useQueryClient();

  // Pass progress updates to the parent component
  useEffect(() => {
    if (options.onProgress) {
      options.onProgress(loadingProgress);
    }
  }, [loadingProgress, options.onProgress]);

  return useQuery({
    queryKey: ["nft-asset", cid],
    queryFn: async ({ queryKey }) => {
      const [_, assetCid] = queryKey;
      if (!assetCid) throw new Error("CID is required");

      try {
        const asset = await nftAssetService.getNFTAsset(assetCid, {
          onProgress: (progress) => {
            setLoadingProgress(progress);
            console.log(`Loading asset progress: ${progress}%`);
          },
        });

        return {
          asset,
          source: "network" as const,
        };
      } catch (error) {
        console.error("Failed to fetch NFT asset:", error);
        throw error;
      }
    },
    enabled: !!cid && options.enabled !== false,
    staleTime: options.cacheDuration || 1000 * 60 * 5, // 5 minutes default
    cacheTime: 1000 * 60 * 30, // 30 minutes
    keepPreviousData: true,
  });
};

// Updated prefetch utility function
export const prefetchNFTAsset = async (
  queryClient: ReturnType<typeof useQueryClient>,
  cid: string,
) => {
  return queryClient.prefetchQuery({
    queryKey: ["nft-asset", cid],
    queryFn: async () => {
      const asset = await nftAssetService.getNFTAsset(cid);
      // Use the extracted cache utils
      await cacheUtils.saveToCache(cid, asset);
      return { asset, source: "prefetch" as const };
    },
    staleTime: CACHE_CONFIG.STALE_TIME,
  });
};
