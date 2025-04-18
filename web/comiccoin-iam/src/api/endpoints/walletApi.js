// monorepo/web/comiccoin-iam/src/api/endpoints/walletApi.js
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

        // Extract the actual error message from the API response
        let errorMessage = "Failed to connect wallet";

        // Check for Axios error with response data
        if (err.response && err.response.data) {
          // Log the entire response for debugging
          console.log("WALLET API Error Details:", err.response.data);

          // Extract the message from the response data
          if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (typeof err.response.data === "string") {
            errorMessage = err.response.data;
          } else {
            // If it's an object but doesn't have a message property
            errorMessage = JSON.stringify(err.response.data);
          }
        } else if (err.message) {
          // If there's no response data but there is an error message
          errorMessage = err.message;
        }

        // Create a new error with the extracted message
        const formattedError = new Error(errorMessage);

        // Copy any useful properties from the original error
        if (err.status) formattedError.status = err.status;
        if (err.response) formattedError.response = err.response;

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
