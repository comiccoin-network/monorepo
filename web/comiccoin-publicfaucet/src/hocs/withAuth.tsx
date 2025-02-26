import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../services/authService';
import { useMe } from '../hooks/useMe';
import { User } from '../services/userService';

// Create a type for the HOC to improve type safety
type WithAuthProps = {
  isAuthenticated: boolean;
  user?: User | null; // Optional user prop
};

/**
 * Higher-Order Component to handle authentication and route protection
 * @param WrappedComponent - The component to wrap with authentication
 * @returns A new component that checks authentication status
 */
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithAuthProps>
) => {
  // Create a new component that wraps the original
  const AuthWrapper: React.FC<P> = (props) => {
    const navigate = useNavigate();
    const { user, isLoading } = useMe();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const isMountedRef = useRef<boolean>(true);

    // Authentication check effect - runs only once on mount
    useEffect(() => {
      isMountedRef.current = true;

      const checkAuthStatus = () => {
        try {
          console.log("🔒 AUTH CHECK: Verifying user authentication");

          const authenticated = authService.isAuthenticated();

          if (isMountedRef.current) {
            setIsAuthenticated(authenticated);
          }

          // Redirect logic if not authenticated
          if (!authenticated && !isLoading) {
            console.log("⚠️ AUTH CHECK: User is not authenticated, redirecting to login");
            navigate('/get-started');
          } else if (authenticated) {
            console.log("✅ AUTH CHECK: User is authenticated");
          }
        } catch (error) {
          console.error("❌ AUTH CHECK: Error checking authentication", error);

          if (isMountedRef.current) {
            setIsAuthenticated(false);
          }

          navigate('/get-started');
        }
      };

      // Initial check
      checkAuthStatus();

      // Cleanup function to prevent state updates after unmount
      return () => {
        isMountedRef.current = false;
      };
    }, [navigate, isLoading]); // Only includes required dependencies

    // Show loading state while checking auth
    if (isLoading) {
      return (
        <div className="min-h-screen bg-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your account...</p>
          </div>
        </div>
      );
    }

    // Render wrapped component with authentication status and user
    return (
      <WrappedComponent
        {...props}
        isAuthenticated={isAuthenticated}
        user={user}
      />
    );
  };

  // Display name for debugging
  const wrappedComponentName =
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Component';

  AuthWrapper.displayName = `withAuth(${wrappedComponentName})`;

  return AuthWrapper;
};

export default withAuth;
