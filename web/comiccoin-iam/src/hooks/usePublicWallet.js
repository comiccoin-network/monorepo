// src/hooks/usePublicWallet.js
import { useState, useCallback } from "react";
import {
  getPublicWalletByAddress,
  useCreatePublicWallet,
  useUpdatePublicWalletByAddress,
  useDeletePublicWalletByAddress,
  useListPublicWallets,
  transformPublicWallet,
  prepareWalletForApi,
  WALLET_STATUS,
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
  const { mutateAsync: updateWallet } = useUpdatePublicWalletByAddress();
  const { mutateAsync: deleteWallet } = useDeletePublicWalletByAddress();

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

        const apiData = prepareWalletForApi(walletData);
        const response = await updateWallet(address, apiData);

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
    [updateWallet, reset],
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

        await deleteWallet(address);

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
    [deleteWallet, reset],
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

export default {
  usePublicWallet,
  usePublicWalletList,
  WALLET_STATUS,
};
