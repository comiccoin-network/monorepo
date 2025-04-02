// src/api/endpoints/publicWalletApi.js
import { usePrivateQuery, usePrivateMutation } from "../../hooks/useApi";
import axiosClient from "../axiosClient";

// STATUS CONSTANTS
export const WALLET_STATUS = {
  ACTIVE: 1,
  ARCHIVED: 2,
  LOCKED: 3,
};

/**
 * Fetch a public wallet by its Ethereum address
 * Note: The backend uses POST for this operation
 */
export const getPublicWalletByAddress = async (address) => {
  const response = await axiosClient.post(`/public-wallets/${address}`);
  return response.data;
};

/**
 * Custom hook for listing public wallets with filtering
 */
export const useListPublicWallets = (filters = {}, options = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.userId) queryParams.append("user_id", filters.userId);
  if (filters.createdAtStart)
    queryParams.append("created_at_start", filters.createdAtStart);
  if (filters.createdAtEnd)
    queryParams.append("created_at_end", filters.createdAtEnd);
  if (filters.value) queryParams.append("value", filters.value);
  if (filters.lastId) queryParams.append("last_id", filters.lastId);
  if (filters.lastCreatedAt)
    queryParams.append("last_created_at", filters.lastCreatedAt);
  if (filters.limit) queryParams.append("limit", filters.limit);

  const queryString = queryParams.toString();
  const endpoint = `/public-wallets${queryString ? `?${queryString}` : ""}`;

  return usePrivateQuery(["publicWallets", filters], endpoint, options);
};

/**
 * Custom hook for creating a public wallet
 */
export const useCreatePublicWallet = (options = {}) => {
  return usePrivateMutation("/public-wallets", "post", {
    invalidateQueries: ["publicWallets"],
    ...options,
  });
};

/**
 * Custom hook for updating a public wallet by Ethereum address
 */
export const useUpdatePublicWalletByAddress = (address, options = {}) => {
  return usePrivateMutation(`/public-wallets/${address}`, "put", {
    invalidateQueries: [["publicWallet", "address", address], "publicWallets"],
    ...options,
  });
};

/**
 * Custom hook for deleting a public wallet by Ethereum address
 */
export const useDeletePublicWalletByAddress = (address, options = {}) => {
  return usePrivateMutation(`/public-wallets/${address}`, "delete", {
    invalidateQueries: ["publicWallets"],
    ...options,
  });
};

/**
 * Transform a PublicWallet from API format to frontend format
 */
export function transformPublicWallet(wallet) {
  if (!wallet) return null;

  return {
    id: wallet.id,
    address: wallet.address,
    chainId: wallet.chain_id,
    name: wallet.name,
    description: wallet.description,
    thumbnailS3Key: wallet.thumbnail_s3_key,
    viewCount: wallet.view_count,
    status: wallet.status,
    createdAt: wallet.created_at,
    createdByUserId: wallet.created_by_user_id,
    createdByName: wallet.created_by_name,
    createdFromIPAddress: wallet.created_from_ip_address,
    modifiedAt: wallet.modified_at,
    modifiedByUserId: wallet.modified_by_user_id,
    modifiedByName: wallet.modified_by_name,
    modifiedFromIPAddress: wallet.modified_from_ip_address,

    // Helper methods
    get formattedAddress() {
      if (!this.address) return "";
      return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
    },

    get isActive() {
      return this.status === WALLET_STATUS.ACTIVE;
    },

    get isArchived() {
      return this.status === WALLET_STATUS.ARCHIVED;
    },

    get isLocked() {
      return this.status === WALLET_STATUS.LOCKED;
    },
  };
}

/**
 * Prepare wallet data for API submission
 */
export function prepareWalletForApi(wallet) {
  return {
    address: wallet.address,
    chain_id: wallet.chainId,
    name: wallet.name,
    description: wallet.description,
    thumbnail_s3_key: wallet.thumbnailS3Key,
    view_count: wallet.viewCount,
    status: wallet.status,
  };
}

export default {
  getPublicWalletByAddress,
  useListPublicWallets,
  useCreatePublicWallet,
  useUpdatePublicWalletByAddress,
  useDeletePublicWalletByAddress,
  transformPublicWallet,
  prepareWalletForApi,
  WALLET_STATUS,
};
