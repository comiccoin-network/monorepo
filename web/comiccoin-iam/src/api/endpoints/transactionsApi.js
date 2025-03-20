// src/api/endpoints/transactionsApi.js
import { usePrivateQuery } from "../../hooks/useApi";

/**
 * Custom hook for fetching transaction data
 * This is a private endpoint that requires authentication
 *
 * @param {Object} options - Options for the query
 * @returns {Object} Query result with transactions data, loading state, error, and refetch function
 */
export const useTransactions = (options = {}) => {
  return usePrivateQuery(["transactions"], "/transactions", {
    // Setting default options while allowing overrides
    refreshInterval: options.refreshInterval,
    enabled: options.enabled !== false,
    ...options,
  });
};

/**
 * Transforms raw transaction data if needed
 * Similar to fromDashboardDTO in dashboardApi.js
 *
 * @param {Array} transactions - Raw transaction data from API
 * @returns {Array} Processed transaction data
 */
export function transformTransactions(transactions = []) {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  return transactions.map((tx) => ({
    id: tx.id,
    timestamp: tx.timestamp,
    amount: tx.amount,
    // Add any additional transformations needed
  }));
}
