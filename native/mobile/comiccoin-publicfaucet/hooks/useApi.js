// src/hooks/useApi.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient, { publicEndpoint } from "../api/axiosClient";
import { useAuth } from "./useAuth";

// Hook for public API endpoints (no authentication required)
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

// Hook for private API endpoints (authentication required)
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
          // Our interceptor already handles clearing tokens,
          // but we should update our auth state
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

// Hook for private mutations (POST, PUT, DELETE)
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
