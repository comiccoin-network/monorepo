// src/hooks/usePutUpdateMe.ts
import { useState, useCallback } from "react";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";
import { API_CONFIG } from "@/config/env";

interface UpdateMeRequestDTO {
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

interface UsePutUpdateMeReturn {
  updateMe: (data: UpdateMeRequestDTO) => Promise<any>;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
  reset: () => void;
}

/**
 * Hook for updating user profile information
 *
 * @returns Object containing update function, loading state, error state, success state, and reset function
 */
export function usePutUpdateMe(): UsePutUpdateMeReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const fetchWithAuth = useAuthenticatedFetch();

  // Reset state
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
  }, []);

  // Update user profile function
  const updateMe = useCallback(
    async (data: UpdateMeRequestDTO): Promise<any> => {
      try {
        console.log("🔄 UPDATE PROFILE: Starting update process", {
          email: data.email,
        });

        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        // Clean up the data before sending to the API
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
        const response = await fetchWithAuth(
          `${API_CONFIG.baseUrl}/publicfaucet/api/v1/me`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(cleanData),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ UPDATE PROFILE: Failed", {
            status: response.status,
            statusText: response.statusText,
            errorData,
          });

          const errorMessage =
            errorData.message ||
            errorData.error ||
            `Failed to update profile: ${response.statusText}`;

          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        console.log("✅ UPDATE PROFILE: Success", {
          email: responseData.email,
        });

        setIsSuccess(true);
        setError(null);
        return responseData;
      } catch (err) {
        console.error("❌ UPDATE PROFILE: Error occurred", err);
        const error =
          err instanceof Error ? err : new Error("Failed to update profile");
        setError(error);
        setIsSuccess(false);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchWithAuth],
  );

  return {
    updateMe,
    isLoading,
    error,
    isSuccess,
    reset,
  };
}

// Example usage:
/*
import { usePutUpdateMe } from '@/hooks/usePutUpdateMe';
import { useMe } from '@/hooks/useMe';

function ProfileForm() {
  const { user, refetch } = useMe();
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
      refetch();

      // Show success message to user

    } catch (error) {
      // Handle error (already tracked in the hook's error state)
    }
  };

  return (
    // Your form JSX here
  );
}
*/
