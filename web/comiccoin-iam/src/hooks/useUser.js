// src/hooks/useUser.js
import { useState, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import {
  getUserById,
  getUserByEmail,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useListUsers,
  transformUser,
  prepareUserForApi,
  USER_STATUS,
  USER_ROLE,
  PROFILE_VERIFICATION_STATUS,
} from "../api/endpoints/userApi";

/**
 * Custom hook for managing user operations
 */
export function useUser() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Get API hooks
  const { mutateAsync: createUser } = useCreateUser();

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
    setSuccess(false);
  }, []);

  /**
   * Fetch a user by ID
   */
  const fetchUserById = useCallback(
    async (id) => {
      reset();
      setIsLoading(true);

      try {
        console.log("🔄 Fetching user:", id);

        const response = await getUserById(id);
        const user = transformUser(response);

        setSuccess(true);
        return user;
      } catch (err) {
        console.error("❌ Error fetching user:", err);

        const errorMessage = err.message || "Failed to fetch user";
        setError(new Error(errorMessage));

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [reset],
  );

  /**
   * Fetch a user by email
   */
  const fetchUserByEmail = useCallback(
    async (email) => {
      reset();
      setIsLoading(true);

      try {
        console.log("🔄 Fetching user by email:", email);

        const response = await getUserByEmail(email);
        const user = transformUser(response);

        setSuccess(true);
        return user;
      } catch (err) {
        console.error("❌ Error fetching user by email:", err);

        const errorMessage = err.message || "Failed to fetch user";
        setError(new Error(errorMessage));

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [reset],
  );

  /**
   * Create a new user
   */
  const createNewUser = useCallback(
    async (userData) => {
      reset();
      setIsLoading(true);

      try {
        console.log("🔄 Creating user");

        const apiData = prepareUserForApi(userData);
        const response = await createUser(apiData);

        const user = transformUser(response);

        setSuccess(true);
        return user;
      } catch (err) {
        console.error("❌ Error creating user:", err);

        setError(new Error(err.message || "Failed to create user"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [createUser, reset],
  );

  /**
   * Update an existing user
   */
  const updateUser = useCallback(
    async (id, userData) => {
      reset();
      setIsLoading(true);

      try {
        console.log("🔄 Updating user:", id);

        if (!id) {
          throw new Error("ID is required to update a user");
        }

        const apiData = prepareUserForApi(userData);
        console.log("Prepared API data:", apiData);

        // Use direct axios call to ensure consistent behavior
        const response = await axiosClient.put(`/users/${id}`, apiData);
        const user = transformUser(response.data);

        setSuccess(true);
        return user;
      } catch (err) {
        console.error("❌ Error updating user:", err);

        setError(new Error(err.message || "Failed to update user"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [reset],
  );

  /**
   * Delete a user
   */
  const deleteUser = useCallback(
    async (id) => {
      reset();
      setIsLoading(true);

      try {
        console.log("🔄 Deleting user:", id);

        if (!id) {
          throw new Error("ID is required to delete a user");
        }

        await axiosClient.delete(`/users/${id}`);

        setSuccess(true);
        return true;
      } catch (err) {
        console.error("❌ Error deleting user:", err);

        setError(new Error(err.message || "Failed to delete user"));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [reset],
  );

  return {
    fetchUserById,
    fetchUserByEmail,
    createNewUser,
    updateUser,
    deleteUser,
    isLoading,
    error,
    success,
    reset,
    USER_STATUS,
    USER_ROLE,
    PROFILE_VERIFICATION_STATUS,
  };
}

/**
 * Custom hook for listing users with filtering and pagination
 */
export function useUserList(filters = {}, options = {}) {
  const { data, isLoading, error, refetch } = useListUsers(filters, options);

  // Transform the response data
  const users = data?.users ? data.users.map(transformUser) : [];

  // Extract pagination info
  const pagination = {
    totalCount: data?.total_count || 0,
    totalPages: data?.total_pages || 0,
    currentPage: data?.current_page || 1,
    hasNextPage: data?.has_next_page || false,
    hasPrevPage: data?.has_prev_page || false,
    nextPage: data?.next_page,
    previousPage: data?.previous_page,
  };

  // Utility function to get the status class for styling
  const getStatusClass = useCallback((statusCode) => {
    switch (statusCode) {
      case USER_STATUS.ACTIVE:
        return "bg-green-100 text-green-800";
      case USER_STATUS.LOCKED:
        return "bg-red-100 text-red-800";
      case USER_STATUS.ARCHIVED:
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }, []);

  // Utility function to get the status dot class for styling
  const getStatusDotClass = useCallback((statusCode) => {
    switch (statusCode) {
      case USER_STATUS.ACTIVE:
        return "bg-green-500";
      case USER_STATUS.LOCKED:
        return "bg-red-500";
      case USER_STATUS.ARCHIVED:
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  }, []);

  // Utility function to get the role class for styling
  const getRoleClass = useCallback((roleCode) => {
    switch (roleCode) {
      case USER_ROLE.ROOT:
        return "bg-purple-100 text-purple-800";
      case USER_ROLE.COMPANY:
        return "bg-blue-100 text-blue-800";
      case USER_ROLE.INDIVIDUAL:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }, []);

  // Utility function to get verification status class for styling
  const getVerificationStatusClass = useCallback((statusCode) => {
    switch (statusCode) {
      case PROFILE_VERIFICATION_STATUS.APPROVED:
        return "bg-green-100 text-green-800";
      case PROFILE_VERIFICATION_STATUS.SUBMITTED_FOR_REVIEW:
        return "bg-blue-100 text-blue-800";
      case PROFILE_VERIFICATION_STATUS.REJECTED:
        return "bg-red-100 text-red-800";
      case PROFILE_VERIFICATION_STATUS.UNVERIFIED:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  }, []);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  return {
    users,
    pagination,
    isLoading,
    error,
    refetch,
    // Style utilities
    getStatusClass,
    getStatusDotClass,
    getRoleClass,
    getVerificationStatusClass,
    formatDate,
  };
}

// Export constants
export { USER_STATUS, USER_ROLE, PROFILE_VERIFICATION_STATUS };

// Export hooks
export default {
  useUser,
  useUserList,
};
