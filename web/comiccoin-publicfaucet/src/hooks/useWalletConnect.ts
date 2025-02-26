import { useState, useCallback } from 'react';
import walletService from '../services/walletService';

interface UseWalletConnectReturn {
  connectWallet: (walletAddress: string) => Promise<boolean>;
  isConnecting: boolean;
  error: Error | null;
}

/**
 * Hook for connecting a wallet to a user account
 * @returns Object containing the connect function, loading state, and error state
 */
export function useWalletConnect(): UseWalletConnectReturn {
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Connect a wallet address to the user's account
   * @param walletAddress - The wallet address to connect
   * @returns Promise resolving to a boolean indicating success
   */
  const connectWallet = useCallback(async (walletAddress: string): Promise<boolean> => {
    console.log("🔄 WALLET CONNECT: Starting wallet connection process", {
      walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
    });

    setIsConnecting(true);
    setError(null);

    try {
      const success = await walletService.connectWallet(walletAddress);
      console.log("✅ WALLET CONNECT: Wallet connected successfully");
      return success;
    } catch (err) {
      console.error("❌ WALLET CONNECT: Wallet connection error:", err);
      const formattedError = err instanceof Error ? err : new Error("Failed to connect wallet");
      setError(formattedError);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  return {
    connectWallet,
    isConnecting,
    error,
  };
}
