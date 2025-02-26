// File: github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useAuthenticatedFetch.ts
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { API_CONFIG } from "@/config/env";

/**
 * Interface for fetch options to match standard fetch API
 */
interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Interface for auth tokens storage - aligned with AuthCallbackContent
 */
interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  federatedidentityID: string | null;
}

/**
 * Interface for token refresh response
 */
interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  federatedidentity_id: string;
}

/**
 * Custom hook for authenticated fetching with automatic token refresh
 * @returns A function that performs authenticated fetch with token management
 */
export function useAuthenticatedFetch() {
  const router = useRouter();

  // Use local storage hook for managing tokens with matching interface
  const [tokens, setTokens] = useLocalStorage<AuthTokens>("auth_tokens", {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    federatedidentityID: null,
  });

  /**
   * Perform token refresh
   * @returns New tokens object, or null if refresh fails
   */
  const refreshTokens = async (): Promise<AuthTokens | null> => {
    try {
      // Check localStorage directly first to bypass React state timing issues
      let currentTokens: AuthTokens;
      try {
        const storedTokens = localStorage.getItem("auth_tokens");
        currentTokens = storedTokens ? JSON.parse(storedTokens) : tokens;
      } catch (e) {
        // Fallback to React state if localStorage access fails
        currentTokens = tokens;
      }

      console.log("🔄 TOKEN REFRESH: Starting with tokens", {
        hasAccessToken: !!currentTokens.accessToken,
        hasRefreshToken: !!currentTokens.refreshToken
      });

      const { refreshToken } = currentTokens;

      if (!refreshToken) {
        console.error("❌ TOKEN REFRESH: No refresh token available");
        throw new Error("No refresh token available");
      }

      const response = await fetch(
        `${API_CONFIG.baseUrl}/publicfaucet/api/v1/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        },
      );

      if (!response.ok) {
        console.error("❌ TOKEN REFRESH: API call failed with status", response.status);
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data: TokenRefreshResponse = await response.json();

      // Update tokens in both localStorage and React state
      const newTokens: AuthTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
        federatedidentityID: data.federatedidentity_id,
      };

      // Update localStorage directly first
      localStorage.setItem("auth_tokens", JSON.stringify(newTokens));

      // Then update React state
      setTokens(newTokens);

      console.log("✅ TOKEN REFRESH: Successfully refreshed tokens");

      return newTokens;
    } catch (error) {
      console.error("❌ TOKEN REFRESH: Error", error);

      // Clear tokens from both localStorage and React state
      localStorage.removeItem("auth_tokens");
      setTokens({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        federatedidentityID: null,
      });

      router.push("/get-started");
      return null;
    }
  };

  /**
   * Authenticated fetch function with token refresh logic
   * @param input - URL or Request object
   * @param options - Fetch options
   * @returns Fetch response
   */
  const authenticatedFetch = async (
    input: RequestInfo | URL,
    options: FetchOptions = {},
  ): Promise<Response> => {
    console.log("🔒 AUTH FETCH: Starting request to", typeof input === 'string' ? input : 'URL object');

    // Read tokens directly from localStorage to avoid React state timing issues
    let currentTokens: AuthTokens;
    try {
      const storedTokens = localStorage.getItem("auth_tokens");
      currentTokens = storedTokens ? JSON.parse(storedTokens) : tokens;
      console.log("🔍 AUTH FETCH: Retrieved tokens from storage", {
        hasAccessToken: !!currentTokens.accessToken,
        hasRefreshToken: !!currentTokens.refreshToken
      });
    } catch (e) {
      // Fallback to React state if localStorage access fails
      currentTokens = tokens;
      console.log("⚠️ AUTH FETCH: Falling back to React state tokens", {
        hasAccessToken: !!currentTokens.accessToken,
        hasRefreshToken: !!currentTokens.refreshToken
      });
    }

    // Clone options to avoid mutating the original
    const fetchOptions: FetchOptions = { ...options };

    // Prepare headers
    fetchOptions.headers = {
      ...fetchOptions.headers,
      "Content-Type": "application/json",
    };

    // Add access token if available
    if (currentTokens.accessToken) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${currentTokens.accessToken}`,
      };
      console.log("🔑 AUTH FETCH: Added authorization header");
    } else {
      console.warn("⚠️ AUTH FETCH: No access token available");
    }

    // Perform initial fetch
    console.log("📡 AUTH FETCH: Sending initial request");
    let response = await fetch(input, fetchOptions);
    console.log("📥 AUTH FETCH: Received response with status", response.status);

    // Check for unauthorized access
    if (response.status === 401) {
      console.log("🔄 AUTH FETCH: Got 401, attempting token refresh");

      // Attempt to refresh tokens
      const refreshResult = await refreshTokens();

      // If refresh successful, retry the original request
      if (refreshResult?.accessToken) {
        console.log("🔄 AUTH FETCH: Token refresh successful, retrying request");

        // Update Authorization header with new token
        fetchOptions.headers = {
          ...fetchOptions.headers,
          Authorization: `Bearer ${refreshResult.accessToken}`,
        };

        // Retry the original request
        console.log("📡 AUTH FETCH: Sending retry request");
        response = await fetch(input, fetchOptions);
        console.log("📥 AUTH FETCH: Retry response with status", response.status);
      } else {
        console.error("❌ AUTH FETCH: Token refresh failed");
      }
    }

    // If still unauthorized after refresh, redirect to get-started
    if (response.status === 401) {
      console.error("❌ AUTH FETCH: Still unauthorized after token refresh");
      localStorage.removeItem("auth_tokens");
      setTokens({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        federatedidentityID: null,
      });
      router.push("/get-started");
      throw new Error("Authentication failed");
    }

    return response;
  };

  return authenticatedFetch;
}
