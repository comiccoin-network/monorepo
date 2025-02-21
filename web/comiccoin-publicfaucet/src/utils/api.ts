// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/utils/api.ts
import { useAuthStore } from "@/hooks/useAuth";

interface AuthenticatedFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export const createAuthenticatedFetch = (
  refreshTokensFn: () => Promise<boolean>,
) => {
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

    // Check for tokens before making the request
    if (!tokens?.accessToken) {
      console.log("❌ No access token available");
      clearTokens();
      throw new Error("No authentication tokens available");
    }

    // Try the request with the current token
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      // If unauthorized, try to refresh the token
      if (response.status === 401) {
        console.log("🔄 Token expired, attempting refresh");

        const refreshSuccess = await refreshTokensFn();

        if (!refreshSuccess) {
          console.log("❌ Token refresh failed - clearing auth state");
          clearTokens();
          throw new Error("Authentication failed");
        }

        // Get the new tokens from the store
        const { tokens: newTokens } = useAuthStore.getState();

        if (!newTokens?.accessToken) {
          throw new Error("No access token after refresh");
        }

        // Retry the original request with the new token
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
      // Only clear tokens if it's an authentication error
      if (error instanceof Error && error.message.includes("Authentication")) {
        clearTokens();
      }
      throw error;
    }
  };
};
