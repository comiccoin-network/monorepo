// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useMeConnectWallet.ts
// hooks/usePostMeConnectWallet.ts
import { useState } from "react";
import { API_CONFIG } from "@/config/env";
import { createAuthenticatedFetch } from "@/utils/api";

interface MeConnectWalletError {
  message: string;
  status?: number;
}

interface PostMeConnectWalletReturn {
  postMeConnectWallet: (walletAddress: string) => Promise<boolean>;
  isPosting: boolean;
  error: MeConnectWalletError | null;
}

export function usePostMeConnectWallet(): PostMeConnectWalletReturn {
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<MeConnectWalletError | null>(null);
  const fetchWithAuth = createAuthenticatedFetch();

  const postMeConnectWallet = async (walletAddress: string): Promise<boolean> => {
    setIsPosting(true);
    setError(null);

    try {
      const response = await fetchWithAuth(
        `${API_CONFIG.baseUrl}/api/me/connect-wallet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ wallet_address: walletAddress }),
        }
      );

      if (response.status === 204) {
        return true;
      }

      // Handle error responses
      let errorMessage = "Failed to connect wallet";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      setError({
        message: errorMessage,
        status: response.status,
      });
      return false;
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Network error occurred",
      });
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
