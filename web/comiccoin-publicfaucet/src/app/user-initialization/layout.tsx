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

  // Return just the content, not a full HTML document
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-purple-50 flex flex-col items-center justify-center p-4">
      {children}
    </div>
  );
}
