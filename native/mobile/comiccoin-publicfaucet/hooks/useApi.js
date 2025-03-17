/**
 * hooks/useApi.js
 *
 * PURPOSE:
 * This file defines custom React hooks for making API calls in a clean, consistent way.
 * It creates an abstraction layer between your UI components and the actual API requests,
 * handling common concerns like authentication, caching, error handling, and loading states.
 *
 * WHAT ARE REACT HOOKS?
 * Hooks are JavaScript functions that "hook into" React features. They let you use state
 * and other React features without writing a class component. Custom hooks (like these)
 * let you extract component logic into reusable functions.
 *
 * WHAT IS REACT QUERY?
 * React Query (@tanstack/react-query) is a library for managing server state in React.
 * It handles caching, background updates, and stale data in a way that both improves
 * user experience and reduces unnecessary network requests. It's particularly powerful
 * for data fetching, providing utilities to track loading states, cache results,
 * handle errors, and much more.
 */

// Import hooks from React Query for data fetching
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Import our custom axios client and a helper for public endpoints
import axiosClient, { publicEndpoint } from "../api/axiosClient";
// Import our authentication hook to access auth state and functions
import { useAuth } from "./useAuth";

/**
 * Hook for public API endpoints that don't require authentication
 *
 * This hook is designed for endpoints that any user can access without being logged in,
 * such as fetching public content, checking app status, or public registration/login endpoints.
 *
 * WHAT IS A QUERY?
 * In React Query terminology, a "query" is a declarative dependency on an asynchronous
 * source of data. Queries are typically used for GET requests that fetch data.
 *
 * @param {Array|string} queryKey - Key for caching and identifying the query
 *                                  This is how React Query knows when to refetch data,
 *                                  which queries to update, etc. It's like a unique ID.
 *
 * @param {string} endpoint - API endpoint path (e.g., "/posts", "/users/1")
 *                           This is appended to the base URL configured in axiosClient.
 *
 * @param {Object} options - Additional options for the query
 *                          These are passed to React Query's useQuery hook and can
 *                          control things like refetch behavior, caching, etc.
 *
 * @returns {Object} Query result including:
 *   - data: The data returned from the API
 *   - isLoading: Boolean indicating if the request is in progress
 *   - error: Any error that occurred
 *   - refetch: Function to manually trigger a refetch
 *   - And other React Query properties
 *
 * Example usage:
 * ```jsx
 * const { data, isLoading, error } = usePublicQuery(['faucet'], '/faucet/1');
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <div>{data.name}</div>;
 * ```
 */
export const usePublicQuery = (queryKey, endpoint, options = {}) => {
  // Return the result of React Query's useQuery hook
  return useQuery({
    // queryKey is used for caching and invalidation
    // It can be a string or an array of values that uniquely identify this query
    queryKey,

    // queryFn defines how to fetch the data
    // This is where we make the actual API request using our axios client
    queryFn: async () => {
      // Make a GET request to the specified endpoint
      // We use publicEndpoint({}) to tell our axios interceptors
      // not to try adding authentication headers
      const response = await axiosClient.get(endpoint, publicEndpoint({}));

      // Return just the data portion of the response
      // This is what will be available as `data` in your component
      return response.data;
    },

    // Spread any additional options provided to the hook
    // This lets callers customize React Query's behavior
    ...options,
  });
};

/**
 * Hook for private API endpoints that require authentication
 *
 * This hook is for endpoints that require the user to be logged in.
 * It handles authentication tokens automatically and redirects to login if auth fails.
 *
 * The key differences from usePublicQuery:
 * 1. It doesn't mark requests as public, so auth headers will be added
 * 2. It handles 401 (Unauthorized) errors by logging the user out
 * 3. It only runs when the user is authenticated
 *
 * @param {Array|string} queryKey - Key for caching and identifying the query
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Additional options for the query
 *
 * @returns {Object} Query result including data, loading state, and error handling
 *
 * Example usage:
 * ```jsx
 * const { data, isLoading } = usePrivateQuery(['dashboard'], '/dashboard');
 * ```
 */
