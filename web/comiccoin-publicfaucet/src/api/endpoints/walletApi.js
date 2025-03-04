// src/api/endpoints/walletApi.js
import { useState, useCallback } from "react";
import { usePrivateMutation } from "../../hooks/useApi";

/**
 * Custom hook for connecting a wallet to a user account
 * Uses the private mutation hook which handles authentication and error management
 *
 * @param {Object} options - Optional configuration options
 * @returns {Object} Object containing connect function, loading state, and error state
 */
export function useConnectWallet(options = {}) {
  const [error, setError] = useState(null);

  // Use the privateMutation hook from API utilities
  const {
    mutateAsync,
    isLoading,
    error: apiError,
  } = usePrivateMutation("/me/connect-wallet", "post", {
    // Add any specific options
    ...options,
  });

  /**
   * Connect a wallet address to the user's account
   * @param {string} walletAddress - The wallet address to connect
   * @returns {Promise<boolean>} Promise resolving to a boolean indicating success
   */
  const connectWallet = useCallback(
    async (walletAddress) => {
      console.log("🔄 WALLET: Starting wallet connection process", {
        walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      });

      setError(null);

      try {
        // Make the API call
        const response = await mutateAsync({
          wallet_address: walletAddress,
        });

        console.log("✅ WALLET: Wallet connected successfully");

        // Check if response contains the expected data
        const lowercaseWalletAddress = walletAddress.toLowerCase();
        if (response && response.wallet_address === lowercaseWalletAddress) {
          return true;
        } else {
          console.warn("⚠️ WALLET: Unexpected response from server", response);
          return false;
        }
      } catch (err) {
        console.error("❌ WALLET: Wallet connection error:", err);
        const formattedError =
          err instanceof Error ? err : new Error("Failed to connect wallet");
        setError(formattedError);
        return false;
      }
    },
    [mutateAsync],
  );

  return {
    connectWallet,
    isConnecting: isLoading,
    error: error || apiError,
  };
}
