// src/api/endpoints/publicWalletDirectoryApi.js
import { usePublicQuery } from "../../hooks/useApi";
import axiosClient, { publicEndpoint } from "../axiosClient";
import { transformPublicWallet } from "./publicWalletApi";

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
 * Fetch a public wallet from directory by its Ethereum address without authentication
 */
export const getPublicWalletFromDirectoryByAddress = async (address) => {
  const response = await axiosClient.get(
    `/public-wallets-directory/${address}`,
    publicEndpoint({}),
  );
  return response.data;
};

/**
 * Custom hook for listing public wallets from directory without authentication
 */
export const useListPublicWalletsFromDirectory = (
  filters = {},
  options = {},
) => {
  const queryParams = new URLSearchParams();

  // Add filters to query params
  if (filters.createdByUserId)
    queryParams.append("created_by_user_id", filters.createdByUserId);
  if (filters.createdAtStart)
    queryParams.append("created_at_start", filters.createdAtStart);
  if (filters.createdAtEnd)
    queryParams.append("created_at_end", filters.createdAtEnd);
  if (filters.value) queryParams.append("value", filters.value);
  if (filters.lastId) queryParams.append("last_id", filters.lastId);
  if (filters.lastCreatedAt)
    queryParams.append("last_created_at", filters.lastCreatedAt);
  if (filters.limit) queryParams.append("limit", filters.limit);

  // For public endpoints, we may want to filter out non-active wallets by default
  if (filters.activeOnly && !filters.status)
    queryParams.append("status", WALLET_STATUS.ACTIVE);

  const queryString = queryParams.toString();
  const endpoint = `/public-wallets-directory${queryString ? `?${queryString}` : ""}`;

  return usePublicQuery(["publicWalletsDirectory", filters], endpoint, options);
};

/**
 * Search public wallets in directory without authentication
 */
export const searchPublicWalletsFromDirectory = async (
  searchTerm,
  limit = 20,
) => {
  const response = await axiosClient.get(
    `/public-wallets-directory/search?value=${encodeURIComponent(searchTerm)}&limit=${limit}`,
    publicEndpoint({}),
  );
  return response.data;
};

/**
 * Track a wallet view in the directory
 */
export const trackWalletViewInDirectory = async (address) => {
  try {
    await axiosClient.get(
      `/public-wallets-directory/${address}`,
      {},
      publicEndpoint({}),
    );
    return true;
  } catch (err) {
    console.error("❌ Error tracking wallet view:", err);
    return false;
  }
};

export default {
  getPublicWalletFromDirectoryByAddress,
  useListPublicWalletsFromDirectory,
  searchPublicWalletsFromDirectory,
  trackWalletViewInDirectory,
  WALLET_STATUS,
  WALLET_TYPE,
};