export const usePrivateQuery = (queryKey, endpoint, options = {}) => {
  // Get authentication state and logout function from our auth hook
  const { isAuthenticated, logout } = useAuth();

  // Get the query client to potentially invalidate queries later
  const queryClient = useQueryClient();

  return useQuery({
    // Same queryKey and structure as usePublicQuery
    queryKey,

    // Define how to fetch the data
    queryFn: async () => {
      try {
        // Make a GET request - note we don't use publicEndpoint here
        // so our axios interceptor will automatically add auth headers
        const response = await axiosClient.get(endpoint);
        return response.data;
      } catch (error) {
        // If the error is 401 (Unauthorized), it means the user's session
        // is invalid even after the interceptor tried to refresh the token
        if (error.response?.status === 401) {
          // Log the user out, which will typically redirect to the login screen
          // This happens after the axios interceptor already tried to refresh the token
          // and that refresh also failed
          logout();
        }
        // Re-throw the error so React Query can handle it
        throw error;
      }
    },

    // Only run this query if the user is authenticated
    // This prevents unnecessary API calls and 401 errors when not logged in
    // The options.enabled check allows callers to disable the query for other reasons
    enabled: isAuthenticated && options.enabled !== false,

    // Special comment about React Native and window focus
    // In web apps, React Query would refetch when the browser tab regains focus
    // But since React Native doesn't have window focus events, we need a different approach
    // This would typically be handled by integrating with React Navigation's focus events

    // Custom error handler that runs in addition to throwing the error
    onError: (error) => {
      // If the caller provided their own onError function, call it
      if (options.onError) {
        options.onError(error);
      }
    },

    // Include any other options the caller provided
    ...options,
  });
};

/**
 * Hook for private mutations (POST, PUT, DELETE) that require authentication
 *
 * WHAT IS A MUTATION?
 * In React Query terminology, a "mutation" is an operation that changes data on the server
 * or performs a side effect. Mutations are typically used for POST, PUT, DELETE requests
 * that modify data.
 *
 * This hook:
 * 1. Makes an authenticated request to modify data
 * 2. Handles unauthorized errors by logging the user out
 * 3. Invalidates related queries to refresh their data after the mutation
 *
 * @param {string} endpoint - API endpoint path
 * @param {string} method - HTTP method (post, put, delete, etc.)
 * @param {Object} options - Additional options including:
 *                        - invalidateQueries: Array of query keys to invalidate on success
 *                        - onSuccess: Function to run on successful mutation
 *                        - ...other useMutation options
 *
 * @returns {Object} Mutation result including:
 *  - mutate: Function to trigger the mutation with data
 *  - isLoading: Boolean indicating if the mutation is in progress
 *  - error: Any error that occurred
 *  - And other React Query mutation properties
 *
 * Example usage:
 * ```jsx
 * const { mutate, isLoading } = usePrivateMutation('/update-profile', 'put', {
 *   invalidateQueries: ['user-profile'],
 *   onSuccess: () => showToast('Profile updated!')
 * });
 *
 * // Later, trigger the mutation with data
 * mutate({ name: 'New Name', email: 'new@example.com' });
 * ```
 */
export const usePrivateMutation = (endpoint, method = "post", options = {}) => {
  // Get logout function from auth hook
  const { logout } = useAuth();

  // Get the query client for invalidating queries after mutation
  const queryClient = useQueryClient();

  return useMutation({
    // Define how to perform the mutation
    mutationFn: async (payload) => {
      try {
        // Use the specified HTTP method (post, put, delete) with our axios client
        // The payload is the data to send in the request body
        const response = await axiosClient[method](endpoint, payload);
        return response.data;
      } catch (error) {
        // Handle unauthorized errors by logging out
        if (error.response?.status === 401) {
          logout();
        }
        // Re-throw for React Query to handle
        throw error;
      }
    },

    // Define what happens after a successful mutation
    onSuccess: (data, variables, context) => {
      // If specified, invalidate related queries to refresh their data
      // For example, after creating a new post, we might want to refresh the posts list
      if (options.invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: options.invalidateQueries });
      }

      // If the caller provided their own onSuccess handler, call it
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },

    // Include any other options the caller provided
    ...options,
  });
};
