// hooks/useApi.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient, { publicEndpoint } from "../api/axiosClient";
import { useAuth } from "./useAuth";

/**
 * Hook for public API endpoints that don't require authentication
 *
 * @param {Array|string} queryKey - Key for caching and identifying the query
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Additional options for the query
 * @returns {Object} Query result including data, loading state, and error handling
 */
export const usePublicQuery = (queryKey, endpoint, options = {}) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Mark this as a public endpoint so interceptor doesn't add auth header
      const response = await axiosClient.get(endpoint, publicEndpoint({}));
      return response.data;
    },
    ...options,
  });
};

/**
 * Hook for private API endpoints that require authentication
 *
 * @param {Array|string} queryKey - Key for caching and identifying the query
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Additional options for the query
 * @returns {Object} Query result including data, loading state, and error handling
 */
export const usePrivateQuery = (queryKey, endpoint, options = {}) => {
  const { isAuthenticated, logout } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await axiosClient.get(endpoint);
        return response.data;
      } catch (error) {
        // If the error is still 401 after the interceptor tried to refresh,
        // it means the refresh token also failed
        if (error.response?.status === 401) {
          // Our interceptor handles token refresh, but we'll logout if that fails
          logout();
        }
        throw error;
      }
    },
    // Only run this query if user is authenticated
    enabled: isAuthenticated && options.enabled !== false,
    // React Native doesn't use window focus - we'll use different approach
    // Typically handled by screen focus events in React Navigation
    onError: (error) => {
      if (options.onError) {
        options.onError(error);
      }
    },
    ...options,
  });
};

/**
 * Hook for private mutations (POST, PUT, DELETE) that require authentication
 *
 * @param {string} endpoint - API endpoint path
 * @param {string} method - HTTP method (post, put, delete, etc.)
 * @param {Object} options - Additional options for the mutation
 * @returns {Object} Mutation result including mutate function, loading state, and error handling
 */
export const usePrivateMutation = (endpoint, method = "post", options = {}) => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      try {
        const response = await axiosClient[method](endpoint, payload);
        return response.data;
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
        }
        throw error;
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate queries if specified
      if (options.invalidateQueries) {
        queryClient.invalidateQueries({ queryKey: options.invalidateQueries });
      }

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
};
