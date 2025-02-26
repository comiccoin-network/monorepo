// File: github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hocs/withAuth.ts
"use client";

import React, { ComponentType, useEffect } from "react";
import { useRouter } from "next/navigation";

// Create a separate loading component as a function returning an element
function AuthLoadingScreen(): React.JSX.Element {
  return React.createElement(
    "div",
    {
      className: "min-h-screen bg-purple-50 flex items-center justify-center",
    },
    React.createElement("div", { className: "text-center" }, [
      React.createElement("div", {
        key: "spinner",
        className:
          "animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto",
      }),
      React.createElement(
        "p",
        {
          key: "text",
          className: "mt-4 text-gray-600",
        },
        "Loading your account...",
      ),
    ]),
  );
}

/**
 * Higher-Order Component for client-side authentication protection
 * @param WrappedComponent - Component to be protected
 * @returns Protected component that checks for authentication
 */
export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  function AuthProtectedComponent(props: P) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = React.useState<
      boolean | null
    >(null);

    useEffect(() => {
      // Use try-catch for more robust localStorage handling
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

    // If authentication status is not yet determined, show loading
    if (isAuthenticated === null) {
      return AuthLoadingScreen();
    }

    // If not authenticated, render nothing
    if (isAuthenticated === false) {
      return null;
    }

    // Render the wrapped component if authenticated
    return React.createElement(WrappedComponent, props);
  }

  // Set a display name for better debugging
  AuthProtectedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AuthProtectedComponent;
}
