/**
 * hooks/useAuth.js
 *
 * PURPOSE:
 * This file defines a custom React hook called 'useAuth' that provides a simple way
 * for any component in our application to access authentication information and functions.
 * It serves as a bridge between components and the authentication context.
 *
 * WHAT IS A REACT HOOK?
 * React hooks are special functions that start with "use" and allow you to "hook into"
 * React features. They were introduced in React 16.8 to let you use state and other
 * React features without writing class components.
 *
 * WHAT IS THE CONTEXT API?
 * React's Context API provides a way to share values (like user authentication state)
 * between components without having to explicitly pass props through every level of
 * the component tree. It's like creating a global state that specific components
 * can access directly.
 *
 * THE AUTHENTICATION FLOW:
 * 1. The AuthProvider (from AuthContext.jsx) wraps our application and manages all
 *    authentication state and logic (login, logout, token refresh, etc.)
 * 2. This useAuth hook gives components easy access to that authentication logic
 * 3. Components can then do things like check if a user is logged in or trigger a login
 */

// Import the useContext hook from React
// useContext is a built-in React hook for consuming context values
import { useContext } from "react";

// Import the AuthContext from our providers folder
// This is the context that holds all our authentication state and functions
import { AuthContext } from "../providers/AuthContext";

/**
 * Custom hook for accessing authentication context
 *
 * This hook does the following:
 * 1. Uses the useContext hook to access the AuthContext
 * 2. Verifies that the context exists (meaning we're inside an AuthProvider)
 * 3. Returns the entire context object with all authentication data and functions
 *
 * Using this hook lets components easily access:
 * - Current user data
 * - Authentication status
 * - Login and logout functions
 * - Token management functions
 *
 * BENEFITS OF THIS PATTERN:
 * - Simplifies authentication code in components
 * - Ensures consistent access to auth features
 * - Provides better error messages if used incorrectly
 * - Makes refactoring authentication easier (changes in one place)
 *
 * @returns {Object} Authentication context with these key properties:
 *   - user: The current user object or null if not logged in
 *   - isAuthenticated: Boolean indicating if a user is logged in
 *   - isLoading: Boolean indicating if auth is being initialized
 *   - login: Function to authenticate a user
 *   - logout: Function to sign out
 *   - updateUser: Function to update user data
 *   - getAccessToken: Function to get the current access token
 *   - getRefreshToken: Function to get the current refresh token
 *   - isAccessTokenExpired: Function to check if access token is expired
 *   - updateTokens: Function to update authentication tokens
 *
 * Example usage:
 * ```jsx
 * function ProfileButton() {
 *   const { user, logout } = useAuth();
 *
 *   if (!user) return null;
 *
 *   return (
 *     <div>
 *       <span>Welcome, {user.first_name}!</span>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuth = () => {
  // Call useContext with our AuthContext to access the auth context value
  // This gives us everything the AuthProvider is sharing with the application
  const context = useContext(AuthContext);

  // Safety check: Make sure this hook is used within an AuthProvider
  // If context is undefined, it means this hook is being used outside of an AuthProvider
  if (!context) {
    // Throw an error with a helpful message
    // This makes debugging easier by pinpointing the issue immediately
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Return the context which contains all auth state and functions
  // This includes user data, authentication status, and auth methods
  return context;
};

// Export the hook as a default export for convenience
// This allows importing it with: import useAuth from './hooks/useAuth'
export default useAuth;
