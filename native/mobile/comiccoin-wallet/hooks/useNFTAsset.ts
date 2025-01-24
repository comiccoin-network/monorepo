// monorepo/native/mobile/comiccoin-wallet/src/hooks/useNFTAsset.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import nftAssetService from "../services/nft/AssetService";

interface NFTAssetOptions {
  cacheDuration?: number;
  enabled?: boolean;
}

interface NFTAsset {
  filename: string;
  content: Uint8Array;
  content_type: string | null;
  content_length: number;
}

import { useState } from "react";

export const useNFTAsset = (
  cid: string | null,
  options: { enabled?: boolean } = {},
) => {
  const [loadingProgress, setLoadingProgress] = useState(0);

  return useQuery({
    queryKey: ["nft-asset", cid],
    queryFn: async () => {
      if (!cid) throw new Error("CID is required");

      try {
        console.log("Starting to fetch NFT asset for CID:", cid);

        const asset = await nftAssetService.getNFTAsset(cid, {
          onProgress: (progress) => {
            setLoadingProgress(progress);
            console.log(`Loading asset progress: ${progress}%`);
          },
        });

        console.log("asset:", asset);

        console.log("Successfully fetched NFT asset:", {
          contentType: asset.content_type,
          contentLength: asset.content_length,
        });

        return { asset, source: "network" as const };
      } catch (error) {
        console.error("Failed to fetch NFT asset:", error);
        throw error;
      }
    },
    enabled: !!cid && options.enabled,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });
};
