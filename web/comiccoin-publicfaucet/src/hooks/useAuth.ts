// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useAuth.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface User {
  federatedidentity_id: string;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  lexical_name: string;
  phone?: string;
  country?: string;
  timezone: string;
  wallet_address?: { address: string } | null;
}

interface AuthState {
  tokens: Tokens | null;
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setTokens: (tokens: Tokens | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Selectors
  getAccessToken: () => string | null;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokens: null,
      user: null,
      isAuthenticated: false,

      setTokens: (tokens) => {
        console.log("🔑 Setting new tokens");
        set({ tokens, isAuthenticated: !!tokens });
      },

      setUser: (user) => {
        console.log("👤 Updating user data");
        set({ user });
      },

      logout: () => {
        console.log("🚪 Logging out user");
        set({ tokens: null, user: null, isAuthenticated: false });
      },

      // Selector to get the current access token
      getAccessToken: () => get().tokens?.accessToken || null,

      // Selector to check if the current token is expired
      isTokenExpired: () => {
        const tokens = get().tokens;
        if (!tokens) return true;

        // Add a 5-minute buffer to handle clock skew
        const bufferTime = 5 * 60 * 1000;
        return Date.now() + bufferTime >= tokens.expiresAt;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
