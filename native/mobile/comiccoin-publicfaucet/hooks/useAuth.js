// hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * Custom hook for accessing authentication context
 * Provides access to user data and authentication methods
 *
 * @returns {Object} Authentication context with user data and auth methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;
