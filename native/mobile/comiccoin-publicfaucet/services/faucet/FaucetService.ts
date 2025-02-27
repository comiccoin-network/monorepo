// monorepo/native/mobile/comiccoin-publicfaucet/services/faucet/FaucetService.ts
import axios from "axios";
import config from "../../config";

// Type for big.Int values from backend
export type BigIntString = string;

export interface FaucetDTO {
  id: string;
  chain_id: number;
  balance: BigIntString;
  users_count: number;
  total_coins_distributed: BigIntString;
  total_transactions: number;
  distribution_rate_per_day: number;
  total_coins_distributed_today: number;
  total_transactions_today: number;
  created_at?: string;
  last_modified_at?: string;
  daily_coins_reward: number;
}

// Fallback data in case API is unavailable
export const fallbackData: FaucetDTO = {
  id: "fallback-id",
  chain_id: 1,
  balance: "1000000",
  users_count: 1000,
  total_coins_distributed: "500000",
  total_transactions: 15000,
  distribution_rate_per_day: 500,
  total_coins_distributed_today: 250,
  total_transactions_today: 25,
  daily_coins_reward: 2,
};

/**
 * Service class to handle faucet API requests
 */
class FaucetService {
  private readonly baseUrl: string;
  private readonly timeout: number = 15000; // 15-second timeout

  constructor() {
    // Use the config file for the base URL
    this.baseUrl = config.AUTHORITY_API_URL;
  }

  /**
   * Fetch faucet data for a specific chain ID
   *
   * @param chainId - The ID of the blockchain network
   * @returns Promise resolving to faucet data
   */
  public async getFaucetData(chainId: number): Promise<FaucetDTO> {
    console.log(`🔄 Fetching faucet data for chain ID: ${chainId}`);

    if (!this.baseUrl) {
      throw new Error("API configuration is not properly set in config.");
    }

    const apiUrl = `${this.baseUrl}/publicfaucet/api/v1/faucet/${chainId}`;
    console.log(`📡 Connecting to API: ${apiUrl}`);

    try {
      const response = await axios.get<FaucetDTO>(apiUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: this.timeout,
      });

      console.log("✅ Faucet data received:", {
        chainId: response.data.chain_id,
        balance: response.data.balance,
        usersCount: response.data.users_count,
      });

      return response.data;
    } catch (error) {
      console.error("❌ Error fetching faucet data:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          throw new Error("Request timed out. Please try again.");
        }

        // Handle network errors similar to the example service
        if (error.message.includes("Network Error")) {
          throw new Error(
            "Network request failed. Please check your connection.",
          );
        }

        // Try to extract error message from response if available
        if (error.response) {
          try {
            const errorData = error.response.data;
            throw new Error(errorData.message || "Failed to fetch faucet data");
          } catch {
            throw new Error(
              `Failed to fetch faucet data: ${error.response.statusText}`,
            );
          }
        }
      }

      // Rethrow any other errors
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }
}

// Create and export a singleton instance
const faucetService = new FaucetService();
export default faucetService;

// Export the class itself for testing purposes
export { FaucetService };
