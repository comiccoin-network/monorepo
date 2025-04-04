// monorepo/web/comiccoin-iam/src/api/endpoints/dashboardApi.js
import axiosClient from "../axiosClient";

// Define the exact API endpoint path as a string constant
const DASHBOARD_ENDPOINT = "/dashboard";

/**
 * Fetch dashboard data from API
 * @returns {Promise} API response with dashboard data
 */
export const fetchDashboard = async () => {
  try {
    // Ensure we're using a string URL and handle the request properly
    const response = await axiosClient({
      method: "get",
      url: DASHBOARD_ENDPOINT,
    });

    // Log successful response
    console.log("Dashboard API response received:", !!response.data);

    return response.data;
  } catch (error) {
    console.error("Dashboard API error:", error);
    // Provide more context in the error
    const enhancedError = new Error(
      `Failed to fetch dashboard: ${error.message}`,
    );
    enhancedError.originalError = error;
    throw enhancedError;
  }
};

/**
 * Transform the raw API response into a more usable dashboard object with helper methods
 * @param {Object} data - Raw API response data
 * @returns {Object} Transformed dashboard data with helper methods
 */
export const transformDashboardData = (data) => {
  if (!data) {
    console.warn("Dashboard data is empty or null");
    return {
      chainId: 0,
      totalWalletsCount: 0,
      activeWalletsCount: 0,
      totalWalletViewsCount: 0,
      publicWallets: [],
      inactiveWalletsCount: 0,
      averageViewsPerWallet: 0,
      walletsSortedByViews: [],
      mostViewedWallet: null,
    };
  }

  // Log the raw data to help debug
  console.log("Transforming dashboard data:", {
    chainId: data.chain_id,
    walletsCount: data.total_wallets_count,
    hasPublicWallets: !!data.public_wallets,
    walletsArrayLength: Array.isArray(data.public_wallets)
      ? data.public_wallets.length
      : "not an array",
  });

  // Safely get public wallets
  const publicWallets = Array.isArray(data.public_wallets)
    ? data.public_wallets
    : [];

  // Sort wallets by view count
  const walletsSortedByViews = [...publicWallets].sort(
    (a, b) => (b.view_count || 0) - (a.view_count || 0),
  );

  return {
    // Basic dashboard data
    chainId: data.chain_id || 0,
    totalWalletsCount: data.total_wallets_count || 0,
    activeWalletsCount: data.active_wallets_count || 0,
    totalWalletViewsCount: data.total_wallet_views_count || 0,
    publicWallets: publicWallets,

    // Computed properties
    inactiveWalletsCount:
      (data.total_wallets_count || 0) - (data.active_wallets_count || 0),
    averageViewsPerWallet:
      (data.total_wallets_count || 0) > 0
        ? (
            (data.total_wallet_views_count || 0) /
            (data.total_wallets_count || 0)
          ).toFixed(2)
        : 0,

    // Pre-computed data
    walletsSortedByViews,
    mostViewedWallet:
      walletsSortedByViews.length > 0 ? walletsSortedByViews[0] : null,
  };
};
