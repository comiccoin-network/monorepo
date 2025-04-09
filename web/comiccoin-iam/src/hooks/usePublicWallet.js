// monorepo/web/comiccoin-iam/src/hooks/usePublicWallet.js
import { useState, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import {
  getPublicWalletByAddress,
  useCreatePublicWallet,
  useUpdatePublicWalletByAddress,
  useDeletePublicWalletByAddress,
  useListPublicWallets,
  transformPublicWallet,
  prepareWalletForApi,
  WALLET_STATUS,
  WALLET_TYPE,
} from "../api/endpoints/publicWalletApi";

/**
 * Custom hook for managing public wallet operations
 */
export function usePublicWallet() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get API hooks
  const { mutateAsync: createWallet } = useCreatePublicWallet();
  const updateWalletHook = useUpdatePublicWalletByAddress();
  const deleteWalletHook = useDeletePublicWalletByAddress();

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setSuccess(false);
  }, []);

  /**
   * Fetch a public wallet by Ethereum address
   */
  const fetchWalletByAddress = useCallback(
    async (address) => {
      reset();
      setIsLoading(true);

      try {
        console.log("🔄 Fetching public wallet:", address);

        const response = await getPublicWalletByAddress(address);

        const wallet = response.public_wallet
          ? transformPublicWallet(response.public_wallet)
          : null;

        setSuccess(true);
        return wallet;
      } catch (err) {
        console.error("❌ Error fetching wallet:", err);

        const errorMessage = err.message || "Failed to fetch wallet";
        setError(new Error(errorMessage));

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [reset],
  );

  /**
   * Create a new public wallet
   */
  const createPublicWallet = useCallback(
    async (walletData) => {
      reset();
      setIsLoading(true);

      try {
        console.log("🔄 Creating public wallet");

        const apiData = prepareWalletForApi(walletData);
        const response = await createWallet(apiData);

        const wallet = response.public_wallet
          ? transformPublicWallet(response.public_wallet)
          : null;

        setSuccess(true);
        return wallet;
      } catch (err) {
        console.error("❌ Error creating wallet:", err);

        setError(new Error(err.message || "Failed to create wallet"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [createWallet, reset],
  );

  /**
   * Update an existing public wallet
   */
  const updatePublicWallet = useCallback(
    async (address, walletData) => {
      reset();
      setIsLoading(true);

      try {
        console.log("🔄 Updating public wallet:", address);
        console.log("With data:", walletData);

        // Make sure address is valid
        if (!address) {
          throw new Error("Address is required to update a wallet");
        }

        const apiData = prepareWalletForApi(walletData);
        console.log("Prepared API data:", apiData);
        console.log("Sending to endpoint:", `/public-wallets/${address}`);

        // Use direct axios call as a fallback if the hook has issues
        let response;
        try {
          // Try to use the hook first
          response = await updateWalletHook.mutateAsync(address, apiData);
        } catch (hookError) {
          console.warn(
            "Hook-based update failed, trying direct API call:",
            hookError,
          );
          // Fall back to direct API call
          response = await axiosClient.put(
            `/public-wallets/${address}`,
            apiData,
          );
          response = response.data; // Extract data from axios response
        }

        const wallet = response.public_wallet
          ? transformPublicWallet(response.public_wallet)
          : null;

        setSuccess(true);
        return wallet;
      } catch (err) {
        console.error("❌ Error updating wallet:", err);

        setError(new Error(err.message || "Failed to update wallet"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateWalletHook, reset],
  );

  /**
   * Delete a public wallet
   */
  const deletePublicWallet = useCallback(
    async (address) => {
      reset();
      setIsLoading(true);

      try {
        console.log("🔄 Deleting public wallet:", address);

        if (!address) {
          throw new Error("Address is required to delete a wallet");
        }

        await deleteWalletHook.mutateAsync(address);

        setSuccess(true);
        return true;
      } catch (err) {
        console.error("❌ Error deleting wallet:", err);

        setError(new Error(err.message || "Failed to delete wallet"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [deleteWalletHook, reset],
  );

  return {
    fetchWalletByAddress,
    createPublicWallet,
    updatePublicWallet,
    deletePublicWallet,
    isLoading,
    error,
    success,
    reset,
    WALLET_STATUS,
    WALLET_TYPE,
  };
}

/**
 * Custom hook for listing public wallets with filtering
 */
export function usePublicWalletList(filters = {}, options = {}) {
  const { data, isLoading, error, refetch } = useListPublicWallets(
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
  };

  return {
    wallets,
    pagination,
    isLoading,
    error,
    refetch,
  };
}

// Export constants
export { WALLET_STATUS, WALLET_TYPE };

// Export hooks
export default {
  usePublicWallet,
  usePublicWalletList,
};
