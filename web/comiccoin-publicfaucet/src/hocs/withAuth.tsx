import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../services/authService';
import { useMe } from '../hooks/useMe';
import { User } from '../services/userService'; // Assuming you have a User type

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

    // Authentication check effect - runs only once on mount
    useEffect(() => {
      const checkAuthStatus = () => {
        const authenticated = authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        // Redirect logic if not authenticated
        if (!authenticated && !isLoading) {
          navigate('/get-started');
        }
      };

      // Initial check
      checkAuthStatus();
    }, [navigate, isLoading]); // Only includes required dependencies

    // Show loading state while checking auth
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-gray-600">
            Loading authentication...
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

  return AuthWrapper;
};

export default withAuth;
