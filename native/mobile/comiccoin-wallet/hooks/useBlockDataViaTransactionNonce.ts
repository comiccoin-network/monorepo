// monorepo/native/mobile/comiccoin-wallet/src/hooks/useBlockDataViaTransactionNonce.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import blockDataViaTransactionNonceService from "../services/blockdata/BlockDataViaTransactionNonceService";

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
  setTransactionNonce: (nonce: string | number) => void;
}

export function useBlockDataViaTransactionNonce(
  initialTransactionNonce: string | number,
): UseBlockDataResult {
  const queryClient = useQueryClient();
  const [transactionNonce, setTransactionNonce] = useState<string | number>(
    initialTransactionNonce,
  );
  const [error, setError] = useState<string | null>(null);

  const {
    data: blockData,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["blockData", transactionNonce],
    queryFn: async () => {
      try {
        if (
          !blockDataViaTransactionNonceService.validateTransactionNonce(
            transactionNonce,
          )
        ) {
          throw new Error("Invalid transaction nonce format");
        }

        const data =
          await blockDataViaTransactionNonceService.getBlockDataByTransactionNonce(
            transactionNonce,
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
    setTransactionNonce,
  };
}
