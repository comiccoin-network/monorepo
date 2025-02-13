// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/utils/api.ts
import { useAuthStore } from "@/hooks/useAuth";
import { useRefreshToken } from "@/hooks/useRefreshToken";

export const createAuthenticatedFetch = () => {
  const refreshTokens = useRefreshToken();
  const { tokens } = useAuthStore();

  return async (url: string, options: RequestInit = {}) => {
    if (!tokens) {
      console.log("❌ No tokens available for request");
      throw new Error("No authentication tokens available");
    }

    // Add authorization header
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${tokens.accessToken}`,
    };

    try {
      console.log("🚀 Making authenticated request");
      const response = await fetch(url, { ...options, headers });

      // If unauthorized, try refreshing token
      if (response.status === 401) {
        console.log("🔄 Token expired, attempting refresh");
        const refreshSuccess = await refreshTokens();

        if (!refreshSuccess) {
          console.log("❌ Token refresh failed");
          throw new Error("Authentication failed");
        }

        // Retry request with new token
        console.log("🔄 Retrying request with new token");
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${useAuthStore.getState().tokens?.accessToken}`,
          },
        });
      }

      return response;
    } catch (error) {
      console.log("❌ Request failed:", error);
      throw error;
    }
  };
};
