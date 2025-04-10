// monorepo/web/comiccoin-iam/src/components/withRedirectAuthenticated.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { USER_ROLE } from "../hooks/useUser"; // Import the USER_ROLE constants

/**
 * Higher-Order Component that redirects authenticated users based on their role
 * Use this for pages that should only be accessible to non-authenticated users
 * (like login, register, forgot password, etc.)
 *
 * @param {React.ComponentType} Component - The component to wrap
 * @param {Object} options - Configuration options
 * @param {string} options.userRedirectTo - The path to redirect regular users to (default: "/dashboard")
 * @param {string} options.adminRedirectTo - The path to redirect admin users to (default: "/admin/dashboard")
 * @returns {React.ComponentType} - The wrapped component with redirect logic
 */
function withRedirectAuthenticated(Component, options = {}) {
  const {
    userRedirectTo = "/dashboard",
    adminRedirectTo = "/admin/dashboard",
  } = options;

  function WithRedirectAuthenticated(props) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isLoading, user } = useAuth();

    console.log("🔒 withRedirectAuthenticated HOC running", {
      isAuthenticated,
      isLoading,
      userRole: user?.role,
      path: location.pathname,
    });

    useEffect(() => {
      // Only redirect if:
      // 1. Auth check is complete (not loading)
      // 2. User is authenticated
      if (!isLoading && isAuthenticated && user) {
        // Determine redirect path based on user role
        const redirectTo =
          user.role === USER_ROLE.ROOT ? adminRedirectTo : userRedirectTo;

        // Only redirect if we're not already on the target path
        if (location.pathname !== redirectTo) {
          console.log(
            `🔄 User authenticated as ${user.role === USER_ROLE.ROOT ? "admin" : "regular user"}, redirecting to ${redirectTo}`,
          );
          navigate(redirectTo);
        }
      }
    }, [isAuthenticated, isLoading, navigate, location.pathname, user]);

    // Only render the wrapped component if user is not authenticated
    // or if we're still loading auth state
    return !isAuthenticated || isLoading ? <Component {...props} /> : null;
  }

  // Set a display name for easier debugging
  const displayName = Component.displayName || Component.name || "Component";
  WithRedirectAuthenticated.displayName = `withRedirectAuthenticated(${displayName})`;

  return WithRedirectAuthenticated;
}

export default withRedirectAuthenticated;
