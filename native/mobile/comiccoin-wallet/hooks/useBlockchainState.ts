// monorepo/native/mobile/comiccoin-wallet/hooks/useBlockchainState.ts
import { useState, useEffect, useCallback } from "react";
import BlockchainStateService from "../services/blockchain/BlockchainStateService";

interface UseBlockchainStateOptions {
  chainId?: number;
  onError?: (error: any) => void;
}

export const useBlockchainState = (options: UseBlockchainStateOptions = {}) => {
  const { chainId = 1, onError } = options;
  const [latestHash, setLatestHash] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const service = new BlockchainStateService(chainId);
    let mounted = true;

    const handleMessage = (data: string) => {
      if (mounted) {
        setLatestHash(data.trim());
        setIsConnected(true);
        setError(null);
      }
    };

    const handleError = (err: any) => {
      if (mounted) {
        setError(err instanceof Error ? err : new Error("Connection error"));
        setIsConnected(false);
        if (onError) {
          onError(err);
        }
      }
    };

    // Connect to the SSE stream
    service.connect(handleMessage, handleError);
    setIsConnected(true);

    // Cleanup function
    return () => {
      mounted = false;
      service.disconnect();
      setIsConnected(false);
    };
  }, [chainId, onError]);

  const reconnect = useCallback(() => {
    // Force a re-render by changing the key in the useEffect
    setIsConnected(false);
    setTimeout(() => {
      setIsConnected(true);
    }, 1000);
  }, []);

  return {
    latestHash,
    isConnected,
    error,
    reconnect,
  };
};
