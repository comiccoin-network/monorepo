// monorepo/native/mobile/comiccoin-publicfaucet/hooks/useGetFaucet.ts
import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import faucetService, { FaucetDTO } from "../services/faucet/FaucetService";

interface UseGetFaucetOptions {
  chainId?: number;
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseGetFaucetResult {
  faucet: FaucetDTO | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setChainId: (chainId: number) => void;
}

/**
 * Custom hook to manage faucet data fetching and caching using React Query
 * @param options - Configuration options for fetching faucet data
 * @returns Faucet data management object
 */
export function useGetFaucet({
  chainId = 1,
  refreshInterval = 60000,
  enabled = true,
}: UseGetFaucetOptions = {}): UseGetFaucetResult {
  const queryClient = useQueryClient();
  const [currentChainId, setCurrentChainId] = useState<number>(chainId);
  const [error, setError] = useState<string | null>(null);

  // Use React Query to manage data fetching
  const {
    data: faucet,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["faucet", currentChainId],
    queryFn: async () => {
      try {
        const data = await faucetService.getFaucetData(currentChainId);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";

        setError(errorMessage);
        return null;
      }
    },
    enabled: enabled,
    staleTime: refreshInterval,
    cacheTime: 5 * 60 * 1000, // 5 minutes cache
    refetchInterval: refreshInterval,
  });

  // Handle refetch manually
  const handleRefetch = async () => {
    setError(null);
    await refetch();
  };

  // Handle chain ID updates
  const handleSetChainId = useCallback((newChainId: number) => {
    setCurrentChainId(newChainId);
  }, []);

  return {
    faucet,
    loading,
    error,
    refetch: handleRefetch,
    setChainId: handleSetChainId,
  };
}

export default useGetFaucet;
