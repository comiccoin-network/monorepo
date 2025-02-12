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
  logout: () => void;
}

// Creating a persistent store with Zustand
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tokens: null,
      isAuthenticated: false,
      setTokens: (tokens) => {
        console.log("🔑 Setting new tokens");
        set({ tokens, isAuthenticated: !!tokens });
      },
      logout: () => {
        console.log("🚪 Logging out user");
        set({ tokens: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage", // Name for the storage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }), // Only persist these fields
    },
  ),
);
