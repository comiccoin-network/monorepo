// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/components/RequireWallet.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMe } from "@/hooks/useMe";

interface RequireWalletProps {
  children: React.ReactNode;
}

export function RequireWallet({ children }: RequireWalletProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useMe();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Don't redirect if we're already on the wallet setup page
    const isWalletSetupPage = pathname.includes("add-my-wallet-address");

    // Redirect only if we have a user but no wallet, and we're not already on the setup page
    if (user && !user.wallet_address && !isWalletSetupPage) {
      console.log("⚠️ No wallet set, redirecting to wallet setup...");
      router.push("/user-initialization/add-my-wallet-address");
    }

    setIsChecking(false);
  }, [user, router, pathname]);

  // Show nothing while we're checking the state
  if (isChecking) {
    return null;
  }

  // Always render children on the wallet setup page
  if (pathname.includes("add-my-wallet-address")) {
    return <>{children}</>;
  }

  // On other pages, only render if we have both user and wallet
  if (user && !user.wallet_address) {
    return null;
  }

  return <>{children}</>;
}
