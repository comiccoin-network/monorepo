// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/components/AuthRequired.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";

export default function AuthRequired({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication after hydration
    const checkAuth = async () => {
      console.log("🔍 Checking authentication status");

      // Small delay to ensure hydration is complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!isAuthenticated) {
        console.log("🔒 User not authenticated, redirecting");
        router.push("/login");
      } else {
        console.log("✅ User is authenticated");
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, router]);

  // Show nothing while checking auth status
  if (isChecking) {
    return null;
  }

  // If not authenticated, render nothing (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render children
  return <>{children}</>;
}
