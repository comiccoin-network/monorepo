// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/app/user-initialization/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";

export default function UserInitializationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log(
        "❌ Kicking user off `/user-initialization` into `/get-started` page.",
      );
      router.push("/get-started");
    }
  }, [isAuthenticated, router]);

  // Optimized layout for better mobile support
  return (
    <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center px-4 py-6 sm:py-8 md:p-4 overflow-auto">
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );
}
