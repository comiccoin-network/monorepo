// hooks/useWalletConnect.js
import { useConnectWallet } from "../api/endpoints/walletApi";

/**
 * Hook for connecting a wallet to a user account
 * This is a simple wrapper around the API hook for better separation of concerns
 * and consistency with other hooks in the application
 *
 * @returns {Object} Object containing the connect function, loading state, and error state
 */
export function useWalletConnect() {
  // Use the API endpoint hook directly
  const { connectWallet, isConnecting, error } = useConnectWallet();

  return {
    connectWallet,
    isConnecting,
    error,
  };
}

export default useWalletConnect;
