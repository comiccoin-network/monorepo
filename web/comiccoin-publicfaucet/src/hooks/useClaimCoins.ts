// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useClaimCoins.ts
import { useState } from "react";
import { API_CONFIG } from "@/config/env"; // Import the correct config
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

interface User {
  federatedidentity_id: string;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  lexical_name: string;
  phone?: string;
  country?: string;
  timezone: string;
  wallet_address: string | null;
}

interface UseClaimCoinsResult {
  isLoading: boolean;
  error: Error | null;
  claimCoins: () => Promise<User>;
}

const useClaimCoins = (): UseClaimCoinsResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const fetchWithAuth = useAuthenticatedFetch();

  const claimCoins = async (): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);

      // Use API_CONFIG.baseUrl instead of CONFIG.api.baseUrl
      const response = await fetchWithAuth(
        `${API_CONFIG.baseUrl}/publicfaucet/api/v1/claim-coins`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to claim coins: ${response.statusText}`);
      }

      // Parse the response as User type
      const userData: User = await response.json();
      return userData;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to claim coins");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, claimCoins };
};

export default useClaimCoins;
