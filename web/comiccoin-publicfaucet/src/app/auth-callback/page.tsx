// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/auth-callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthentication = async () => {
      try {
        console.log("🔐 Processing authentication callback");

        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const expiresAt = searchParams.get("expires_at");

        if (!accessToken || !refreshToken || !expiresAt) {
          throw new Error("Missing authentication tokens");
        }

        const tokens = {
          accessToken,
          refreshToken,
          expiresAt: parseInt(expiresAt, 10),
        };

        // Set tokens in Zustand store (which persists to localStorage)
        console.log("✅ Setting authentication tokens");
        setTokens(tokens);

        // Small delay to ensure state is persisted
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verify persistence
        const storedAuth = localStorage.getItem("auth-storage");
        if (!storedAuth) {
          throw new Error("Failed to persist authentication state");
        }

        console.log("🚀 Redirecting to dashboard");
        router.push("/user/dashboard");
      } catch (error) {
        console.error("❌ Authentication error:", error);
        setError(
          error instanceof Error ? error.message : "Authentication failed",
        );
        router.push("/login");
      }
    };

    handleAuthentication();
  }, [searchParams, setTokens, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">Authentication Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
    </div>
  );
}
