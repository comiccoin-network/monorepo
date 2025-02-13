// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useGetMe.ts
import { useState, useEffect, useCallback } from "react";
import { createAuthenticatedFetch } from "@/utils/api";
import { API_CONFIG } from "@/config/env";

// First, let's define our types based on the Golang struct
interface Address {
  // Add wallet address properties here
  address: string;
}

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
  wallet_address?: Address | null;
}

interface UseGetMeOptions {
  should_sync_now?: boolean;
  enabled?: boolean;
}

interface UseGetMeReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * A hook to fetch and manage the authenticated user's account information.
 *
 * @param options Configuration options for the hook
 * @param options.should_sync_now Whether to sync the user data immediately
 * @param options.enabled Whether the hook should automatically fetch data
 *
 * @returns Object containing user data, loading state, error state, and refetch function
 */
export function useGetMe({
  should_sync_now = false,
  enabled = true,
}: UseGetMeOptions = {}): UseGetMeReturn {
  // State management for our hook
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create our authenticated fetch utility
  const fetchWithAuth = createAuthenticatedFetch();

  // Define our fetch function
  const fetchUserData = useCallback(async () => {
    try {
      console.log("👤 Fetching user data", { should_sync_now });
      setIsLoading(true);
      setError(null);

      // Construct the URL with query parameter if needed
      const url = new URL(`${API_CONFIG.baseUrl}/api/me`);
      if (should_sync_now) {
        url.searchParams.append("should_sync_now", "true");
      }

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
      console.log("✅ User data received successfully");

      setUser(userData);
      setError(null);
    } catch (err) {
      console.log("❌ Error fetching user data:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch user data"),
      );
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, should_sync_now]);

  // Fetch data when the hook is mounted if enabled
  useEffect(() => {
    if (enabled) {
      fetchUserData();
    }
  }, [enabled, fetchUserData]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUserData,
  };
}

// Example usage in a component:
/*
import { useGetMe } from '@/hooks/useGetMe';

export function UserProfile() {
  const { user, isLoading, error, refetch } = useGetMe({
    should_sync_now: true,
  });

  if (isLoading) {
    return <div>Loading user profile...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Country: {user.country || 'Not specified'}</p>
      {user.wallet_address && (
        <p>Wallet Address: {user.wallet_address.address}</p>
      )}
    </div>
  );
}
*/
