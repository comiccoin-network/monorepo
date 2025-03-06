// hooks/useDashboard.js
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  useDashboard as useRawDashboard,
  fromDashboardDTO,
} from "../api/endpoints/dashboardApi";

/**
 * Custom hook for working with dashboard data
 * Provides enhanced functionality on top of the raw API response
 *
 * @param {Object} options - Query options to pass to the underlying useQuery hook
 * @returns {Object} Enhanced dashboard object with additional functionality
 */
export function useDashboard(options = {}) {
  // Use the API hook to fetch the raw data
  const {
    data: rawData,
    isLoading,
    error,
    refetch,
    ...rest
  } = useRawDashboard({
    ...options,
    // Override onSuccess to handle data transformation
    onSuccess: (data) => {
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
  });

  // Transform the raw data into our enhanced dashboard object
  const dashboard = useMemo(() => {
    if (!rawData) {
      return null;
    }
    return fromDashboardDTO(rawData);
  }, [rawData]);

  // State for tracking time-based updates (for countdown)
  const [timeUpdate, setTimeUpdate] = useState(0);

  // Set up interval for time-based updates
  useEffect(() => {
    if (!dashboard) return;

    // Update every second if we're waiting for the next claim
    const timer = setInterval(() => {
      setTimeUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [dashboard]);

  // Get current formatted time until next claim
  const timeUntilNextClaim = useMemo(() => {
    if (!dashboard) return null;
    return dashboard.getFormattedTimeUntilNextClaim();
  }, [dashboard, timeUpdate]);

  // Calculate whether the user can claim right now
  const canClaimNow = useMemo(() => {
    if (!dashboard) return false;
    return dashboard.canClaimNow();
  }, [dashboard, timeUpdate]);

  // Return everything the component needs
  return {
    dashboard,
    isLoading,
    error,
    refetch,
    timeUntilNextClaim,
    canClaimNow,
    ...rest,
  };
}

export default useDashboard;
