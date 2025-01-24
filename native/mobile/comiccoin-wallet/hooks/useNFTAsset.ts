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

export const useNFTAsset = (
  cid: string | null,
  options: NFTAssetOptions = {},
) => {
  const { cacheDuration = 24 * 60 * 60 * 1000 } = options;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["nft-asset", cid],
    queryFn: async () => {
      if (!cid) {
        throw new Error("CID is required");
      }

      const asset = await nftAssetService.getNFTAsset(cid);
      return { asset, source: "network" as const };
    },
    enabled: !!cid && !!options.enabled,
    staleTime: cacheDuration,
    cacheTime: cacheDuration,
    retry: (failureCount, error) => {
      return (
        error instanceof Error &&
        !error.message.includes("CID is required") &&
        failureCount < 3
      );
    },
  });
};
