// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useRefreshToken.ts
import { useState, useCallback } from "react";
import { useAuthStore } from "./useAuth";
import { API_CONFIG } from "@/config/env";

export function useRefreshToken() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { tokens, setTokens, clearTokens } = useAuthStore();

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) {
      console.log("🔒 Token refresh already in progress");
      return false;
    }

    if (!tokens?.refreshToken || !tokens?.federatedidentityID) {
      console.log("❌ Missing required token data", {
        hasRefreshToken: !!tokens?.refreshToken,
        hasFederatedId: !!tokens?.federatedidentityID,
      });
      clearTokens();
      return false;
    }

    try {
      setIsRefreshing(true);
      console.log("🔄 Attempting to refresh tokens", {
        federatedId: tokens.federatedidentityID,
      });

      const response = await fetch(
        `${API_CONFIG.baseUrl}/publicfaucet/api/v1/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            federatedidentity_id: tokens.federatedidentityID,
            refresh_token: tokens.refreshToken,
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
      clearTokens();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [tokens, setTokens, clearTokens, isRefreshing]);

  return refreshTokens;
}
