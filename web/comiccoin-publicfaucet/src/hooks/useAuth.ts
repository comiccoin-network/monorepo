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
  setTokens: (tokens: Tokens | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Custom storage with enhanced logging and error handling
const createCustomStorage = () => {
  const storage = createJSONStorage(() => ({
    getItem: (name: string) => {
      try {
        const value = localStorage.getItem(name);
        console.log("📦 Getting from storage:", name, value ? "Found" : "Not found");
        if (value) {
          // Validate JSON structure
          const parsed = JSON.parse(value);
          if (!parsed.state) {
            console.warn("⚠️ Invalid storage structure");
            return null;
          }
        }
        return value;
      } catch (error) {
        console.error("❌ Error reading from storage:", error);
        return null;
      }
    },
    setItem: (name: string, value: string) => {
      try {
        console.log("💾 Saving to storage:", name);
        localStorage.setItem(name, value);
      } catch (error) {
        console.error("❌ Error writing to storage:", error);
      }
    },
    removeItem: (name: string) => {
      try {
        console.log("🗑️ Removing from storage:", name);
        localStorage.removeItem(name);
      } catch (error) {
        console.error("❌ Error removing from storage:", error);
      }
    },
  }));
  return storage;
};

// Create our store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      tokens: null,
      user: null,
      isAuthenticated: false,

      setTokens: (tokens) => {
        console.log("🔑 Setting tokens:", tokens ? "Present" : "Clearing");
        if (tokens) {
          // Ensure expiresAt is in milliseconds
          if (tokens.expiresAt < 1000000000000) {
            console.log("⏰ Converting expiresAt to milliseconds");
            tokens.expiresAt *= 1000;
          }
          console.log("⏰ Token expiry:", new Date(tokens.expiresAt).toISOString());
        }
        set({ tokens, isAuthenticated: !!tokens });
      },

      setUser: (user) => {
        console.log("👤 Setting user:", user ? user.email : "Clearing");
        set({ user });
      },

      logout: () => {
        console.log("🚪 Logging out and clearing state");
        set({ tokens: null, user: null, isAuthenticated: false });
        // Also clear any legacy storage
        localStorage.removeItem("auth_tokens");
        localStorage.removeItem("user");
      },
    }),
    {
      name: "auth", // Storage key
      storage: createCustomStorage(),
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        console.log("🔄 Starting storage rehydration");
        return (state) => {
          console.log("✅ Storage rehydration complete", {
            hasState: !!state,
            isAuthenticated: state?.isAuthenticated,
          });
        };
      },
    }
  )
);
