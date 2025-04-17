// monorepo/web/comiccoin-iam/src/hooks/usePublicWalletDirectory.js
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getPublicWalletFromDirectoryByAddress,
  useListPublicWalletsFromDirectory,
  searchPublicWalletsFromDirectory,
  trackWalletViewInDirectory,
  WALLET_TYPE,
  WALLET_STATUS,
} from "../api/endpoints/publicWalletDirectoryApi";
import { transformPublicWallet } from "../api/endpoints/publicWalletApi";

/**
 * Custom hook for accessing public wallet directory data without authentication
 */
export function usePublicWalletDirectory() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setSuccess(false);
  }, []);

  /**
   * Fetch a public wallet from directory by Ethereum address
   */
  const fetchWalletByAddress = useCallback(
    async (address) => {
      reset();
      setIsLoading(true);

      try {
        console.log("🔄 Fetching public wallet from directory:", address);

        const response = await getPublicWalletFromDirectoryByAddress(address);

        const wallet = response.public_wallet
          ? transformPublicWallet(response.public_wallet)
          : null;

        setSuccess(true);
        return wallet;
      } catch (err) {
        console.error("❌ Error fetching wallet from directory:", err);

        const errorMessage =
          err.message || "Failed to fetch wallet from directory";
        setError(new Error(errorMessage));

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [reset],
  );

  /**
   * Search for wallets in directory
   */
  const searchWallets = useCallback(
    async (searchTerm, limit = 20) => {
      reset();
      setIsLoading(true);

      try {
        console.log("🔄 Searching public wallets in directory:", searchTerm);

        const response = await searchPublicWalletsFromDirectory(
          searchTerm,
          limit,
        );

        const wallets = response.public_wallets
          ? response.public_wallets.map(transformPublicWallet)
          : [];

        setSuccess(true);
        return wallets;
      } catch (err) {
        console.error("❌ Error searching wallets in directory:", err);

        const errorMessage =
          err.message || "Failed to search wallets in directory";
        setError(new Error(errorMessage));

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [reset],
  );

  /**
   * Track a wallet view in the directory
   */
  const trackWalletView = useCallback(async (address) => {
    try {
      return await trackWalletViewInDirectory(address);
    } catch (err) {
      console.error("❌ Error tracking wallet view:", err);
      return false;
    }
  }, []);

  return {
    fetchWalletByAddress,
    searchWallets,
    trackWalletView,
    isLoading,
    error,
    success,
    reset,
    WALLET_STATUS,
    WALLET_TYPE,
  };
}

/**
 * Custom hook for listing public wallets from directory
 */
export function usePublicWalletDirectoryList(filters = {}, options = {}) {
  const { data, isLoading, error, refetch } = useListPublicWalletsFromDirectory(
    filters,
    options,
  );

  // Transform the response data
  const wallets = data?.public_wallets
    ? data.public_wallets.map(transformPublicWallet)
    : [];

  // Extract pagination info
  const pagination = {
    hasMore: data?.has_more || false,
    lastId: data?.last_id || null,
    lastCreatedAt: data?.last_created_at || null,
    total: data?.total || 0,
  };

  return {
    wallets,
    pagination,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Custom hook for fetching a single wallet from directory by address
 */
export function useSinglePublicWalletFromDirectory(address, options = {}) {
  return useQuery({
    queryKey: ["publicWalletDirectory", address],
    queryFn: async () => {
      if (!address) return null;

      const response = await getPublicWalletFromDirectoryByAddress(address);
      return response.public_wallet
        ? transformPublicWallet(response.public_wallet)
        : null;
    },
    enabled: !!address && options.enabled !== false,
    ...options,
  });
}

// Export constants
export { WALLET_STATUS, WALLET_TYPE };

// Export hooks
export default {
  usePublicWalletDirectory,
  usePublicWalletDirectoryList,
  useSinglePublicWalletFromDirectory,
};
