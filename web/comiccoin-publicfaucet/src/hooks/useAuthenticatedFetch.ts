// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useAuthenticatedFetch.ts
import { useCallback } from "react";
import { createAuthenticatedFetch } from "@/utils/api";
import { useAuthStore } from "./useAuth";
import { API_CONFIG } from "@/config/env";

// Create a standalone refresh function instead of using a hook
const refreshTokens = async (
  currentRefreshToken: string,
  federatedidentityID: string,
): Promise<boolean> => {
  try {
    console.log("🔄 Attempting to refresh tokens");

    const response = await fetch(
      `${API_CONFIG.baseUrl}/publicfaucet/api/v1/token/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: currentRefreshToken,
          federatedidentity_id: federatedidentityID,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Refresh failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (
      !data.access_token ||
      !data.refresh_token ||
      !data.federatedidentity_id
    ) {
      throw new Error("Invalid token data received");
    }

    // Get the setTokens function from the store
    const { setTokens } = useAuthStore.getState();

    // Update tokens in the store with federatedidentityID
    setTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      federatedidentityID: data.federatedidentity_id,
    });

    console.log("✅ Successfully refreshed tokens");
    return true;
  } catch (error) {
    console.error("❌ Error during token refresh:", error);
    const { clearTokens } = useAuthStore.getState();
    clearTokens();
    return false;
  }
};

export function useAuthenticatedFetch() {
  const { tokens } = useAuthStore();

  // Create a function that will handle the token refresh using the current refresh token
  const handleTokenRefresh = useCallback(async () => {
    if (!tokens?.refreshToken || !tokens?.federatedidentityID) {
      return false;
    }
    return refreshTokens(tokens.refreshToken, tokens.federatedidentityID);
  }, [tokens?.refreshToken, tokens?.federatedidentityID]);

  // Create the authenticated fetch instance with the refresh token function
  const authenticatedFetch = useCallback(
    createAuthenticatedFetch(handleTokenRefresh),
    [handleTokenRefresh],
  );

  return authenticatedFetch;
}
