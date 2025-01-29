// monorepo/native/mobile/comiccoin-wallet/hooks/useBlockchainState.ts
// monorepo/native/mobile/comiccoin-wallet/hooks/useBlockchainState.ts
import { useState, useEffect, useCallback } from "react";
import BlockchainStateService from "../services/blockchain/BlockchainStateService";

interface UseBlockchainStateOptions {
  chainId?: number;
  onError?: (error: any) => void;
  onStateChange?: (latestHash: string | null) => void; // Add this line
}

export const useBlockchainState = (options: UseBlockchainStateOptions = {}) => {
  const { chainId = 1, onError, onStateChange } = options;
  const [latestHash, setLatestHash] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const service = new BlockchainStateService(chainId);
    let mounted = true;

    const handleMessage = (data: string) => {
      if (mounted) {
        const newHash = data.trim();
        setLatestHash(newHash);
        setIsConnected(true);
        setError(null);

        // Invoke the callback if provided
        if (onStateChange) {
          onStateChange(newHash);
        }
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
  }, [chainId, onError, onStateChange]); // Add onStateChange to the dependency array

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
