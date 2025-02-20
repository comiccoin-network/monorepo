// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/utils/api.ts
import { useAuthStore } from "@/hooks/useAuth";

interface AuthenticatedFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export const createAuthenticatedFetch = (
  refreshTokensFn: () => Promise<boolean>,
) => {
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

// Example usage in a component or hook
export const useAuthenticatedFetch = () => {
  const refreshTokens = useRefreshToken();
  return createAuthenticatedFetch(refreshTokens);
};
