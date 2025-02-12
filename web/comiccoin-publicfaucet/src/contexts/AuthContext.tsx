// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthContextType {
  tokens: Tokens | null;
  isAuthenticated: boolean;
  login: (tokens: Tokens) => Promise<void>; // Changed to async
  logout: () => void;
  refreshTokens: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedTokens = localStorage.getItem("auth_tokens");
    if (storedTokens) {
      try {
        const parsedTokens = JSON.parse(storedTokens);
        setTokens(parsedTokens);
      } catch (error) {
        localStorage.removeItem("auth_tokens");
      }
    }
    setIsInitialized(true);
  }, []);

  const login = async (newTokens: Tokens) => {
    setTokens(newTokens);
    localStorage.setItem("auth_tokens", JSON.stringify(newTokens));
    // Add a small delay before navigation to ensure state is updated
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const logout = () => {
    setTokens(null);
    localStorage.removeItem("auth_tokens");
    try {
      router.push("/");
    } catch (error) {
      window.location.href = "/";
    }
  };

  const refreshTokens = async (): Promise<boolean> => {
    if (!tokens?.refreshToken) return false;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_PROTOCOL}://${process.env.NEXT_PUBLIC_API_DOMAIN}/api/oauth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: tokens.refreshToken,
          }),
        },
      );

      if (!response.ok) throw new Error("Refresh failed");

      const data = await response.json();
      const newTokens: Tokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
      };

      setTokens(newTokens);
      localStorage.setItem("auth_tokens", JSON.stringify(newTokens));
      return true;
    } catch (error) {
      console.error("Failed to refresh tokens:", error);
      logout();
      return false;
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        tokens,
        isAuthenticated: !!tokens,
        login,
        logout,
        refreshTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
