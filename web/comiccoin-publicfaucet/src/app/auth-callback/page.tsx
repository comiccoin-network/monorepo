// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/auth-callback/page.tsx
"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useGetMe } from "@/hooks/useGetMe";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";

// Define the token interface for better type safety
interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  federatedidentityID: string | null;
}

// Create a client component that uses the search params
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fetchWithAuth = useAuthenticatedFetch();

  // Create local storage hooks for tokens with proper typing
  const [tokens, setTokens] = useLocalStorage<AuthTokens>("auth_tokens", {
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    federatedidentityID: null,
  });

  // Use the useGetMe hook with initial disabled state
  const { user, isLoading, error, refetch } = useGetMe({
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

        // Validation checks
        if (!accessToken) throw new Error("Missing access tokens");
        if (!refreshToken) throw new Error("Missing refresh tokens");
        if (!expiresAt) throw new Error("Missing expires at");
        if (!federatedidentityID)
          throw new Error("Missing federated identity ID");

        // Step 2: Store tokens in local storage
        console.log("💾 AUTH CALLBACK: Storing tokens");
        setTokens({
          accessToken,
          refreshToken,
          expiresAt: parseInt(expiresAt, 10),
          federatedidentityID,
        });

        try {
          // Step 3: Fetch user profile using the pre-configured useGetMe hook
          console.log("👤 AUTH CALLBACK: Fetching latest profile");
          const userData = await refetch();

          // Step 4: Profile fetched successfully
          console.log("📱 AUTH CALLBACK: User profile retrieved", {
            email: userData.email,
            wallet_address: userData.wallet_address,
          });

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
  }, [searchParams, router, refetch, setTokens]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
          <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-gray-600">
            Fetching your profile...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-500 mb-4">Authentication Failed</h2>
          <p className="text-gray-600">{error.message}</p>
          <button
            onClick={() => router.replace("/")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Successful authentication with user data
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl mb-4">Welcome, {user?.name || "User"}!</h2>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function AuthCallbackLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
        <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-gray-600">
          Loading...
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense
export default function AuthCallback() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
