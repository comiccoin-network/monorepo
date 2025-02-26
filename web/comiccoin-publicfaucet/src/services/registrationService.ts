import axios from 'axios';

// This interface defines the expected response from the API
export interface RegistrationUrlResponse {
  registration_url: string;
}

class RegistrationService {
  private readonly baseUrl: string;

  constructor() {
    // Use Vite environment variables
    const apiProtocol = import.meta.env.VITE_API_PROTOCOL || 'https';
    const apiDomain = import.meta.env.VITE_API_DOMAIN;

    if (!apiDomain) {
      console.error('API domain is not configured properly in environment variables.');
    }

    this.baseUrl = `${apiProtocol}://${apiDomain}`;

    // Add this temporary debug log
    console.log("API Config:", {
      baseUrl: this.baseUrl,
      protocol: apiProtocol,
      domain: apiDomain,
    });
  }

  /**
   * Fetch the registration URL from the API
   * @returns Promise resolving to the registration URL response
   */
  public async getRegistrationUrl(): Promise<RegistrationUrlResponse> {
    const apiUrl = `${this.baseUrl}/publicfaucet/api/v1/oauth/registration`;
    console.log("Calling API:", apiUrl);

    // Build the URL with success_uri parameter
    const successUri = `${window.location.origin}/register-success`;
    const finalUrl = `${apiUrl}?success_uri=${encodeURIComponent(successUri)}`;

    console.log("Attempting to fetch registration URL:", {
      apiUrl: finalUrl,
    });

    try {
      const response = await axios.get<RegistrationUrlResponse>(finalUrl, {
        headers: {
          "Content-Type": "application/json",
        },
        // No credentials for this endpoint
      });

      console.log("Response received:", {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      console.log("Data received:", response.data);
      return response.data;
    } catch (err) {
      // Log detailed error information
      console.log("Detailed error information:", {
        error: err,
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : "No stack trace available",
        response: axios.isAxiosError(err) ? err.response?.data : undefined,
      });

      throw err instanceof Error ? err : new Error("An unknown error occurred");
    }
  }
}

// Export as singleton
export const registrationService = new RegistrationService();
export default registrationService;
