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

  // New filters
  if (filters.type !== undefined) queryParams.append("type", filters.type);
  if (filters.isVerified !== undefined)
    queryParams.append("is_verified", filters.isVerified);
  if (filters.location) queryParams.append("location", filters.location);

  // For public endpoints, we may want to filter out non-active wallets by default
  if (filters.activeOnly && !filters.status)
    queryParams.append("status", WALLET_STATUS.ACTIVE);

  const queryString = queryParams.toString();
  const endpoint = `/public-wallets-directory${queryString ? `?${queryString}` : ""}`;

  return usePublicQuery(["publicWalletsDirectory", filters], endpoint, options);
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

/**
 * Search public wallets in directory without authentication
 * Note: This uses the same endpoint as listing but with a search value
 */
export const searchPublicWalletsFromDirectory = async (
  searchTerm,
  limit = 20,
) => {
  try {
    const params = new URLSearchParams();
    if (searchTerm) params.append("value", searchTerm);
    if (limit) params.append("limit", limit);
    params.append("status", WALLET_STATUS.ACTIVE);

    const response = await axiosClient.get(
      `/public-wallets-directory?${params.toString()}`,
      publicEndpoint({}),
    );
    return response.data;
  } catch (err) {
    console.error("Error searching public wallets:", err);
    throw err;
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
