// monorepo/web/comiccoin-iam/src/hooks/useGetDashboard.js
import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboard,
  transformDashboardData,
} from "../api/endpoints/dashboardApi";

/**
 * Custom hook for fetching dashboard data related to public wallets
 * @param {Object} options - Optional React Query configuration options
 * @returns {Object} Query result with dashboard data and helper methods
 */
export const useGetDashboard = (options = {}) => {
  // Using v5 object syntax - everything is in a single object parameter
  const query = useQuery({
    queryKey: ["dashboard", "wallets"],
    queryFn: () => fetchDashboard(),
    select: (data) => transformDashboardData(data),
    // Set reasonable defaults to handle errors gracefully
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error("Dashboard fetch error in hook:", error);
    },
    ...options,
  });

  return {
    ...query,
    refreshDashboard: query.refetch,
  };
};

/**
 * Hook to get a simple summary of the dashboard data
 * @returns {Object} Dashboard summary data
 */
export const useGetDashboardSummary = () => {
  const { data, isLoading, error } = useGetDashboard();

  if (isLoading || error || !data) {
    return {
      isLoading,
      error,
      summary: null,
    };
  }

  const summary = {
    totalWallets: data.totalWalletsCount,
    activeWallets: data.activeWalletsCount,
    totalViews: data.totalWalletViewsCount,
    uniqueViews: data.totalUniqueWalletViewsCount,
    uniqueViewsRate: data.uniqueViewsPercentage,
    walletUsagePercent:
      data.totalWalletsCount > 0
        ? ((data.activeWalletsCount / data.totalWalletsCount) * 100).toFixed(1)
        : 0,
    mostViewedWallet:
      data.walletsSortedByViews?.length > 0
        ? data.walletsSortedByViews[0]
        : null,
  };

  return {
    isLoading,
    error,
    summary,
  };
};
