// src/api/endpoints/claimCoinsApi.js
import { usePrivateMutation } from "../../hooks/useApi";

/**
 * Custom hook for claiming coins
 * This is a private endpoint that requires authentication
 */
export const useClaimCoins = (options = {}) => {
  return usePrivateMutation("/claim-coins", "post", {
    // Invalidate dashboard data upon successful claim to refresh the user's balance
    invalidateQueries: ["dashboard"],
    ...options,
  });
};
