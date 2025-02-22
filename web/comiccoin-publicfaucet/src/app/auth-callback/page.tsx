// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/auth-callback/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useMe";
import { useGetMe } from "@/hooks/useGetMe";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuthStore();
  const { updateUser } = useMe(); // We only need updateUser from useMe
  const { refetch: fetchUserProfile, isLoading } = useGetMe({
    enabled: false,
    should_sync_now: true,
  });

  const hasProcessedAuth = useRef(false);

  useEffect(() => {
    if (hasProcessedAuth.current) {
      console.log("🔄 AUTH CALLBACK: Already processed");
      return;
    }

    async function handleAuth() {
      console.log("🚀 AUTH CALLBACK: Starting authentication");

      try {
        hasProcessedAuth.current = true;

        // Step 1: Get and validate tokens
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const expiresAt = searchParams.get("expires_at");
        const federatedidentityID = searchParams.get("federatedidentity_id");

        console.log("🔍 AUTH CALLBACK: Validating tokens", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasExpiryTime: !!expiresAt,
          hasFederatedIdentityID: !!federatedidentityID,
        });

        if (!accessToken) {
          throw new Error("Missing access tokens");
        }
        if (!refreshToken) {
          throw new Error("Missing refresh tokens");
        }
        if (!expiresAt) {
          throw new Error("Missing expires at");
        }
        if (!federatedidentityID) {
          throw new Error("Missing federated identity ID");
        }

        // Step 2: Store tokens in auth store
        console.log("💾 AUTH CALLBACK: Storing tokens");
        setTokens({
          accessToken,
          refreshToken,
          expiresAt: parseInt(expiresAt, 10),
          federatedidentityID: federatedidentityID,
        });

        try {
          // Step 3: Fetch fresh profile using new tokens
          console.log("👤 AUTH CALLBACK: Fetching latest profile");
          const userData = await fetchUserProfile();
          // Step 4: Store user data in local useMe store
          console.log("📱 AUTH CALLBACK: Updating local user data", {
            email: userData.email,
            wallet_address: userData.wallet_address,
          });
          // Use updateUser from useMe to handle local storage
          updateUser(userData);
          // Step 5: Navigate to dashboard
          console.log("🎯 AUTH CALLBACK: Success - redirecting to dashboard");
          router.replace("/user/dashboard");
        } catch (profileError) {
          console.log("❌ AUTH CALLBACK: Profile fetch failed", {
            error:
              profileError instanceof Error
                ? profileError.message
                : "Unknown error",
          });
          throw profileError;
        }
      } catch (error) {
        console.log("💥 AUTH CALLBACK: Process failed", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        router.replace("/?message=failed_loading");
      }
    }

    handleAuth();
  }, [searchParams, setTokens, updateUser, router, fetchUserProfile]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
        <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-gray-600">
          {isLoading
            ? "Fetching your profile..."
            : "Processing authentication..."}
        </div>
      </div>
    </div>
  );
}
