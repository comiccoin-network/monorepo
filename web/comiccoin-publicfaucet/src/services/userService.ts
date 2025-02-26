import authService from './authService';

// User model based on API response
export interface User {
  federatedidentity_id: string;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  lexical_name: string;
  phone?: string;
  country?: string;
  timezone: string;
  wallet_address: string | null; // This is a string, not an object
}

class UserService {
  private readonly api;

  constructor() {
    // Get the pre-configured axios instance with auth interceptors
    this.api = authService.getAuthenticatedApi();
  }

  /**
   * Fetch the current user's profile
   * @param shouldSyncNow - Whether to force a sync with the identity provider
   * @returns Promise resolving to the user data
   */
  public async getMe(shouldSyncNow: boolean = false): Promise<User> {
    try {
      console.log("👤 USER SERVICE: Fetching profile", {
        shouldSyncNow,
      });

      // Build query params for the request
      const params = new URLSearchParams();
      if (shouldSyncNow) {
        params.append("should_sync_now", "true");
      }

      // Make the API request
      const response = await this.api.get<User>(
        `/publicfaucet/api/v1/me${shouldSyncNow ? `?${params.toString()}` : ''}`
      );

      console.log("✅ USER SERVICE: Profile fetch successful", {
        email: response.data.email,
        hasWallet: typeof response.data.wallet_address === "string",
      });

      return response.data;
    } catch (error) {
      console.error("❌ USER SERVICE: Failed to fetch profile", error);
      throw error;
    }
  }

  /**
   * Update user's wallet address
   * @param walletAddress - The wallet address to set
   * @returns Promise resolving to the updated user data
   */
  public async updateWalletAddress(walletAddress: string): Promise<User> {
    try {
      console.log("💼 USER SERVICE: Updating wallet address");

      const response = await this.api.patch<User>('/publicfaucet/api/v1/me', {
        wallet_address: walletAddress
      });

      console.log("✅ USER SERVICE: Wallet address updated successfully");
      return response.data;
    } catch (error) {
      console.error("❌ USER SERVICE: Failed to update wallet address", error);
      throw error;
    }
  }
}

// Export as singleton
export const userService = new UserService();
export default userService;
