// src/api/endpoints/publicWalletApi.js
// src/api/endpoints/publicWalletApi.js
import { usePrivateQuery, usePrivateMutation } from "../../hooks/useApi";
import axiosClient from "../axiosClient";

// STATUS CONSTANTS
export const WALLET_STATUS = {
  ACTIVE: 1,
  ARCHIVED: 2,
  LOCKED: 3,
};

// Add wallet type constants to match Go backend
export const WALLET_TYPE = {
  INDIVIDUAL: 3,
  COMPANY: 2,
};

/**
 * Fetch a public wallet by its Ethereum address
 * Note: The backend uses POST for this operation
 */
export const getPublicWalletByAddress = async (address) => {
  const response = await axiosClient.get(`/public-wallets/${address}`);
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
 * MODIFIED: Now accepts address during the mutation call, not at initialization
 */
export const useUpdatePublicWalletByAddress = (options = {}) => {
  return {
    mutateAsync: async (address, data) => {
      if (!address) {
        throw new Error("Address is required for updating a public wallet");
      }

      const endpoint = `/public-wallets/${address}`;
      const { mutateAsync } = usePrivateMutation(endpoint, "put", {
        invalidateQueries: [["publicWallet", address], "publicWallets"],
        ...options,
      });

      return mutateAsync(data);
    },
    // You might need to add other properties if you're using them elsewhere
    isLoading: false, // This should be handled properly in a real implementation
    error: null,
    reset: () => {},
  };
};

/**
 * Custom hook for deleting a public wallet by Ethereum address
 */
export const useDeletePublicWalletByAddress = (options = {}) => {
  return {
    mutateAsync: async (address) => {
      if (!address) {
        throw new Error("Address is required for deleting a public wallet");
      }

      const endpoint = `/public-wallets/${address}`;
      const { mutateAsync } = usePrivateMutation(endpoint, "delete", {
        invalidateQueries: ["publicWallets"],
        ...options,
      });

      return mutateAsync();
    },
    // Similar to above, add other properties as needed
    isLoading: false,
    error: null,
    reset: () => {},
  };
};

/**
 * Transform a PublicWallet from API format to frontend format
 */
export function transformPublicWallet(wallet) {
  if (!wallet) return null;

  return {
    // Core fields from Go struct
    id: wallet.id,
    address: wallet.address,
    chainId: wallet.chain_id,
    name: wallet.name,
    description: wallet.description,
    websiteURL: wallet.website_url,
    phone: wallet.phone,
    country: wallet.country,
    timezone: wallet.timezone,
    region: wallet.region,
    city: wallet.city,
    postalCode: wallet.postal_code,
    addressLine1: wallet.address_line1,
    addressLine2: wallet.address_line2,
    isVerified: wallet.is_verified,
    verifiedOn: wallet.verified_on,
    type: wallet.type,
    thumbnailS3Key: wallet.thumbnail_s3_key,
    viewCount: wallet.view_count,
    uniqueViewCount: wallet.unique_view_count, // Added
    status: wallet.status,

    // Audit fields from Go struct
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
      // Ensure address is a string before slicing
      const addrStr = String(this.address);
      if (addrStr.length <= 10) return addrStr; // Avoid slicing if too short
      return `${addrStr.slice(0, 6)}...${addrStr.slice(-4)}`;
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
    view_count: wallet.viewCount || 0,
    website_url: wallet.websiteURL,
    status: wallet.status,
    type: wallet.type,
    user_id: wallet.userId,
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
  WALLET_TYPE,
};
