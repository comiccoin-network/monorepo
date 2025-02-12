// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useRefreshToken.ts
import { useAuthStore } from "./useAuth";

export const useRefreshToken = () => {
  const { tokens, setTokens } = useAuthStore();

  const refreshTokens = async () => {
    try {
      console.log("🔄 Attempting to refresh tokens");

      if (!tokens?.refreshToken) {
        console.log("❌ No refresh token available");
        return false;
      }

      const response = await fetch("/api/auth/refresh", {
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
      console.error("❌ Error refreshing tokens:", error);
      setTokens(null);
      return false;
    }
  };

  return refreshTokens;
};
