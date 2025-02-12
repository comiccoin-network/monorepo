// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, tokens, refreshTokens, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoading) {
        return;
      }

      if (!isAuthenticated) {
        router.push("/");
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      if (tokens && tokens.expiresAt - now < 300) {
        const refreshSuccess = await refreshTokens();
        if (!refreshSuccess) {
          router.push("/");
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, tokens, refreshTokens, router, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
