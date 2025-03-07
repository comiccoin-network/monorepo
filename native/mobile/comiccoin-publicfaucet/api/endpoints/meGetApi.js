// api/endpoints/meGetApi.js
import { usePrivateQuery } from "../../hooks/useApi";

/**
 * Custom hook for fetching current user data
 * This is a private endpoint that requires authentication
 *
 * @param {Object} options - Query options
 * @returns {Object} Query result with user data
 */
export const useGetMe = (options = {}) => {
  return usePrivateQuery(["user"], "/me", {
    // Default options that can be overridden
    retry: options.retry || 3,
    enabled: options.enabled !== false,
    ...options,
  });
};

/**
 * Transform a user response to the expected format
 *
 * @param {Object} userData - User data from API
 * @returns {Object} Formatted user data
 */
export function transformUserData(userData) {
  if (!userData) {
    return null;
  }

  // Return directly using the API's field names to match our form
  return {
    id: userData.id,
    email: userData.email,
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone: userData.phone || null,
    country: userData.country || null,
    timezone: userData.timezone || "",
    wallet_address: userData.wallet_address || "",
    // Include these transformed properties for components using camelCase
    firstName: userData.first_name,
    lastName: userData.last_name,
    walletAddress: userData.wallet_address,
  };
}
