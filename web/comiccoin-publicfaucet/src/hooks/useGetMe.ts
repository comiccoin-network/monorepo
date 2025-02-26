import { useState, useEffect, useCallback } from "react";
import userService, { User } from "../services/userService";

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

/**
 * Hook to fetch and manage current user data
 * @param options - Configuration options for the hook
 * @returns Object containing user data, loading state, error state, and refetch function
 */
export function useGetMe({
  should_sync_now = false,
  enabled = true,
}: UseGetMeOptions = {}): UseGetMeReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch user data from the API
   */
  const fetchUserData = useCallback(async (): Promise<User> => {
    try {
      console.log("👤 PROFILE HOOK: Starting fetch", {
        shouldSyncNow: should_sync_now,
      });

      setIsLoading(true);
      setError(null);

      // Use the service to fetch user data
      const userData = await userService.getMe(should_sync_now);

      // Update state with the result
      setUser(userData);
      setError(null);

      return userData;
    } catch (err) {
      console.log("❌ PROFILE HOOK: Fetch failed", {
        error: err instanceof Error ? err.message : "Unknown error",
      });

      // Set error state
      const error = err instanceof Error ? err : new Error("Failed to fetch user data");
      setError(error);
      setUser(null);

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [should_sync_now]);

  // Fetch user data when the hook is first used (if enabled)
  useEffect(() => {
    if (enabled) {
      console.log("🔄 PROFILE HOOK: Auto-fetching on mount");
      fetchUserData().catch((error) => {
        console.log("❌ PROFILE HOOK: Auto-fetch failed", error);
      });
    }
  }, [enabled, fetchUserData]);

  // Return the current state and refetch function
  return {
    user,
    isLoading,
    error,
    refetch: fetchUserData,
  };
}

export default useGetMe;
