// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// Define what our tokens look like
interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Define what functionality our auth context will provide
interface AuthContextType {
  tokens: Tokens | null;
  isAuthenticated: boolean;
  login: (tokens: Tokens) => void;
  logout: () => void;
  refreshTokens: () => Promise<boolean>;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// The provider component that wraps our app
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const router = useRouter();
  const loginPerformed = useRef(false);

  useEffect(() => {
    if (!loginPerformed.current) {
      const storedTokens = localStorage.getItem("auth_tokens");
      if (storedTokens) {
        try {
          setTokens(JSON.parse(storedTokens));
        } catch (error) {
          localStorage.removeItem("auth_tokens");
        }
      }
      loginPerformed.current = true;
    }
  }, []);

  const refreshTokens = async (): Promise<boolean> => {
    if (!tokens?.refreshToken) return false;

    try {
      const apiProtocol = process.env.NEXT_PUBLIC_API_PROTOCOL || "http";
      const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || "localhost";

      const response = await fetch(
        `${apiProtocol}://${apiDomain}/api/oauth/refresh`,
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

  const login = (newTokens: Tokens) => {
    if (!loginPerformed.current) {
      setTokens(newTokens);
      localStorage.setItem("auth_tokens", JSON.stringify(newTokens));
      loginPerformed.current = true;
    }
  };

  const logout = () => {
    setTokens(null);
    localStorage.removeItem("auth_tokens");
    loginPerformed.current = false;
    router.push("/");
  };

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

// Export the hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
