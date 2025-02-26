import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Interface for auth tokens storage
 */
export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  federatedidentityID: string | null;
}

/**
 * Interface for token refresh response
 */
interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  federatedidentity_id: string;
}

class AuthService {
  private readonly baseUrl: string;
  private readonly api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    // Use Vite environment variables
    const apiProtocol = import.meta.env.VITE_API_PROTOCOL || 'https';
    const apiDomain = import.meta.env.VITE_API_DOMAIN;

    if (!apiDomain) {
      console.error('API domain is not configured properly in environment variables.');
    }

    this.baseUrl = `${apiProtocol}://${apiDomain}`;

    console.log("🔒 AUTH SERVICE: Initialized", {
      baseUrl: this.baseUrl,
    });

    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Set up request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => this.addTokenToRequest(config),
      (error) => Promise.reject(error)
    );

    // Set up response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => this.handleResponseError(error)
    );
  }

  /**
   * Get the authenticated Axios instance
   * @returns Axios instance with auth interceptors
   */
  public getAuthenticatedApi(): AxiosInstance {
    return this.api;
  }

  /**
   * Save tokens to local storage
   * @param tokens - The tokens to save
   */
  public saveTokens(tokens: AuthTokens): void {
    console.log("💾 AUTH SERVICE: Saving tokens to storage", {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
    });
    localStorage.setItem("auth_tokens", JSON.stringify(tokens));
  }

  /**
   * Get tokens from local storage
   * @returns The tokens from storage or default empty tokens
   */
  public getTokens(): AuthTokens {
    try {
      const storedTokens = localStorage.getItem("auth_tokens");
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens) as AuthTokens;
        console.log("🔍 AUTH SERVICE: Retrieved tokens from storage", {
          hasAccessToken: !!tokens.accessToken,
          hasRefreshToken: !!tokens.refreshToken,
        });
        return tokens;
      }
    } catch (e) {
      console.error("❌ AUTH SERVICE: Error reading tokens from storage", e);
    }

    return {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      federatedidentityID: null,
    };
  }

  /**
   * Clear tokens from local storage
   */
  public clearTokens(): void {
    console.log("🧹 AUTH SERVICE: Clearing tokens from storage");
    localStorage.removeItem("auth_tokens");
  }

  /**
   * Check if user is authenticated
   * @returns True if user has valid tokens
   */
  public isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!tokens.accessToken;
  }

  /**
   * Add token to request config
   * @param config - Axios request config
   * @returns Updated config with auth token
   */
  private addTokenToRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    const tokens = this.getTokens();

    if (tokens.accessToken) {
      // Make sure headers exist
      config.headers = config.headers || {};

      // Add auth token
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      console.log("🔑 AUTH SERVICE: Added token to request", {
        url: config.url,
      });
    } else {
      console.log("⚠️ AUTH SERVICE: No token available for request", {
        url: config.url,
      });
    }

    return config;
  }

  /**
   * Handle response error, including token refresh
   * @param error - Axios error
   * @returns Promise resolving to the original request with new token
   */
  private async handleResponseError(error: AxiosError): Promise<AxiosResponse<any>> {
    const originalRequest = error.config;

    // If error is not 401 or the request already tried after refresh, just throw
    if (error.response?.status !== 401 || (originalRequest as any)._retry) {
      return Promise.reject(error);
    }

    // Mark this request as retried to prevent infinite loops
    (originalRequest as any)._retry = true;

    // If already refreshing, queue this request
    if (this.isRefreshing) {
      console.log("⏳ AUTH SERVICE: Already refreshing, queuing request");
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axios(originalRequest));
        });
      });
    }

    this.isRefreshing = true;

    try {
      console.log("🔄 AUTH SERVICE: Starting token refresh");
      const tokens = this.getTokens();

      if (!tokens.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post<TokenRefreshResponse>(
        `${this.baseUrl}/publicfaucet/api/v1/token/refresh`,
        { refresh_token: tokens.refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log("✅ AUTH SERVICE: Token refresh successful");

      // Update tokens
      const newTokens: AuthTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: response.data.expires_at,
        federatedidentityID: response.data.federatedidentity_id,
      };

      // Save to storage
      this.saveTokens(newTokens);

      // Update Authorization header for original request
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

      // Process any queued requests
      this.refreshSubscribers.forEach(callback => callback(newTokens.accessToken!));
      this.refreshSubscribers = [];

      return axios(originalRequest);
    } catch (refreshError) {
      console.error("❌ AUTH SERVICE: Token refresh failed", refreshError);

      // Clear tokens on refresh failure
      this.clearTokens();

      // Reject all queued requests
      this.refreshSubscribers.forEach(callback => callback(''));
      this.refreshSubscribers = [];

      // Redirect could be handled at the app level by checking auth state
      window.location.href = '/get-started';

      return Promise.reject(refreshError);
    } finally {
      this.isRefreshing = false;
    }
  }
}

// Export as singleton
export const authService = new AuthService();
export default authService;
