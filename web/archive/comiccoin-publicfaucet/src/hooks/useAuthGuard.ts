"use client";

import React, { ComponentType, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook-based authentication guard
 * @returns Boolean indicating if user is authenticated
 */
export function useAuthGuard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  useEffect(() => {
    try {
      // Retrieve tokens directly from localStorage
      const tokens = JSON.parse(localStorage.getItem("auth_tokens") || "{}");

      // Check if access token is missing
      if (!tokens.accessToken) {
        // Redirect to get-started page
        router.push("/get-started");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      router.push("/get-started");
      setIsAuthenticated(false);
    }
  }, [router]);

  return isAuthenticated;
}
