// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useGetMe.ts
import { useState, useEffect, useCallback } from "react";
import { createAuthenticatedFetch } from "@/utils/api";
import { API_CONFIG } from "@/config/env";

// The API returns wallet_address as a string or null, not as an object
interface User {
  federatedidentity_id: string;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  lexical_name: string;
  phone?: string;
  country?: string;
  timezone: string;
  wallet_address: string | null; // This is a string, not an object
}

interface UseGetMeOptions {
  should_sync_now?: boolean;
  enabled?: boolean;
}

interface UseGetMeReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<User>;
}

export function useGetMe({
  should_sync_now = false,
  enabled = true,
}: UseGetMeOptions = {}): UseGetMeReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchWithAuth = createAuthenticatedFetch();

  const fetchUserData = useCallback(async (): Promise<User> => {
    try {
      console.log("👤 PROFILE FETCH: Starting", {
        shouldSyncNow: should_sync_now,
      });

      setIsLoading(true);
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
        hasWallet: typeof userData.wallet_address === "string",
      });

      setUser(userData);
      setError(null);

      return userData;
    } catch (err) {
      console.log("❌ PROFILE FETCH: Failed", {
        error: err instanceof Error ? err.message : "Unknown error",
      });

      const error =
        err instanceof Error ? err : new Error("Failed to fetch user data");
      setError(error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, should_sync_now]);

  useEffect(() => {
    if (enabled) {
      console.log("🔄 PROFILE FETCH: Auto-fetching on mount");
      fetchUserData().catch((error) => {
        console.log("❌ PROFILE FETCH: Auto-fetch failed", error);
      });
    }
  }, [enabled, fetchUserData]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUserData,
  };
}
