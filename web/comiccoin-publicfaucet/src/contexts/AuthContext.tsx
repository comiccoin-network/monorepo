"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User, AuthState } from "@/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const router = useRouter();

  useEffect(() => {
    // Check for existing session
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Here you would typically make an API call to verify the session
      const session = localStorage.getItem("session");
      if (session) {
        const user = JSON.parse(session);
        setState({ isAuthenticated: true, user, loading: false });
      } else {
        setState({ isAuthenticated: false, user: null, loading: false });
      }
    } catch (error) {
      setState({ isAuthenticated: false, user: null, loading: false });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Here you would typically make an API call to your backend
      // For now, we'll simulate a successful login
      const user: User = {
        id: "1",
        email,
        username: email.split("@")[0],
        isVerified: false,
        createdAt: new Date(),
      };

      localStorage.setItem("session", JSON.stringify(user));
      setState({ isAuthenticated: true, user, loading: false });
      router.push("/dashboard");
    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string,
  ) => {
    try {
      // Here you would typically make an API call to your backend
      const user: User = {
        id: "1",
        email,
        username,
        isVerified: false,
        createdAt: new Date(),
      };

      localStorage.setItem("session", JSON.stringify(user));
      setState({ isAuthenticated: true, user, loading: false });
      router.push("/dashboard");
    } catch (error) {
      throw new Error("Registration failed");
    }
  };

  const logout = async () => {
    localStorage.removeItem("session");
    setState({ isAuthenticated: false, user: null, loading: false });
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
