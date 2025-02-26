// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useMe.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { API_CONFIG } from "@/config/env";

// Define the User interface
export interface User {
  id: string;
  federatedidentity_id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  lexical_name: string;
  phone?: string;
  country?: string;
  timezone: string;
  wallet_address: string | null;
}

interface UseMeOptions {
  should_sync_now?: boolean;
  enabled?: boolean;
}

interface UseMeReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<User>;
}

export function useMe({
  should_sync_now = false,
  enabled = true,
}: UseMeOptions = {}): UseMeReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use a ref to track if data has been fetched
  const hasFetchedRef = useRef(false);

  // Use a ref to track mounted state
  const isMountedRef = useRef(true);

  // Use a ref to prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false);

  const fetchWithAuth = useAuthenticatedFetch();

  const fetchUserData = useCallback(async (): Promise<User> => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      console.log("🚫 PROFILE FETCH: Already in progress");
      if (!user) {
        throw new Error("User profile is still loading");
      }
      return user;
    }

    try {
      console.log("👤 PROFILE FETCH: Starting", {
        shouldSyncNow: should_sync_now,
      });

      // Mark that a fetch is in progress
      isFetchingRef.current = true;

      if (!hasFetchedRef.current) {
        setIsLoading(true);
      }

      setError(null);

      const url = new URL(`${API_CONFIG.baseUrl}/publicfaucet/api/v1/me`);
      if (should_sync_now) {
        url.searchParams.append("should_sync_now", "true");
      }

      console.log("📡 PROFILE FETCH: Calling API");
      const response = await fetchWithAuth(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const userData: User = await response.json();

      console.log("✅ PROFILE FETCH: Success", {
        email: userData.email,
        hasWallet: !!userData.wallet_address,
      });

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setUser(userData);
        setError(null);
        setIsLoading(false);
        // Mark that we've fetched data
        hasFetchedRef.current = true;
      }

      return userData;
    } catch (err) {
      console.log("❌ PROFILE FETCH: Failed", {
        error: err instanceof Error ? err.message : "Unknown error",
      });

      const error =
        err instanceof Error ? err : new Error("Failed to fetch user data");

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(error);
        setIsLoading(false);
      }

      throw error;
    } finally {
      // Mark fetch as complete
      isFetchingRef.current = false;
    }
  }, [fetchWithAuth, should_sync_now, user]);

  // Effect for initial fetch
  useEffect(() => {
    // Reset mounted ref
    isMountedRef.current = true;

    // Only fetch once on mount if enabled and not fetched yet
    if (enabled && !hasFetchedRef.current) {
      console.log("🔄 PROFILE FETCH: Initial fetch on mount");
      fetchUserData().catch((error) => {
        console.log("❌ PROFILE FETCH: Initial fetch failed", error);
      });
    } else if (!enabled) {
      // If not enabled, we're not loading
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [enabled, fetchUserData]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUserData,
  };
}
