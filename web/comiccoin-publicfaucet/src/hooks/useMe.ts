// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useMe.ts
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
}

export function useMe() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const updateWallet = (walletAddress: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        wallet_address: walletAddress, // Store as a direct string property
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return { user, updateUser, updateWallet, clearUser };
}
