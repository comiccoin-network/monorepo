// src/services/claimCoinsService.ts
import authService from "../services/authService";

// Define the User type which is returned by the API
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
  wallet_address: string | null;
}

/**
 * Service for claiming coins through the API
 */
class ClaimCoinsService {
  /**
   * Claims coins for the authenticated user
   * @returns The updated user data after claiming coins
   * @throws Error if the API request fails
   */
  public async claimCoins(): Promise<User> {
    try {
      console.log("🪙 CLAIMING COINS: Starting claim process");

      // Get the authenticated API instance from authService
      const api = authService.getAuthenticatedApi();

      // Make the API request
      const response = await api.post<User>(
        '/publicfaucet/api/v1/claim-coins'
      );

      console.log("✅ CLAIMING COINS: Successfully claimed coins");
      return response.data;
    } catch (error) {
      console.error("❌ CLAIMING COINS: Failed to claim coins", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to claim coins");
    }
  }
}

// Export as singleton
export const claimCoinsService = new ClaimCoinsService();
export default claimCoinsService;
