// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useAuth.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Define our token structure
interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Define the shape of our auth state
interface AuthState {
  tokens: Tokens | null;
  isAuthenticated: boolean;
  setTokens: (tokens: Tokens | null) => void;
  clearTokens: () => void;
}

// Custom storage implementation with logging
const createAuthStorage = () => {
  return createJSONStorage(() => ({
    getItem: (name: string) => {
      try {
        const value = localStorage.getItem(name);

        if (!value) {
          console.log("📭 AUTH STATE: No tokens found in storage");
          return null;
        }

        const parsed = JSON.parse(value);
        const hasTokens = !!parsed?.state?.tokens;

        console.log("📦 AUTH STATE: Found stored data", {
          hasTokens,
          storageKey: name,
        });

        if (!hasTokens) {
          console.warn("⚠️ AUTH VALIDATION: Invalid token structure", {
            reason: "Missing required token data",
          });
          return null;
        }

        return value;
      } catch (error) {
        console.error("💥 AUTH ERROR: Failed reading from storage", error);
        return null;
      }
    },

    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value);
        console.log("✅ AUTH STORAGE: Successfully saved tokens");
      } catch (error) {
        console.error("💥 AUTH ERROR: Failed saving to storage", error);
      }
    },

    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
        console.log("✅ AUTH CLEANUP: Successfully cleared tokens");
      } catch (error) {
        console.error("💥 AUTH ERROR: Failed removing from storage", error);
      }
    },
  }));
};

// Create our Zustand store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      tokens: null,
      isAuthenticated: false,

      // Actions
      setTokens: (tokens) => {
        console.log("🎭 AUTH FLOW: Token update requested", {
          action: tokens ? "Setting new tokens" : "Clearing tokens",
          hasTokens: !!tokens,
        });

        if (tokens) {
          // Ensure timestamp is in milliseconds
          if (tokens.expiresAt < 1000000000000) {
            tokens.expiresAt *= 1000;
          }

          const now = Date.now();
          const timeUntilExpiry = Math.floor((tokens.expiresAt - now) / 1000);

          console.log("📊 AUTH TOKENS: New token details", {
            expiresAt: new Date(tokens.expiresAt).toISOString(),
            timeUntilExpiry: `${timeUntilExpiry} seconds`,
          });
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

        // Clear any legacy storage
        localStorage.removeItem("auth_tokens");

        set({
          tokens: null,
          isAuthenticated: false,
        });

        console.log("✅ AUTH LOGOUT: Cleanup complete");
      },
    }),
    {
      name: "auth",
      storage: createAuthStorage(),
      partialize: (state) => ({
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
