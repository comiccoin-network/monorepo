// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useMe.ts
import { useState, useEffect } from "react";

// Types for our user data
interface User {
  id: string;
  email: string;
  name: string;
  // Add other fields as needed
}

export function useMe() {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage when the hook is first used
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Function to update user data and save to localStorage
  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Function to clear user data
  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return { user, updateUser, clearUser };
}
