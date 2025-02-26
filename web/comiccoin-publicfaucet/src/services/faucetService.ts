import axios from 'axios';

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
    // Build the API base URL from Vite environment variables
    const apiProtocol = import.meta.env.VITE_API_PROTOCOL || 'https';
    const apiDomain = import.meta.env.VITE_API_DOMAIN;

    this.baseUrl = `${apiProtocol}://${apiDomain}`;

    if (!apiDomain) {
      console.error("API domain is not configured properly in environment variables.");
    }
  }

  /**
   * Fetch faucet data for a specific chain ID
   *
   * @param chainId - The ID of the blockchain network
   * @returns Promise resolving to faucet data
   */
  public async getFaucetData(chainId: number): Promise<FaucetDTO> {
    console.log(`🔄 Fetching faucet data for chain ID: ${chainId}`);

    // Check internet connection if available in browser environment
    if (typeof navigator !== "undefined" && "onLine" in navigator && !navigator.onLine) {
      throw new Error("You are offline. Please check your internet connection.");
    }

    if (!this.baseUrl || !import.meta.env.VITE_API_DOMAIN) {
      throw new Error("API configuration is not properly set in environment variables.");
    }

    const apiUrl = `${this.baseUrl}/publicfaucet/api/v1/faucet/${chainId}`;
    console.log(`📡 Connecting to API: ${apiUrl}`);

    try {
      const response = await axios.get<FaucetDTO>(apiUrl, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      console.log("✅ Faucet data received:", {
        chainId: response.data.chain_id,
        balance: response.data.balance,
        usersCount: response.data.users_count,
      });

      return response.data;
    } catch (error) {
      console.error("❌ Error fetching faucet data:", error);

      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error("Request timed out. Please try again.");
      }

      throw error;
    }
  }
}

// Export as singleton
export const faucetService = new FaucetService();
export default faucetService;
