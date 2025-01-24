// monorepo/native/mobile/comiccoin-wallet/src/hooks/useBlockDataViaHeaderNumber.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import blockDataViaHeaderNumberService from "../services/blockdata/BlockDataViaHeaderNumberService";

interface BlockHeader {
  NumberString: string;
  TimeString: string;
  PreviousHeaderHashString: string;
  MerkleRootHashString: string;
}

interface BlockValidator {
  AddressString: string;
  PublicKeyString: string;
}

interface MerkleTree {
  RootHash: string;
  Depth: number;
}

interface BlockData {
  Header: BlockHeader;
  HeaderSignatureBytes: Uint8Array;
  MerkleTree: MerkleTree;
  Validator: BlockValidator;
}

interface UseBlockDataResult {
  blockData: BlockData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setHeaderNumber: (headerNumber: string | number) => void;
}

export function useBlockDataViaHeaderNumber(
  initialHeaderNumber: string | number,
): UseBlockDataResult {
  const queryClient = useQueryClient();
  const [headerNumber, setHeaderNumber] = useState<string | number>(
    initialHeaderNumber,
  );
  const [error, setError] = useState<string | null>(null);

  const {
    data: blockData,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["blockData", headerNumber],
    queryFn: async () => {
      try {
        if (
          !blockDataViaHeaderNumberService.validateHeaderNumber(headerNumber)
        ) {
          throw new Error("Invalid header number format");
        }

        const data =
          await blockDataViaHeaderNumberService.getBlockDataByHeaderNumber(
            headerNumber,
          );
        return data as BlockData;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        return null;
      }
    },
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,
  });

  const handleRefetch = async () => {
    setError(null);
    await refetch();
  };

  return {
    blockData,
    loading,
    error,
    refetch: handleRefetch,
    setHeaderNumber,
  };
}
