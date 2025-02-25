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
 * Interface for token pair storage
 */
interface TokenPair {
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Interface for token refresh response
 */
interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * Custom hook for authenticated fetching with automatic token refresh
 * @returns A function that performs authenticated fetch with token management
 */
export function useAuthenticatedFetch() {
  const router = useRouter();

  // Use local storage hook for managing tokens with type inference
  const [tokens, setTokens] = useLocalStorage<TokenPair>("auth_tokens", {
    accessToken: null,
    refreshToken: null,
  });

  /**
   * Perform token refresh
   * @returns New access and refresh tokens, or null if refresh fails
   */
  const refreshTokens = async (): Promise<TokenPair | null> => {
    try {
      const { refreshToken } = tokens;

      if (!refreshToken) {
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
        throw new Error("Token refresh failed");
      }

      const data: TokenRefreshResponse = await response.json();

      // Update tokens in local storage
      const newTokens: TokenPair = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      };

      setTokens(newTokens);

      return newTokens;
    } catch (error) {
      console.error("Token refresh error:", error);

      // Clear tokens and redirect to get-started page
      setTokens({ accessToken: null, refreshToken: null });
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
    // Clone options to avoid mutating the original
    const fetchOptions: FetchOptions = { ...options };

    // Prepare headers
    fetchOptions.headers = {
      ...fetchOptions.headers,
      "Content-Type": "application/json",
    };

    // Add access token if available
    const { accessToken } = tokens;
    if (accessToken) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }

    // Perform initial fetch
    let response = await fetch(input, fetchOptions);

    // Check for unauthorized access
    if (response.status === 401) {
      // Attempt to refresh tokens
      const refreshResult = await refreshTokens();

      // If refresh successful, retry the original request
      if (refreshResult?.accessToken) {
        // Update Authorization header with new token
        fetchOptions.headers = {
          ...fetchOptions.headers,
          Authorization: `Bearer ${refreshResult.accessToken}`,
        };

        // Retry the original request
        response = await fetch(input, fetchOptions);
      }
    }

    // If still unauthorized after refresh, redirect to get-started
    if (response.status === 401) {
      setTokens({ accessToken: null, refreshToken: null });
      router.push("/get-started");
      throw new Error("Authentication failed");
    }

    return response;
  };

  return authenticatedFetch;
}
