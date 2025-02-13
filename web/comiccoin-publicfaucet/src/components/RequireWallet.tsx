// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/components/RequireWallet.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/useMe";

interface RequireWalletProps {
  children: React.ReactNode;
}

export function RequireWallet({ children }: RequireWalletProps) {
  const router = useRouter();
  const { user } = useMe();

  useEffect(() => {
    // If we have user data but no wallet address, redirect
    if (user && !user.walletAddress) {
      router.push("/user-initialization/add-my-wallet-address");
    }
  }, [user, router]);

  // If no user or has wallet, render children
  // If user exists but no wallet, return null (redirect will happen)
  if (user && !user.walletAddress) {
    return null;
  }

  return <>{children}</>;
}
