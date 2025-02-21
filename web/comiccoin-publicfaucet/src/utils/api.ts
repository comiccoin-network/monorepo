// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/utils/api.ts
import { useAuthStore } from "@/hooks/useAuth";

interface AuthenticatedFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

// First, let's modify how we handle the refresh function
export const createAuthenticatedFetch = (
  refreshTokensFn: () => Promise<boolean>,
) => {
  // Ensure refreshTokensFn is provided
  if (!refreshTokensFn) {
    throw new Error(
      "refreshTokensFn must be provided to createAuthenticatedFetch",
    );
  }

  return async (url: string, options: AuthenticatedFetchOptions = {}) => {
    const { tokens, clearTokens } = useAuthStore.getState();

    if (options.skipAuth) {
      return fetch(url, options);
    }

    if (!tokens?.accessToken) {
      console.log("❌ No access token available");
      clearTokens();
      throw new Error("No authentication tokens available");
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${tokens.accessToken}`,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        console.log("🔄 Token expired, attempting refresh");
        const refreshSuccess = await refreshTokensFn();

        if (!refreshSuccess) {
          console.log("❌ Token refresh failed - clearing auth state");
          clearTokens();
          throw new Error("Authentication failed");
        }

        // Get fresh tokens from store
        const newTokens = useAuthStore.getState().tokens;

        if (!newTokens?.accessToken) {
          throw new Error("No access token after refresh");
        }

        // Retry with new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newTokens.accessToken}`,
          },
        });
      }

      return response;
    } catch (error) {
      console.error("❌ Request failed:", error);
      throw error;
    }
  };
};

// Modify the hook to ensure refreshTokens is always defined
export const useAuthenticatedFetch = () => {
  const refreshTokens = useRefreshToken();

  // Add validation
  if (!refreshTokens) {
    throw new Error("useRefreshToken must return a valid refresh function");
  }

  // Memoize the authenticated fetch to prevent unnecessary recreations
  return React.useMemo(
    () => createAuthenticatedFetch(refreshTokens),
    [refreshTokens],
  );
};
