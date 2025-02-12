// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/dashboard/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("ProtectedPage: NOT AUTHENTICATED");
      router.push("/");
    }
  }, [isAuthenticated, router]);

  return <div>Protected Content</div>;
}
