import { useState, useEffect, useCallback } from "react";
import registrationService from "../services/registrationService";

// This interface defines what our hook will return to components
interface UseRegistrationUrlReturn {
  registrationUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage the OAuth registration URL
 * @returns Object containing registration URL, loading state, error state, and refetch function
 */
export function useRegistrationUrl(): UseRegistrationUrlReturn {
  // State for storing the URL and handling loading/error states
  const [registrationUrl, setRegistrationUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Define the fetch function that will get the registration URL
  const fetchRegistrationUrl = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await registrationService.getRegistrationUrl();
      setRegistrationUrl(data.registration_url);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      setRegistrationUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch the registration URL when the hook is first used
  useEffect(() => {
    fetchRegistrationUrl();
  }, [fetchRegistrationUrl]);

  // Return the current state and refetch function
  return {
    registrationUrl,
    isLoading,
    error,
    refetch: fetchRegistrationUrl,
  };
}

export default useRegistrationUrl;
