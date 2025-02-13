// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/components/AuthRequired.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { API_CONFIG } from "@/config/env";

export default function AuthRequired({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const { isAuthenticated, tokens, setTokens } = useAuthStore();

  useEffect(() => {
    // Add an initial delay to ensure Zustand has rehydrated
    const initialDelay = new Promise(resolve => setTimeout(resolve, 100));

    async function checkAuth() {
      console.log("🔄 Starting auth check");
      console.log("📊 Current state:", { isAuthenticated, hasTokens: !!tokens });

      // Wait for initial delay
      await initialDelay;

      console.log("🔄 State after delay:", { isAuthenticated, hasTokens: !!tokens });

      // Basic auth check
      if (!isAuthenticated || !tokens) {
        console.log("❌ No authentication found, redirecting");
        router.replace("/");
        return;
      }

      // Check token expiration
      const currentTime = Date.now();
      const isExpired = currentTime > tokens.expiresAt;

      console.log("⏰ Token status:", {
        currentTime: new Date(currentTime).toISOString(),
        expiryTime: new Date(tokens.expiresAt).toISOString(),
        timeUntilExpiry: Math.floor((tokens.expiresAt - currentTime) / 1000),
        isExpired
      });

      if (isExpired) {
        console.log("🔄 Token expired, attempting refresh");
        try {
          const response = await fetch(`${API_CONFIG.baseUrl}/api/token/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: tokens.refreshToken }),
          });

          if (!response.ok) {
            throw new Error(`Refresh failed: ${response.status}`);
          }

          const data = await response.json();
          console.log("✅ Token refresh successful");

          setTokens({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_at,
          });
        } catch (error) {
          console.error("❌ Token refresh failed:", error);
          router.replace("/");
          return;
        }
      }

      console.log("✅ Auth check complete - verified");
      setIsVerified(true);
    }

    checkAuth();
  }, [isAuthenticated, tokens, setTokens, router]);

  if (!isVerified) {
    console.log("⏳ Showing loading state");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  console.log("✅ Rendering protected content");
  return <>{children}</>;
}
