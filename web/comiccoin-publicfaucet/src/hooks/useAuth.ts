// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useAuth.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { API_CONFIG } from "@/config/env";

// Define our types for better type safety and code clarity
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

// Our custom storage implementation with robust error handling
const createAuthStorage = () => {
  return createJSONStorage(() => ({
    getItem: (name: string) => {
      try {
        const value = localStorage.getItem(name);
        if (!value) {
          console.log("📭 AUTH STATE: No tokens found in storage");
          return null;
        }

        // Parse and validate the stored data structure
        const parsed = JSON.parse(value);
        const tokens = parsed?.state?.tokens;

        // Perform thorough validation of the token structure
        if (!tokens?.accessToken || !tokens?.refreshToken) {
          console.warn("⚠️ AUTH VALIDATION: Invalid token structure");
          return null;
        }

        console.log("📦 AUTH STATE: Valid tokens found in storage");
        return value;
      } catch (error) {
        console.log("💥 AUTH ERROR: Storage read failed", error);
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        localStorage.setItem(name, value);
        console.log("✅ AUTH STORAGE: Tokens saved successfully");
      } catch (error) {
        console.log("💥 AUTH ERROR: Storage write failed", error);
      }
    },
    removeItem: (name: string) => {
      try {
        localStorage.removeItem(name);
        console.log("✅ AUTH CLEANUP: Storage cleared successfully");
      } catch (error) {
        console.log("💥 AUTH ERROR: Storage cleanup failed", error);
      }
    },
  }));
};

// Create our Zustand store with persistence and proper token management
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokens: null,
      isAuthenticated: false,
      isRefreshing: false,

      setTokens: (tokens) => {
        if (tokens) {
          // Ensure timestamp is in milliseconds
          const expiresAt =
            tokens.expiresAt < 1000000000000
              ? tokens.expiresAt * 1000
              : tokens.expiresAt;

          console.log("🎭 AUTH FLOW: Setting new tokens", {
            expiresIn: Math.floor((expiresAt - Date.now()) / 1000) + " seconds",
          });

          set({
            tokens: { ...tokens, expiresAt },
            isAuthenticated: true,
          });
        } else {
          console.log("🎭 AUTH FLOW: Clearing tokens");
          set({ tokens: null, isAuthenticated: false });
        }
      },

      clearTokens: () => {
        console.log("🚪 AUTH LOGOUT: Cleaning up");
        set({ tokens: null, isAuthenticated: false });
      },

      refreshTokens: async () => {
        const state = get();

        // Prevent concurrent refresh attempts
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
          console.log("🔄 Attempting token refresh");

          // Make the refresh request with proper error handling
          const response = await fetch(
            `${API_CONFIG.baseUrl}/publicfaucet/api/v1/token/refresh`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                refresh_token: state.tokens.refreshToken,
              }),
            },
          );

          // Handle non-200 responses properly
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log("❌ Refresh failed:", errorData);
            throw new Error(`Refresh failed: ${response.status}`);
          }

          // Parse and validate the response
          const data = await response.json();

          if (!data.access_token || !data.refresh_token) {
            throw new Error("Invalid token data received");
          }

          // Update tokens in the store
          state.setTokens({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_at,
          });

          console.log("✅ Token refresh successful");
          return true;
        } catch (error) {
          console.log("❌ Token refresh failed:", error);
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
