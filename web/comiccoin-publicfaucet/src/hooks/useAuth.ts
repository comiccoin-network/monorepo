// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useAuth.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthState {
  tokens: Tokens | null;
  isAuthenticated: boolean;
  setTokens: (tokens: Tokens | null) => void;
  clearTokens: () => void;
}

const createAuthStorage = () => {
  return createJSONStorage(() => ({
    getItem: (name: string) => {
      try {
        console.log("🔍 AUTH CHECK: Looking for stored tokens...");
        const value = localStorage.getItem(name);

        if (!value) {
          console.log("📭 AUTH STATE: No tokens found in storage");
          return null;
        }

        const parsed = JSON.parse(value);
        console.log("📦 AUTH STATE: Found stored data", {
          hasTokens: !!parsed?.state?.tokens,
          storageKey: name,
        });

        // Validate stored data structure
        if (!parsed?.state?.tokens) {
          console.warn("⚠️ AUTH VALIDATION: Invalid token structure", {
            reason: "Missing required token data",
          });
          return null;
        }

        // Check token expiry if present
        if (parsed.state.tokens?.expiresAt) {
          const now = Date.now();
          const expiresAt = parsed.state.tokens.expiresAt;
          const timeUntilExpiry = Math.floor((expiresAt - now) / 1000);

          console.log("⏰ AUTH TOKENS: Expiry check", {
            expiresAt: new Date(expiresAt).toISOString(),
            timeUntilExpiry: `${timeUntilExpiry} seconds`,
            isExpired: expiresAt < now,
          });
        }

        return value;
      } catch (error) {
        console.error("💥 AUTH ERROR: Failed reading from storage", {
          error: error instanceof Error ? error.message : "Unknown error",
          storageKey: name,
        });
        return null;
      }
    },

    setItem: (name: string, value: string) => {
      try {
        console.log("💾 AUTH STORAGE: Saving token data", {
          storageKey: name,
          dataSize: value.length,
        });
        localStorage.setItem(name, value);
        console.log("✅ AUTH STORAGE: Successfully saved tokens");
      } catch (error) {
        console.error("💥 AUTH ERROR: Failed saving to storage", {
          error: error instanceof Error ? error.message : "Unknown error",
          storageKey: name,
        });
      }
    },

    removeItem: (name: string) => {
      try {
        console.log("🗑️ AUTH CLEANUP: Removing stored tokens", {
          storageKey: name,
        });
        localStorage.removeItem(name);
        console.log("✅ AUTH CLEANUP: Successfully cleared tokens");
      } catch (error) {
        console.error("💥 AUTH ERROR: Failed removing from storage", {
          error: error instanceof Error ? error.message : "Unknown error",
          storageKey: name,
        });
      }
    },
  }));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tokens: null,
      isAuthenticated: false,

      setTokens: (tokens) => {
        console.log("🎭 AUTH FLOW: Token update requested", {
          action: tokens ? "Setting new tokens" : "Clearing tokens",
          hasTokens: !!tokens,
        });

        if (tokens) {
          // Convert timestamp if needed
          if (tokens.expiresAt < 1000000000000) {
            console.log("⚙️ AUTH TOKENS: Converting expiry to milliseconds");
            tokens.expiresAt *= 1000;
          }

          const now = Date.now();
          const timeUntilExpiry = Math.floor((tokens.expiresAt - now) / 1000);

          console.log("📊 AUTH TOKENS: New token details", {
            accessTokenLength: tokens.accessToken.length,
            refreshTokenPresent: !!tokens.refreshToken,
            expiresAt: new Date(tokens.expiresAt).toISOString(),
            timeUntilExpiry: `${timeUntilExpiry} seconds`,
          });

          if (timeUntilExpiry < 0) {
            console.warn("⚠️ AUTH WARNING: Setting expired tokens", {
              expiredBy: `${Math.abs(timeUntilExpiry)} seconds`,
            });
          }
        } else {
          console.log("🧹 AUTH FLOW: Clearing existing tokens");
        }

        set({
          tokens,
          isAuthenticated: !!tokens,
        });

        console.log("✨ AUTH STATE: Update complete", {
          isAuthenticated: !!tokens,
        });
      },

      clearTokens: () => {
        console.log("🚪 AUTH LOGOUT: Starting cleanup");

        // Clear any legacy storage first
        console.log("🧹 AUTH CLEANUP: Removing legacy data");
        localStorage.removeItem("auth_tokens");

        set({
          tokens: null,
          isAuthenticated: false,
        });

        console.log("✅ AUTH LOGOUT: Cleanup complete", {
          remainingStorageKeys: Object.keys(localStorage).length,
        });
      },
    }),
    {
      name: "auth",
      storage: createAuthStorage(),
      partialize: (state) => ({
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        console.log("🔄 AUTH INIT: Starting state rehydration");

        return (state) => {
          if (!state) {
            console.log("📭 AUTH INIT: No stored state found");
            return;
          }

          const now = Date.now();
          const tokens = state.tokens;

          if (tokens) {
            const timeUntilExpiry = Math.floor((tokens.expiresAt - now) / 1000);
            const isExpired = tokens.expiresAt < now;

            console.log("🔐 AUTH INIT: State rehydrated", {
              isAuthenticated: state.isAuthenticated,
              tokenStatus: isExpired ? "expired" : "valid",
              timeUntilExpiry: `${timeUntilExpiry} seconds`,
              expiresAt: new Date(tokens.expiresAt).toISOString(),
            });
          } else {
            console.log("🔐 AUTH INIT: State rehydrated without tokens", {
              isAuthenticated: false,
            });
          }
        };
      },
    },
  ),
);
