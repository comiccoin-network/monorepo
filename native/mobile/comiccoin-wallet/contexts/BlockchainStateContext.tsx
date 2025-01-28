// monorepo/native/mobile/comiccoin-wallet/contexts/BlockchainStateContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import BlockchainStateService from "../services/blockchain/BlockchainStateService";
import { useWallet } from "../hooks/useWallet";

interface BlockchainStateContextType {
  latestHash: string | null;
  isConnected: boolean;
  error: Error | null;
}

const BlockchainStateContext = createContext<BlockchainStateContextType>({
  latestHash: null,
  isConnected: false,
  error: null,
});

export const BlockchainStateProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [latestHash, setLatestHash] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { currentWallet } = useWallet();

  useEffect(() => {
    if (!currentWallet) {
      setIsConnected(false);
      return;
    }

    const service = new BlockchainStateService(1); // Assuming chain_id 1
    let mounted = true;

    const handleMessage = (data: string) => {
      if (mounted) {
        const newHash = data.trim();
        // Only update if the hash has changed
        if (newHash !== latestHash) {
          setLatestHash(newHash);
          // Dispatch a custom event that components can listen to
          const event = new CustomEvent("blockchainStateChanged", {
            detail: { latestHash: newHash },
          });
          window.dispatchEvent(event);
        }
        setIsConnected(true);
        setError(null);
      }
    };

    const handleError = (err: any) => {
      if (mounted) {
        setError(err instanceof Error ? err : new Error("Connection error"));
        setIsConnected(false);
      }
    };

    service.connect(handleMessage, handleError);
    setIsConnected(true);

    return () => {
      mounted = false;
      service.disconnect();
      setIsConnected(false);
    };
  }, [currentWallet]);

  return (
    <BlockchainStateContext.Provider value={{ latestHash, isConnected, error }}>
      {children}
    </BlockchainStateContext.Provider>
  );
};
