// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/components/RequireWallet.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMe } from "@/hooks/useMe"; // Changed to useMe instead of useAuthStore

interface RequireWalletProps {
  children: React.ReactNode;
}

export function RequireWallet({ children }: RequireWalletProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useMe(); // Use the correct store
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("👤 User wallet status from useMe:", {
      email: user?.email,
      hasWallet: !!user?.wallet_address, // Changed to match useMe's structure
      currentPath: pathname,
      user: user,
    });

    const isWalletSetupPage = pathname.includes("add-my-wallet-address");

    if (user && !user.wallet_address && !isWalletSetupPage) {
      console.log("⚠️ No wallet set, redirecting to wallet setup...");
      router.push("/user-initialization/add-my-wallet-address");
      return;
    }

    setIsChecking(false);
  }, [user, router, pathname]);

  if (isChecking) return null;

  if (pathname.includes("add-my-wallet-address")) {
    return <>{children}</>;
  }

  if (user && !user.wallet_address) {
    return null;
  }

  return <>{children}</>;
}
