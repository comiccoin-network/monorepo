// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useMeConnectWallet.ts
import { useState } from "react";
import { createAuthenticatedFetch } from "@/utils/api";
import { API_CONFIG } from "@/config/env";
import { useAuthStore } from "@/hooks/useAuth";

interface ConnectWalletResponse {
  success: boolean;
  wallet_address: string;
  // Add other response fields as needed
}

export function usePostMeConnectWallet() {
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { tokens, setUser: setAuthUser } = useAuthStore();

  const fetchWithAuth = createAuthenticatedFetch();

  const postMeConnectWallet = async (
    walletAddress: string,
  ): Promise<boolean> => {
    console.log("🔄 Starting wallet connection process");
    setIsPosting(true);
    setError(null);

    try {
      if (!tokens) {
        throw new Error("No authentication tokens available");
      }

      console.log("📤 Sending wallet connection request:", {
        walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      });

      const response = await fetchWithAuth(
        `${API_CONFIG.baseUrl}/api/me/connect-wallet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet_address: walletAddress,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to connect wallet");
      }

      const data: ConnectWalletResponse = await response.json();
      console.log("✅ Wallet connection successful");

      // Important: Update auth store with new user data including wallet
      setAuthUser((prevUser) => {
        if (!prevUser) return null;
        const updatedUser = {
          ...prevUser,
          wallet_address: { address: walletAddress },
        };
        console.log("👤 Updating user data in auth store:", {
          hasWallet: !!updatedUser.wallet_address,
        });
        // Ensure the user data is also persisted to localStorage
        localStorage.setItem("auth-user", JSON.stringify(updatedUser));
        return updatedUser;
      });

      return true;
    } catch (err) {
      console.error("❌ Wallet connection error:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to connect wallet"),
      );
      return false;
    } finally {
      setIsPosting(false);
    }
  };

  return {
    postMeConnectWallet,
    isPosting,
    error,
  };
}
