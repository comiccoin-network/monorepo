// github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/hooks/useRegistrationUrl.ts
import { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "@/config/env";

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
  // Add this temporary debug log
  console.log("API Config:", {
    baseUrl: API_CONFIG.baseUrl,
    protocol: API_CONFIG.protocol,
    domain: API_CONFIG.domain,
  });

  // State for storing the URL and handling loading/error states
  const [registrationUrl, setRegistrationUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Get API configuration from environment variables
  const apiProtocol = process.env.NEXT_PUBLIC_API_PROTOCOL || "http";
  const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;
  const apiUrl = `${API_CONFIG.baseUrl}/api/oauth/registration`;

  // Define the fetch function that will get the registration URL
  const fetchRegistrationUrl = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Build the URL using your config
    const successUri = `${window.location.origin}/register-success`;
    const finalUrl = `${apiUrl}?success_uri=${encodeURIComponent(successUri)}`;

    console.log("Attempting to fetch registration URL:", {
      finalUrl,
      apiUrl,
      successUri,
    });

    try {
      const response = await fetch(finalUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include", // DO NOT USE THIS HERE! KEEP THIS COMMENT TO REMIND YOU!
      });

      console.log("Response received:", {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data received:", data);
      setRegistrationUrl(data.registration_url);
    } catch (err) {
      console.error("Detailed error information:", {
        error: err,
        message: err.message,
        stack: err.stack,
      });
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
