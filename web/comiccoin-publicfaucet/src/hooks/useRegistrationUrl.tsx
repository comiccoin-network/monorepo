// src/hooks/useRegistrationUrl.ts
import { useState, useEffect, useCallback } from "react";

// This interface defines the expected response from the API
interface RegistrationUrlResponse {
  registration_url: string;
}

// This interface defines what our hook will return to components
interface UseRegistrationUrlReturn {
  registrationUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRegistrationUrl(): UseRegistrationUrlReturn {
  // State for storing the URL and handling loading/error states
  const [registrationUrl, setRegistrationUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Get API configuration from environment variables
  const apiProtocol = process.env.NEXT_PUBLIC_API_PROTOCOL || "http";
  const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || "localhost";
  const apiUrl = `${apiProtocol}://${apiDomain}/api/oauth/registration`;

  // Define the fetch function that will get the registration URL
  const fetchRegistrationUrl = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RegistrationUrlResponse = await response.json();
      setRegistrationUrl(data.registration_url);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred"),
      );
      setRegistrationUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

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
