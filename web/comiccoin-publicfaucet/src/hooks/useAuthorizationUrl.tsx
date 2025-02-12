// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useAuthorizationUrl.ts
import { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "@/config/env";

interface AuthUrlResponse {
  auth_url: string;
  state: string;
  expires_at: number;
}

interface UseAuthorizationUrlReturn {
  authUrl: string | null;
  state: string | null;
  expiresAt: number | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (redirectUri?: string, scope?: string) => Promise<void>;
}

interface UseAuthorizationUrlParams {
  redirectUri?: string;
  scope?: string;
}

export function useAuthorizationUrl(
  params?: UseAuthorizationUrlParams,
): UseAuthorizationUrlReturn {
  console.log("🎯 Hook Initialization", {
    params,
    apiConfig: API_CONFIG,
  });

  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAuthUrl = useCallback(
    async (
      redirectUri: string = params?.redirectUri || "",
      scope: string = params?.scope || "",
    ) => {
      console.log("🚀 Starting Authorization URL Request", {
        redirectUri,
        scope,
      });

      setIsLoading(true);
      setError(null);

      try {
        // Create URLSearchParams for the request parameters
        const urlParams = new URLSearchParams();
        urlParams.append("redirect_uri", redirectUri);
        urlParams.append("scope", scope);

        // Construct the full URL with parameters
        const apiUrl = `${API_CONFIG.baseUrl}/api/oauth/authorize?${urlParams.toString()}`;

        console.log("📤 Sending Request", {
          url: apiUrl,
          method: "GET",
          params: {
            redirect_uri: redirectUri,
            scope: scope,
          },
        });

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          // No body with GET request
        });

        console.log("📥 Response Status:", {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.log("❌ Response Error:", {
            status: response.status,
            text: errorText,
          });
          throw new Error(
            `HTTP error! status: ${response.status}, details: ${errorText}`,
          );
        }

        const data: AuthUrlResponse = await response.json();
        console.log("✅ Authorization URL Received:", {
          authUrl: data.auth_url,
          state: data.state,
          expiresAt: new Date(data.expires_at * 1000).toLocaleString(),
        });

        setAuthUrl(data.auth_url);
        setState(data.state);
        setExpiresAt(data.expires_at);
      } catch (err) {
        console.log("💥 Error Details:", {
          error: err,
          message: err instanceof Error ? err.message : "Unknown error",
          stack: err instanceof Error ? err.stack : undefined,
        });
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred"),
        );
        setAuthUrl(null);
        setState(null);
        setExpiresAt(null);
      } finally {
        setIsLoading(false);
        console.log("🏁 Request Cycle Completed", {
          success: !error,
          hasAuthUrl: !!authUrl,
        });
      }
    },
    [API_CONFIG.baseUrl, params?.redirectUri, params?.scope],
  );

  useEffect(() => {
    if (typeof window !== "undefined" && params?.redirectUri) {
      console.log("🔄 Effect Triggered:", {
        redirectUri: params.redirectUri,
        scope: params.scope,
      });
      fetchAuthUrl(params.redirectUri, params.scope);
    } else {
      console.log("⏳ Waiting for client-side and redirectUri");
    }
  }, [fetchAuthUrl, params?.redirectUri, params?.scope]);

  return {
    authUrl,
    state,
    expiresAt,
    isLoading,
    error,
    refetch: fetchAuthUrl,
  };
}
