// monorepo/web/comiccoin-iam/src/components/withRedirectAuthenticated.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";

/**
 * Higher-Order Component that redirects authenticated users to the dashboard
 * Use this for pages that should only be accessible to non-authenticated users
 * (like login, register, forgot password, etc.)
 *
 * @param {React.ComponentType} Component - The component to wrap
 * @param {Object} options - Configuration options
 * @param {string} options.redirectTo - The path to redirect to if authenticated (default: "/dashboard")
 * @returns {React.ComponentType} - The wrapped component with redirect logic
 */
function withRedirectAuthenticated(Component, options = {}) {
  const { redirectTo = "/dashboard" } = options;

  function WithRedirectAuthenticated(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isLoading } = useAuth();

    console.log("🔒 withRedirectAuthenticated HOC running", {
      isAuthenticated,
      isLoading,
      path: location.pathname,
    });

    useEffect(() => {
      // Only redirect if:
      // 1. Auth check is complete (not loading)
      // 2. User is authenticated
      // 3. We're not already on the target redirect path
      if (!isLoading && isAuthenticated && location.pathname !== redirectTo) {
        console.log(
          `🔄 User already authenticated, redirecting to ${redirectTo}`,
        );
        navigate(redirectTo);
      }
    }, [isAuthenticated, isLoading, navigate, location.pathname]);

    // If still loading auth state, could show a loading spinner here
    // For now, we'll just render the component normally

    // Only render the wrapped component if user is not authenticated
    // Alternatively, you could always render it, and let the useEffect handle redirection
    return !isAuthenticated || isLoading ? <Component {...props} /> : null;
  }

  // Set a display name for easier debugging
  const displayName = Component.displayName || Component.name || "Component";
  WithRedirectAuthenticated.displayName = `withRedirectAuthenticated(${displayName})`;

  return WithRedirectAuthenticated;
}

export default withRedirectAuthenticated;
