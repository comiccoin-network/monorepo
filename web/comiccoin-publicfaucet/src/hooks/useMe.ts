import { useState, useEffect, useCallback, useRef } from "react";
import authService from "../services/authService";
import userService, { User } from "../services/userService";

// Local storage key for caching user data
const USER_CACHE_KEY = 'user_profile_cache';

interface UseMeOptions {
  should_sync_now?: boolean;
  enabled?: boolean;
}

interface UseMeReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (syncNow?: boolean) => Promise<User>;
  updateUser: (userData: User) => void;
  logout: () => void;
}

/**
 * Hook for managing the authenticated user profile with API sync and local storage caching
 * @param options - Configuration options
 * @returns Object containing user data, loading/error states, and utility functions
 */
export function useMe({
  should_sync_now = false,
  enabled = true,
}: UseMeOptions = {}): UseMeReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to track state and prevent race conditions
  const hasFetchedRef = useRef(false);
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  /**
   * Load cached user data from local storage
   */
  const loadCachedUser = useCallback((): User | null => {
    try {
      const cachedData = localStorage.getItem(USER_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (err) {
      console.log("⚠️ PROFILE CACHE: Error reading from cache", err);
    }
    return null;
  }, []);

  /**
   * Save user data to local storage cache
   */
  const saveUserToCache = useCallback((userData: User): void => {
    try {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
      console.log("💾 PROFILE CACHE: Updated cache");
    } catch (err) {
      console.log("⚠️ PROFILE CACHE: Error saving to cache", err);
    }
  }, []);

  /**
   * Fetch user data from API with option to force sync and using cache for quick initial render
   */
  const fetchUserData = useCallback(async (syncNow: boolean = should_sync_now): Promise<User> => {
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
        shouldSyncNow: syncNow,
      });

      // Mark that a fetch is in progress
      isFetchingRef.current = true;

      // Set loading state if this is the first fetch
      if (!hasFetchedRef.current) {
        setIsLoading(true);
      }

      setError(null);

      // First check if user is authenticated
      if (!authService.isAuthenticated()) {
        throw new Error("User is not authenticated");
      }

      // Try to load from cache first for quick initial render
      if (!syncNow && !user) {
        const cachedUser = loadCachedUser();
        if (cachedUser && isMountedRef.current) {
          console.log("📋 PROFILE FETCH: Using cached data temporarily");
          setUser(cachedUser);
        }
      }

      // Then fetch fresh data from API
      console.log("📡 PROFILE FETCH: Calling API");
      const userData = await userService.getMe(syncNow);

      console.log("✅ PROFILE FETCH: Success", {
        email: userData.email,
        hasWallet: !!userData.wallet_address,
      });

      // Save to cache
      saveUserToCache(userData);

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
  }, [loadCachedUser, saveUserToCache, should_sync_now, user]);

  /**
   * Update user in state and cache (useful for local updates)
   */
  const updateUser = useCallback((userData: User) => {
    if (isMountedRef.current) {
      // Update state
      setUser(userData);

      // Save to cache
      saveUserToCache(userData);

      // Clear any previous errors
      setError(null);
      setIsLoading(false);

      // Mark that we've fetched data
      hasFetchedRef.current = true;

      console.log("✅ PROFILE UPDATE: Successfully updated user profile", {
        email: userData.email
      });
    }
  }, [saveUserToCache]);

  /**
   * Logout user - clear tokens and cached profile
   */
  const logout = useCallback(() => {
    // Clear auth tokens
    authService.clearTokens();

    // Clear user profile cache
    localStorage.removeItem(USER_CACHE_KEY);

    // Update state
    setUser(null);
    setError(null);

    // Reset fetch status
    hasFetchedRef.current = false;

    console.log("🚪 LOGOUT: User logged out successfully");
  }, []);

  // Effect for initial fetch from API or cache
  useEffect(() => {
    // Reset mounted ref
    isMountedRef.current = true;

    // Only fetch on mount if enabled and not fetched yet
    if (enabled && !hasFetchedRef.current) {
      console.log("🔄 PROFILE FETCH: Initial fetch on mount");

      // First check if we have cached data to show immediately
      const cachedUser = loadCachedUser();
      if (cachedUser && isMountedRef.current) {
        console.log("📋 PROFILE FETCH: Using cached data");
        setUser(cachedUser);
        setIsLoading(false);
      }

      // Then fetch latest data from API (unless we're not authenticated)
      if (authService.isAuthenticated()) {
        fetchUserData().catch((error) => {
          console.log("❌ PROFILE FETCH: Initial fetch failed", error);
        });
      } else {
        setIsLoading(false);
      }
    } else if (!enabled) {
      // If not enabled, we're not loading
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [enabled, fetchUserData, loadCachedUser]);

  return {
    user,
    isLoading,
    error,
    refetch: fetchUserData,
    updateUser,
    logout
  };
}
