// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useSayHello.ts
// hooks/useSayHello.ts
import { useState, useCallback } from "react";
import { createAuthenticatedFetch } from "@/utils/api";
import { API_CONFIG } from "@/config/env";

interface FederatedIdentity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface HelloResponse {
  message: string;
  federatedidentity: FederatedIdentity;
}

interface UseSayHelloReturn {
  sayHello: (message: string) => Promise<void>;
  data: HelloResponse | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSayHello(): UseSayHelloReturn {
  const [data, setData] = useState<HelloResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWithAuth = createAuthenticatedFetch();

  const sayHello = useCallback(
    async (message: string) => {
      try {
        console.log("👋 Sending greeting to:", API_CONFIG.baseUrl);
        setIsLoading(true);
        setError(null);

        const response = await fetchWithAuth(
          `${API_CONFIG.baseUrl}/api/say-hello`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to send greeting: ${response.statusText}`);
        }

        const responseData: HelloResponse = await response.json();
        console.log("✅ Server responded:", responseData);

        setData(responseData);
        setError(null);
      } catch (err) {
        console.error("❌ Error sending greeting:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to send greeting"),
        );
        setData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchWithAuth],
  );

  return {
    sayHello,
    data,
    isLoading,
    error,
  };
}
