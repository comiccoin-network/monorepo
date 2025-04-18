// monorepo/web/comiccoin-iam/src/api/endpoints/mePutApi.js
import { usePrivateQuery, usePrivateMutation } from "../../hooks/useApi";

/**
 * Custom hook for fetching current user data
 * @param {Object} options - Query options
 * @returns {Object} Query result with user data
 */
export const useGetMe = (options = {}) => {
  return usePrivateQuery(["me"], "/me", {
    // Default options that can be overridden
    staleTime: 300000, // 5 minutes
    ...options,
  });
};

/**
 * Custom hook for updating user profile
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation functions and state
 */
export const useUpdateMe = (options = {}) => {
  return usePrivateMutation("/me", "put", {
    // Invalidate me query on success to refresh user data
    invalidateQueries: ["me"],
    ...options,
  });
};

/**
 * Transform a user request object to match the API's expected format
 * Removes null/undefined values and ensures consistent formatting
 *
 * @param {Object} userData - User data to be sent to API
 * @returns {Object} Cleaned user data for API request
 */
export function prepareUserDataForApi(userData) {
  // Start with an empty object to only include non-null values
  const cleanData = {};

  // Only add properties that have values
  Object.entries(userData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      cleanData[key] = value;
    }
  });

  return cleanData;
}
