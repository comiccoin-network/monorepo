// File: github.com/comiccoin-network/monorepo/web/comiccoin-publicfaucet/src/utils/tokenStorage.ts

/**
 * Token storage utility for managing access and refresh tokens in the browser
 * This utility ensures type safety, provides encryption-like obfuscation,
 * and handles token management on the client side
 */
export const TokenStorage = {
  // Storage keys for access and refresh tokens
  STORAGE_KEY_ACCESS: 'app_auth_access_token_v1',
  STORAGE_KEY_REFRESH: 'app_auth_refresh_token_v1',

  /**
   * Set the access token in local storage
   * @param token - The access token to store
   */
  setAccessToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Basic obfuscation: encode the token before storing
        const encodedToken = btoa(token);
        localStorage.setItem(this.STORAGE_KEY_ACCESS, encodedToken);
      } catch (error) {
        console.error('Error setting access token:', error);
      }
    }
  },

  /**
   * Set the refresh token in local storage
   * @param token - The refresh token to store
   */
  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Basic obfuscation: encode the token before storing
        const encodedToken = btoa(token);
        localStorage.setItem(this.STORAGE_KEY_REFRESH, encodedToken);
      } catch (error) {
        console.error('Error setting refresh token:', error);
      }
    }
  },

  /**
   * Retrieve the access token from local storage
   * @returns The decoded access token or null
   */
  getAccessToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const encodedToken = localStorage.getItem(this.STORAGE_KEY_ACCESS);
        return encodedToken ? atob(encodedToken) : null;
      } catch (error) {
        console.error('Error getting access token:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Retrieve the refresh token from local storage
   * @returns The decoded refresh token or null
   */
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const encodedToken = localStorage.getItem(this.STORAGE_KEY_REFRESH);
        return encodedToken ? atob(encodedToken) : null;
      } catch (error) {
        console.error('Error getting refresh token:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Remove both access and refresh tokens from local storage
   */
  clearTokens(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(this.STORAGE_KEY_ACCESS);
        localStorage.removeItem(this.STORAGE_KEY_REFRESH);
      } catch (error) {
        console.error('Error clearing tokens:', error);
      }
    }
  },

  /**
   * Check if tokens exist in local storage
   * @returns Boolean indicating if both tokens are present
   */
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
};

export default TokenStorage;
