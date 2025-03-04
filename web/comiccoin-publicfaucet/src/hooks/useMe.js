// src/hooks/useMe.js
import { useState, useCallback } from "react";

// Constants for storage keys
const AUTH_STORAGE_KEY = "auth_data";
const USER_PROFILE_KEY = "userProfile";

export function useMe() {
  // Read initial state from localStorage
  const getUserFromStorage = () => {
    try {
      // First try to get from the auth_data which is your current storage approach
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.user || null;
      }

      // Fallback to the previous storage key as backup
      const stored = localStorage.getItem(USER_PROFILE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("🔴 Failed to read user from storage:", err);
      return null;
    }
  };

  // Set up state
  const [user, setUser] = useState(getUserFromStorage());

  // Update user in state and localStorage
  const updateUser = useCallback((userData) => {
    // Update state
    setUser(userData);

    // Update in localStorage - using your current auth data structure
    try {
      if (userData) {
        // Get existing auth data
        const authDataStr = localStorage.getItem(AUTH_STORAGE_KEY);
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          // Update the user property
          const updatedAuthData = {
            ...authData,
            user: userData,
          };
          localStorage.setItem(
            AUTH_STORAGE_KEY,
            JSON.stringify(updatedAuthData),
          );
        } else {
          // If no auth data exists, store user in the original location
          localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userData));
        }
      } else {
        // If userData is null, remove both storage items
        localStorage.removeItem(USER_PROFILE_KEY);
        // Don't remove AUTH_STORAGE_KEY as it contains tokens
      }
    } catch (error) {
      console.error("🔴 Error updating user data in storage:", error);
    }
  }, []);

  // Logout function - reusing your existing AuthContext logout
  const logout = useCallback(() => {
    // Clear user from state
    setUser(null);

    // Clear localStorage - match your current implementation
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Also clear the legacy storage
    localStorage.removeItem(USER_PROFILE_KEY);
  }, []);

  return {
    user,
    updateUser,
    logout,
  };
}

export default useMe;
