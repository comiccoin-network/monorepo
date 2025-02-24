// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/components/AuthProvider.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useMe";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const { setTokens } = useAuthStore();
  const { updateUser } = useMe(); // Use updateUser from useMe instead of setUser

  useEffect(() => {
    console.log("🔄 AuthProvider: Starting hydration check");

    const hydrateAuth = () => {
      try {
        // Check current store state
        const currentState = useAuthStore.getState();
        console.log("📊 Current store state:", {
          hasTokens: !!currentState.tokens,
          isAuthenticated: currentState.isAuthenticated,
        });

        // Check localStorage directly
        const authStorage = localStorage.getItem("auth");
        if (authStorage) {
          console.log("💾 Found auth storage data");
          const { state } = JSON.parse(authStorage);

          // Validate stored data
          if (state?.tokens?.accessToken && state?.tokens?.expiresAt) {
            console.log("✅ Stored tokens are valid");

            // Convert expiresAt to milliseconds if needed
            if (state.tokens.expiresAt < 1000000000000) {
              console.log("⏰ Converting expiresAt to milliseconds");
              state.tokens.expiresAt *= 1000;
            }

            // Check if tokens are expired
            const isExpired = Date.now() > state.tokens.expiresAt;
            console.log("⏰ Token expiry status:", {
              currentTime: new Date().toISOString(),
              expiryTime: new Date(state.tokens.expiresAt).toISOString(),
              isExpired,
            });

            if (!isExpired) {
              console.log("✅ Setting validated tokens");
              setTokens(state.tokens);
            } else {
              console.log("⚠️ Stored tokens are expired");
              localStorage.removeItem("auth");
            }
          }

          // Check for user data in localStorage directly
          const userData = localStorage.getItem("user");
          if (userData) {
            console.log("👤 Setting user data from localStorage");
            try {
              const user = JSON.parse(userData);
              updateUser(user);
            } catch (error) {
              console.log("❌ Error parsing user data:", error);
            }
          }
        } else {
          console.log("ℹ️ No auth storage found");
        }
      } catch (error) {
        console.log("❌ Error during hydration:", error);
        // Clear potentially corrupted storage
        localStorage.removeItem("auth");
      } finally {
        console.log("✅ Hydration process complete");
        setIsHydrated(true);
      }
    };

    hydrateAuth();
  }, [setTokens, updateUser]);

  if (!isHydrated) {
    console.log("⏳ Waiting for hydration");
    return null;
  }

  console.log("🎉 Rendering authenticated content");
  return <>{children}</>;
}
