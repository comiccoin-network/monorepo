// src/hooks/useMe.js
import { useAuth } from "./useAuth";

export function useMe() {
  // Simply use the Auth context
  const { user, updateUser: updateAuthUser, logout } = useAuth();

  // The following is now just a wrapper around the auth context
  // But it maintains the same interface for backward compatibility
  const updateUser = (userData) => {
    // Access user in auth data
    updateAuthUser(userData);
  };

  return {
    user,
    updateUser,
    logout,
  };
}

export default useMe;
