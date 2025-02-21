// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useAuth.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { API_CONFIG } from "@/config/env";

// First, let's define our interfaces for better type safety
interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthState {
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isRefreshing: boolean;
  setTokens: (tokens: Tokens | null) => void;
  clearTokens: () => void;
  refreshTokens: () => Promise<boolean>;
}

// Here's our custom storage implementation that was missing before
// This adds logging and better error handling around localStorage operations
const createAuthStorage = () => {
  return createJSONStorage(() => ({
    getItem: (name: string) => {
      try {
        // Try to get the item from localStorage
        const value = localStorage.getItem(name);

        if (!value) {
          console.log("📭 AUTH STATE: No tokens found in storage");
          return null;
        }

        // Parse the stored data and verify its structure
        const parsed = JSON.parse(value);
        const hasTokens = !!parsed?.state?.tokens;

        console.log("📦 AUTH STATE: Found stored data", {
          hasTokens,
          storageKey: name,
        });

        // Validate the token structure
        if (!hasTokens) {
          console.warn("⚠️ AUTH VALIDATION: Invalid token structure", {
            reason: "Missing required token data",
          });
          return null;
        }

        return value;
      } catch (error) {
        // Handle any errors during storage operations
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

// Now we can create our Zustand store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      tokens: null,
      isAuthenticated: false,
      isRefreshing: false,

      // Actions
      setTokens: (tokens) => {
        console.log("🎭 AUTH FLOW: Token update requested", {
          action: tokens ? "Setting new tokens" : "Clearing tokens",
          hasTokens: !!tokens,
        });

        if (tokens) {
          // Convert timestamp to milliseconds if needed
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
      },

      clearTokens: () => {
        console.log("🚪 AUTH LOGOUT: Starting cleanup");
        localStorage.removeItem("auth_tokens"); // Clear legacy storage
        set({
          tokens: null,
          isAuthenticated: false,
        });
      },

      // Centralized refresh token logic
      refreshTokens: async () => {
        const state = get();

        // Prevent multiple simultaneous refresh attempts
        if (state.isRefreshing) {
          console.log("🔄 Token refresh already in progress");
          return false;
        }

        if (!state.tokens?.refreshToken) {
          console.log("❌ No refresh token available");
          state.clearTokens();
          return false;
        }

        try {
          set({ isRefreshing: true });
          console.log("🔄 Attempting to refresh tokens");

          const response = await fetch(
            `${API_CONFIG.baseUrl}/publicfaucet/api/v1/token/refresh`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                refresh_token: state.tokens.refreshToken,
              }),
            },
          );

          if (!response.ok) {
            throw new Error(`Refresh failed: ${response.status}`);
          }

          const data = await response.json();

          state.setTokens({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_at,
          });

          console.log("✅ Token refresh successful");
          return true;
        } catch (error) {
          console.error("❌ Token refresh failed:", error);
          state.clearTokens();
          return false;
        } finally {
          set({ isRefreshing: false });
        }
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
