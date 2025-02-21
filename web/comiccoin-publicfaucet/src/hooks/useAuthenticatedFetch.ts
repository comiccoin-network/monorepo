// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useAuthenticatedFetch.ts
import { useCallback } from "react";
import { createAuthenticatedFetch } from "@/utils/api";
import { useRefreshToken } from "./useRefreshToken";

export function useAuthenticatedFetch() {
  const refreshTokens = useRefreshToken();

  // Create the authenticated fetch instance with the refresh token function
  const authenticatedFetch = useCallback(
    createAuthenticatedFetch(refreshTokens),
    [refreshTokens],
  );

  return authenticatedFetch;
}
