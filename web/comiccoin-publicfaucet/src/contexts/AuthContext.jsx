// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";

export const AuthContext = createContext(null);

// Key used for storing auth data in localStorage
const AUTH_STORAGE_KEY = "auth_data";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Function to load user from storage
  const loadUserFromStorage = useCallback(() => {
    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );
      if (authData.user) {
        setUser(authData.user);
      }
    } catch (error) {
      console.error("Failed to load user from storage:", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for stored user on mount
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const { data } = await axiosClient.post("/login", credentials);

      // Store the complete auth data object exactly as received from the API
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));

      // Update user state with the user object
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);

    // Clear all queries to avoid showing private data after logout
    queryClient.clear();

    // Redirect to login page
    window.location.href = "/login";
  }, [queryClient]);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Get current access token
  const getAccessToken = useCallback(() => {
    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );
      return authData.access_token || null;
    } catch {
      return null;
    }
  }, []);

  // Get refresh token
  const getRefreshToken = useCallback(() => {
    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );
      return authData.refresh_token || null;
    } catch {
      return null;
    }
  }, []);

  // Check if access token is expired
  const isAccessTokenExpired = useCallback(() => {
    try {
      const authData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );
      if (!authData.access_token_expiry_time) {
        return true;
      }

      const expiryTime = new Date(authData.access_token_expiry_time).getTime();
      return Date.now() >= expiryTime;
    } catch {
      return true;
    }
  }, []);

  // Update tokens after refresh
  const updateTokens = useCallback((newAuthData) => {
    try {
      // Get existing auth data
      const existingAuthData = JSON.parse(
        localStorage.getItem(AUTH_STORAGE_KEY) || "{}",
      );

      // Update only the token-related fields
      const updatedAuthData = {
        ...existingAuthData,
        access_token: newAuthData.access_token,
        access_token_expiry_time: newAuthData.access_token_expiry_time,
        refresh_token: newAuthData.refresh_token,
        refresh_token_expiry_time: newAuthData.refresh_token_expiry_time,
      };

      // Save updated auth data
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedAuthData));
    } catch (error) {
      console.error("Failed to update tokens:", error);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getAccessToken,
    getRefreshToken,
    isAccessTokenExpired,
    updateTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
