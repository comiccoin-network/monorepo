// app/api/endpoints/dashboardApi.js
import { usePrivateQuery } from "../../hooks/useApi";

/**
 * Custom hook for fetching dashboard data
 * This is a private endpoint that requires authentication
 */
export const useDashboard = (options = {}) => {
  return usePrivateQuery(["dashboard"], "/dashboard", {
    // Simply pass through the raw data from the API
    // We'll handle calculation in the component with stable functions
    ...options,
  });
};

/**
 * Converts the raw API response into a Dashboard object with helper methods
 */
export function fromDashboardDTO(dto) {
  // Create a Dashboard object with the same shape as the class in the TS definition
  const dashboard = {
    chainId: dto.chain_id,
    faucetBalance: dto.faucet_balance,
    userBalance: dto.user_balance,
    totalCoinsClaimedByUser: dto.total_coins_claimed,
    lastModifiedAt: dto.last_modified_at || null,
    lastClaimTime: dto.last_claim_time,
    nextClaimTime: dto.next_claim_time,
    canClaim: dto.can_claim,
    walletAddress: dto.wallet_address,
    transactions:
      dto.transactions?.map((tx) => ({
        id: tx.id,
        timestamp: tx.timestamp,
        amount: tx.amount,
      })) || [],

    // Add the helper methods from the class
    canClaimNow() {
      return this.canClaim;
    },

    getTimeUntilNextClaim() {
      const nextClaimTime = new Date(this.nextClaimTime).getTime();
      const now = Date.now();
      return Math.max(0, nextClaimTime - now);
    },

    // Format the time until next claim in a human-readable way
    getFormattedTimeUntilNextClaim() {
      const milliseconds = this.getTimeUntilNextClaim();
      if (milliseconds === 0) {
        return "Ready to claim";
      }

      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days}d ${hours % 24}h`;
      } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      } else {
        return `${seconds}s`;
      }
    },
  };

  return dashboard;
}
