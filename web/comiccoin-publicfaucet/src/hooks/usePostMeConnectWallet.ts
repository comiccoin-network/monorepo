// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useMeConnectWallet.tsimport { useState } from "react";
import { useState } from "react";
import { createAuthenticatedFetch } from "@/utils/api";
import { API_CONFIG } from "@/config/env";

// Define the response type for the connect wallet endpoint
interface ConnectWalletResponse {
  success: boolean;
  wallet_address: string;
}

export function usePostMeConnectWallet() {
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchWithAuth = createAuthenticatedFetch();

  const postMeConnectWallet = async (walletAddress: string): Promise<boolean> => {
    console.log("🔄 Starting wallet connection process");
    setIsPosting(true);
    setError(null);

    try {
      console.log("📤 Sending wallet connection request:", {
        walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      });

      const response = await fetchWithAuth(
        `${API_CONFIG.baseUrl}/publicfaucet/api/v1/me/connect-wallet`,
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

      return true;
    } catch (err) {
      console.error("❌ Wallet connection error:", err);
      setError(err instanceof Error ? err : new Error("Failed to connect wallet"));
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
