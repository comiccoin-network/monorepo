// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/auth-callback/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useMe";
import { API_CONFIG } from "@/config/env";

// Simple fetch function that doesn't rely on hooks
const fetchUserProfile = async (accessToken: string) => {
  const response = await fetch(`${API_CONFIG.baseUrl}/publicfaucet/api/v1/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return response.json();
};

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuthStore();
  const { updateUser } = useMe();

  // Use a ref to track if we've already processed this authentication
  const hasProcessedAuth = useRef(false);

  useEffect(() => {
    // If we've already processed this auth request, don't do it again
    if (hasProcessedAuth.current) {
      return;
    }

    async function handleAuth() {
      try {
        // Mark that we're processing auth
        hasProcessedAuth.current = true;

        // Get tokens from URL
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const expiresAt = searchParams.get("expires_at");

        if (!accessToken || !refreshToken || !expiresAt) {
          throw new Error("Missing tokens");
        }

        // Save tokens first
        const tokens = {
          accessToken,
          refreshToken,
          expiresAt: parseInt(expiresAt, 10),
        };
        setTokens(tokens);

        // Get user profile using the access token
        const userData = await fetchUserProfile(accessToken);
        updateUser(userData);

        // Use replace instead of push to avoid adding to history
        router.replace("/user/dashboard");
      } catch (error) {
        console.log("Auth error:", error);
        // Use replace here as well
        router.replace("/?message=failed_loading");
      }
    }

    handleAuth();
  }, [searchParams, setTokens, updateUser, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
    </div>
  );
}
