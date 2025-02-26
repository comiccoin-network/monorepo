import axios from 'axios';

// This interface defines the expected response from the API
export interface AuthUrlResponse {
  auth_url: string;
  state: string;
  expires_at: number;
}

// Parameters for the authorization request
export interface AuthorizationParams {
  redirectUri?: string;
  scope?: string;
}

class AuthorizationService {
  private readonly baseUrl: string;

  constructor() {
    // Use Vite environment variables
    const apiProtocol = import.meta.env.VITE_API_PROTOCOL || 'https';
    const apiDomain = import.meta.env.VITE_API_DOMAIN;

    if (!apiDomain) {
      console.error('API domain is not configured properly in environment variables.');
    }

    this.baseUrl = `${apiProtocol}://${apiDomain}`;

    console.log("🎯 Authorization Service Initialized", {
      baseUrl: this.baseUrl,
      protocol: apiProtocol,
      domain: apiDomain,
    });
  }

  /**
   * Fetch the authorization URL from the API
   * @param redirectUri - The URI to redirect to after authorization
   * @param scope - The scope of authorization
   * @returns Promise resolving to the authorization URL response
   */
  public async getAuthorizationUrl(
    redirectUri: string = "",
    scope: string = ""
  ): Promise<AuthUrlResponse> {
    console.log("🚀 Starting Authorization URL Request", {
      redirectUri,
      scope,
    });

    try {
      // Create URLSearchParams for the request parameters
      const urlParams = new URLSearchParams();
      if (redirectUri) urlParams.append("redirect_uri", redirectUri);
      if (scope) urlParams.append("scope", scope);

      // Construct the full URL with parameters
      const apiUrl = `${this.baseUrl}/publicfaucet/api/v1/oauth/authorize`;

      console.log("📤 Sending Request", {
        url: apiUrl,
        method: "GET",
        params: {
          redirect_uri: redirectUri,
          scope: scope,
        },
      });

      const response = await axios.get<AuthUrlResponse>(apiUrl, {
        params: {
          redirect_uri: redirectUri,
          scope: scope,
        },
        headers: {
          Accept: "application/json",
        },
      });

      console.log("📥 Response Status:", {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      console.log("✅ Authorization URL Received:", {
        authUrl: response.data.auth_url,
        state: response.data.state,
        expiresAt: new Date(response.data.expires_at * 1000).toLocaleString(),
      });

      return response.data;
    } catch (err) {
      console.log("💥 Error Details:", {
        error: err,
        message: err instanceof Error ? err.message : "Unknown error",
        response: axios.isAxiosError(err) ? err.response?.data : undefined,
      });

      throw err instanceof Error ? err : new Error("An unknown error occurred");
    }
  }
}

// Export as singleton
export const authorizationService = new AuthorizationService();
export default authorizationService;
