import { useState, useCallback } from 'react';
import { User } from '../services/userService';
import { authService } from '../services/authService';

/**
 * Interface for the data required to update a user's profile
 * Matches the backend API's expected input format
 */
export interface UpdateMeRequestDTO {
  federatedidentity_id?: string;
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  country?: string | null;
  timezone: string;
  wallet_address?: string;
}

/**
 * Return type for the usePutUpdateMe hook
 * Provides methods and states for managing profile updates
 */
export interface UsePutUpdateMeReturn {
  updateMe: (data: UpdateMeRequestDTO) => Promise<User>;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  reset: () => void;
}

/**
 * Custom hook for updating user profile information
 *
 * @returns An object containing update function, loading state,
 * error state, success state, and reset function
 */
export function usePutUpdateMe(): UsePutUpdateMeReturn {
  // State management for the update process
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset the hook's state to initial values
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  // Main function to update user profile
  const updateMe = useCallback(
    async (data: UpdateMeRequestDTO): Promise<User> => {
      try {
        console.log("🔄 UPDATE PROFILE: Starting update process", {
          email: data.email,
        });

        // Reset states before starting the update
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        // Remove any null or undefined values to avoid sending them to the API
        const cleanData = Object.entries(data).reduce(
          (acc, [key, value]) => {
            if (value !== null && value !== undefined) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, any>,
        );

        console.log("📡 UPDATE PROFILE: Calling API");

        // Use the authenticated Axios instance from authService
        const api = authService.getAuthenticatedApi();
        const response = await api.put<User>(
          '/publicfaucet/api/v1/me',
          cleanData
        );

        console.log("✅ UPDATE PROFILE: Success", {
          email: response.data.email,
        });

        // Update states to reflect successful update
        setIsSuccess(true);
        setError(null);

        return response.data;
      } catch (err) {
        console.error("❌ UPDATE PROFILE: Error occurred", err);

        // Standardize error handling
        const error = err instanceof Error
          ? err
          : new Error("Failed to update profile");

        setError(error);
        setIsSuccess(false);

        throw error;
      } finally {
        // Ensure loading state is reset
        setIsLoading(false);
      }
    },
    [], // No dependencies needed as we're using authService
  );

  // Return hook interface
  return {
    updateMe,
    isLoading,
    error,
    isSuccess,
    reset,
  };
}

// Example usage in a component
/*
import { usePutUpdateMe } from './usePutUpdateMe';
import { useGetMe } from './useGetMe';

function ProfileForm() {
  const { user, refetch } = useGetMe();
  const { updateMe, isLoading, error, isSuccess } = usePutUpdateMe();

  const handleSubmit = async (formData) => {
    try {
      await updateMe({
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        country: formData.country,
        timezone: formData.timezone,
      });

      // Refresh user data after successful update
      await refetch();

      // Handle success (e.g., show success message)
    } catch (updateError) {
      // Handle error (already tracked in the hook's error state)
      console.error('Profile update failed', updateError);
    }
  };

  // Render form with user data and submission handler
  return (
    // Your form implementation
  );
}
*/
