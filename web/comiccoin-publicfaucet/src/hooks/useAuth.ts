// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useAuth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_CONFIG } from "@/config/env";

// Interfaces for tokens and auth state
interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  federatedidentityID: string;
}

interface AuthState {
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isRefreshing: boolean;
  setTokens: (tokens: Tokens | null) => void;
  clearTokens: () => void;
  refreshTokens: () => Promise<boolean>;
}

// Simplified storage middleware for Next.js and browser compatibility
const createBrowserStorage = () => ({
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return null;
    }
  },
  setItem: (key: string, value: any) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage", error);
    }
  },
});

// Create the authentication store with simplified persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokens: null,
      isAuthenticated: false,
      isRefreshing: false,

      // Set tokens with basic validation
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

      // Clear tokens and authentication state
      clearTokens: () => {
        console.log("🚪 AUTH LOGOUT: Cleaning up");
        set({ tokens: null, isAuthenticated: false });
      },

      // Refresh tokens with error handling
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

          // Make the refresh request
          const response = await fetch(
            `${API_CONFIG.baseUrl}/publicfaucet/api/v1/token/refresh`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                federatedidentity_id: state.tokens.federatedidentityID,
                refresh_token: state.tokens.refreshToken,
              }),
            },
          );

          // Handle non-200 responses
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.log("❌ Refresh failed:", errorData);
            throw new Error(`Refresh failed: ${response.status}`);
          }

          // Parse and validate the response
          const data = await response.json();

          if (
            !data.access_token ||
            !data.refresh_token ||
            !data.federatedidentity_id
          ) {
            throw new Error("Invalid token data received");
          }

          // Update tokens in the store
          state.setTokens({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_at,
            federatedidentityID: data.federatedidentity_id,
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
      name: "auth-tokens", // Simple key for localStorage
      storage: createBrowserStorage(), // Use simplified storage
      partialize: (state) => ({
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
