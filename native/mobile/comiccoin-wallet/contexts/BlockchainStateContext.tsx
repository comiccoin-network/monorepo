// monorepo/native/mobile/comiccoin-wallet/contexts/BlockchainStateContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import BlockchainStateService, {
  BlockchainState,
} from "../services/blockchain/BlockchainStateService";

interface BlockchainContextType {
  blockchainState: BlockchainState | null;
  isConnected: boolean;
  error: Error | null;
  reconnect: () => void;
}

export const BlockchainContext = createContext<BlockchainContextType>({
  blockchainState: null,
  isConnected: false,
  error: null,
  reconnect: () => {},
});

interface BlockchainProviderProps {
  children: React.ReactNode;
  chainId?: number;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({
  children,
  chainId = 1,
}) => {
  const [blockchainState, setBlockchainState] =
    useState<BlockchainState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const service = new BlockchainStateService(chainId);
    let mounted = true;

    const handleMessage = (data: string) => {
      if (mounted) {
        try {
          const parsedState = JSON.parse(data) as BlockchainState;
          setBlockchainState(parsedState);
          setIsConnected(true);
          setError(null);
        } catch (e) {
          setError(new Error("Failed to parse blockchain state"));
        }
      }
    };

    const handleError = (err: any) => {
      if (mounted) {
        setError(err instanceof Error ? err : new Error("Connection error"));
        setIsConnected(false);
      }
    };

    service.connect(handleMessage, handleError);

    return () => {
      mounted = false;
      service.disconnect();
      setIsConnected(false);
    };
  }, [chainId]);

  const reconnect = () => {
    setIsConnected(false);
    setTimeout(() => setIsConnected(true), 1000);
  };

  return (
    <BlockchainContext.Provider
      value={{
        blockchainState,
        isConnected,
        error,
        reconnect,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};
