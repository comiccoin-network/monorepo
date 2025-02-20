// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useMe.ts
import { useState, useEffect } from "react";

interface User {
  federatedidentity_id: string;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  lexical_name: string;
  phone: string;
  country: string;
  timezone: string;
  wallet_address: string | null;
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

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return { user, updateUser, clearUser };
}
