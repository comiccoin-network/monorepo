// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/components/hoc/withAuth.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ComponentType, useEffect, useState } from "react";

const logAuthState = (componentName: string, state: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`🔒 [${componentName}] Auth State:`, state);
  }
};

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: {
    componentName?: string;
  } = {},
) {
  return function AuthProtectedComponent(props: P) {
    const { isAuthenticated, tokens } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const componentName = options.componentName || WrappedComponent.name;

    useEffect(() => {
      const checkAuth = async () => {
        const storedTokens = localStorage.getItem("auth_tokens");

        logAuthState(componentName, {
          isAuthenticated,
          hasTokens: !!tokens,
          hasStoredTokens: !!storedTokens,
        });

        // Wait a brief moment for auth state to stabilize
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!storedTokens && !isAuthenticated) {
          logAuthState(componentName, {
            action: "redirecting",
            reason: "no authentication",
          });
          router.push("/");
          return;
        }

        setIsLoading(false);
      };

      checkAuth();
    }, [isAuthenticated, tokens, router]);

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    // If authenticated, render the protected component
    return <WrappedComponent {...props} />;
  };
}
