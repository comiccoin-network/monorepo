// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useRefreshToken.ts
import { useAuthStore } from "./useAuth";
import { API_CONFIG } from "@/config/env";

export const useRefreshToken = () => {
  const { tokens, setTokens } = useAuthStore();

  const refreshTokens = async () => {
    try {
      console.log("🔄 Attempting to refresh tokens");

      if (!tokens?.refreshToken) {
        console.log("❌ No refresh token available");
        return false;
      }

      // Get API configuration from environment variables
      const apiProtocol = process.env.NEXT_PUBLIC_API_PROTOCOL || "http";
      const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;
      const apiUrl = `${API_CONFIG.baseUrl}/api/token/refresh`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: tokens.refreshToken,
        }),
      });

      if (!response.ok) {
        console.log("❌ Token refresh failed");
        setTokens(null);
        return false;
      }

      const data = await response.json();
      const newTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
      };

      console.log("✅ Tokens refreshed successfully");
      setTokens(newTokens);
      return true;
    } catch (error) {
      console.log("❌ Error refreshing tokens:", error);
      setTokens(null);
      return false;
    }
  };

  return refreshTokens;
};
