import React, { ComponentType, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import authService from "../services/authService";

// Create a separate loading component for better organization
const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading your account...</p>
      </div>
    </div>
  );
};

interface WithAuthOptions {
  redirectTo?: string;
  checkInterval?: number;
}

/**
 * Higher-Order Component for client-side authentication protection
 * @param WrappedComponent - Component to be protected
 * @param options - Configuration options
 * @returns Protected component that checks for authentication
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  // Default options
  const {
    redirectTo = "/get-started",
    checkInterval = 0,
  } = options;

  // Create the protected component
  function AuthProtectedComponent(props: P) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    // Function to check authentication status
    const checkAuth = useCallback(() => {
      try {
        // Use our authService to check authentication
        const isAuthed = authService.isAuthenticated();

        if (!isAuthed) {
          console.log("🔒 AUTH HOC: Not authenticated, redirecting");
          navigate(redirectTo, { replace: true });
          setIsAuthenticated(false);
        } else {
          if (isAuthenticated !== true) {
            console.log("🔓 AUTH HOC: User is authenticated");
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("❌ AUTH HOC: Authentication check failed:", error);
        navigate(redirectTo, { replace: true });
        setIsAuthenticated(false);
      }
    }, [navigate, isAuthenticated]);

    // Initial authentication check
    useEffect(() => {
      checkAuth();
    }, [checkAuth]);

    // Optional periodic authentication check
    useEffect(() => {
      if (checkInterval > 0) {
        const intervalId = setInterval(checkAuth, checkInterval);
        return () => clearInterval(intervalId);
      }
    }, [checkAuth, checkInterval]);

    // If authentication status is not yet determined, show loading
    if (isAuthenticated === null) {
      return <AuthLoadingScreen />;
    }

    // If not authenticated, render nothing as we're redirecting
    if (isAuthenticated === false) {
      return null;
    }

    // Render the wrapped component if authenticated
    return <WrappedComponent {...props} />;
  }

  // Set a display name for better debugging
  const wrappedComponentName =
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    "Component";

  AuthProtectedComponent.displayName = `withAuth(${wrappedComponentName})`;

  return AuthProtectedComponent;
}

export default withAuth;
