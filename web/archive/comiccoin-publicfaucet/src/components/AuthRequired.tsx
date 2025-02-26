// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/components/AuthRequired.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";

export default function AuthRequired({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const { isAuthenticated, tokens, refreshTokens } = useAuthStore();

  useEffect(() => {
    async function checkAuth() {
      console.log("🔄 Starting auth check");

      // Basic auth check
      if (!isAuthenticated || !tokens) {
        console.log("❌ No authentication found, redirecting");
        router.replace("/");
        return;
      }

      // Check token expiration
      const currentTime = Date.now();
      const isExpired = currentTime > tokens.expiresAt;

      if (isExpired) {
        const refreshSuccess = await refreshTokens();
        if (!refreshSuccess) {
          router.replace("/");
          return;
        }
      }

      setIsVerified(true);
    }

    // Small delay to ensure Zustand has rehydrated
    setTimeout(checkAuth, 100);
  }, [isAuthenticated, tokens, refreshTokens, router]);

  if (!isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return <>{children}</>;
}
