// src/hooks/useGetFaucet.js
import { usePublicQuery } from "./useApi";

/**
 * Custom hook for fetching faucet data from the API
 *
 * @param {Object} options - Query options
 * @param {number} options.chainId - Blockchain chain ID (defaults to 1 for mainnet)
 * @param {boolean} options.enabled - Whether to enable the query
 * @param {number} options.refreshInterval - How often to refresh data in milliseconds
 * @returns {Object} Query result with faucet data, loading state, error, and refetch function
 */
export const useGetFaucet = (options = {}) => {
  const { chainId = 1, ...restOptions } = options;

  return usePublicQuery(["faucet", chainId], `/faucet/${chainId}`, {
    staleTime: 60000, // 1 minute
    ...restOptions,
  });
};

export default useGetFaucet;
