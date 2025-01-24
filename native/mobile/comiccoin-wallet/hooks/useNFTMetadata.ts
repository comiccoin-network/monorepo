// monorepo/native/mobile/comiccoin-wallet/src/hooks/useNFTMetadata.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNFTMetadata } from "../services/nft/MetadataService";

interface NFTMetadataOptions {
  cacheDuration?: number;
  enabled?: boolean;
}

interface RawAsset {
  content: Uint8Array;
  content_type: string | null;
  content_length: number;
}

interface NFTMetadataResponse {
  metadata: any;
  rawAsset: RawAsset;
  source: "network";
}

export const useNFTMetadata = (
  tokenMetadataURI: string | null,
  options: NFTMetadataOptions = {},
) => {
  const { cacheDuration = 60 * 60 * 1000, enabled = true } = options;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["nft-metadata", tokenMetadataURI],
    queryFn: async (): Promise<NFTMetadataResponse> => {
      if (!tokenMetadataURI) {
        throw new Error("Token metadata URI is required");
      }

      const { metadata, rawAsset } = await fetchNFTMetadata(tokenMetadataURI);
      return { metadata, rawAsset, source: "network" };
    },
    enabled: !!tokenMetadataURI && enabled,
    staleTime: cacheDuration,
    cacheTime: cacheDuration,
    retry: (failureCount, error) => {
      return (
        error instanceof Error &&
        !error.message.includes("Token metadata URI is required") &&
        failureCount < 3
      );
    },
  });
};
