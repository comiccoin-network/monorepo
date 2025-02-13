// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/components/AuthProvider.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This state ensures we don't render children until hydration is complete
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check if we have stored tokens in localStorage
    const storedAuth = localStorage.getItem("auth-storage");
    if (storedAuth) {
      try {
        const { state } = JSON.parse(storedAuth);
        if (state.tokens) {
          console.log("🔄 Restoring authentication state");
          useAuthStore.getState().setTokens(state.tokens);
        }
      } catch (error) {
        console.log("❌ Error restoring auth state:", error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Don't render children until after hydration
  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
