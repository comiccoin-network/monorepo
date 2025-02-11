// src/hooks/useRegistrationUrl.ts
import { useState, useEffect, useCallback } from "react";

// Define the API response structure to match the backend
interface RegistrationUrlResponse {
  registration_url: string;
  state: string;
  expires_at: number;
}

// Define what our hook will return to components
interface UseRegistrationUrlReturn {
  // The URL where users can register
  registrationUrl: string | null;
  // The state parameter for OAuth security
  state: string | null;
  // Timestamp when the URL expires
  expiresAt: number | null;
  // Loading state for UI feedback
  isLoading: boolean;
  // Error state for handling failures
  error: Error | null;
  // Function to manually refresh the URL
  refetch: () => Promise<void>;
}

export function useRegistrationUrl(): UseRegistrationUrlReturn {
  // State for storing the registration URL and related data
  const [registrationUrl, setRegistrationUrl] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  // UI states for loading and error handling
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Get API configuration from environment variables
  const apiProtocol = process.env.NEXT_PUBLIC_API_PROTOCOL || "http";
  const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || "localhost";
  const apiUrl = `${apiProtocol}://${apiDomain}/api/oauth/registration`;

  // Define the fetch function using useCallback to maintain reference stability
  const fetchRegistrationUrl = useCallback(async () => {
    // Reset states at the start of each fetch
    setIsLoading(true);
    setError(null);

    try {
      // Make the API request
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add any additional headers your API requires
        },
        // Add credentials if your API requires authentication
        // credentials: 'include',
      });

      // Handle non-200 responses
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the response
      const data: RegistrationUrlResponse = await response.json();

      // Update all states with the new data
      setRegistrationUrl(data.registration_url);
      setState(data.state);
      setExpiresAt(data.expires_at);
    } catch (err) {
      // Handle any errors that occurred during the fetch
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred"),
      );

      // Clear existing data on error
      setRegistrationUrl(null);
      setState(null);
      setExpiresAt(null);
    } finally {
      // Always mark loading as complete
      setIsLoading(false);
    }
  }, [apiUrl]); // Only recreate if apiUrl changes

  // Fetch data when the hook is first used
  useEffect(() => {
    fetchRegistrationUrl();

    // Optional: Set up automatic refetch when URL expires
    if (expiresAt) {
      const timeUntilExpiry = expiresAt * 1000 - Date.now();
      if (timeUntilExpiry > 0) {
        const timer = setTimeout(() => {
          fetchRegistrationUrl();
        }, timeUntilExpiry);

        // Clean up timer if component unmounts
        return () => clearTimeout(timer);
      }
    }
  }, [fetchRegistrationUrl, expiresAt]);

  // Return all necessary data and functions
  return {
    registrationUrl,
    state,
    expiresAt,
    isLoading,
    error,
    refetch: fetchRegistrationUrl,
  };
}
