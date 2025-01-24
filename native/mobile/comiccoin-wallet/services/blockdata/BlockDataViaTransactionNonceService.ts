// monorepo/native/mobile/comiccoin-wallet/src/services/blockdata/BlockDataViaTransactionNonceService.ts
import axios, { AxiosInstance, AxiosError } from "axios";
import config from "../../../config";

// Define interfaces for our response data
interface BlockData {
  // Add specific block data properties here based on your API response
  // This is a placeholder - replace with actual block data structure
  [key: string]: any;
}

interface ApiError {
  message: string;
  // Add other error properties that your API might return
  code?: string;
  details?: string;
}

class BlockDataViaTransactionNonceService {
  private client: AxiosInstance;

  constructor() {
    // Initialize axios with configuration from our config file
    this.client = axios.create({
      baseURL: config.AUTHORITY_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Fetches block data for a specific transaction nonce
   * @param transactionNonce - The transaction nonce to fetch block data for
   * @returns Promise resolving to block data
   * @throws Error if the request fails or validation fails
   */
  async getBlockDataByTransactionNonce(
    transactionNonce: string | number,
  ): Promise<BlockData> {
    // Validate the transaction nonce before making the request
    if (!this.validateTransactionNonce(transactionNonce)) {
      throw new Error("Invalid transaction nonce");
    }

    try {
      // Make the API request with proper typing
      const response = await this.client.get<BlockData>(
        `/api/v1/blockdata-via-tx-nonce/${transactionNonce}`,
      );

      return response.data;
    } catch (error) {
      // Use type guard to handle Axios errors with proper typing
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response) {
          // Server responded with an error status code
          const errorMessage =
            axiosError.response.data?.message || axiosError.message;
          throw new Error(`Failed to fetch block data: ${errorMessage}`);
        } else if (axiosError.request) {
          // Request was made but no response received (network error)
          throw new Error("No response received from server");
        }
      }
      // Handle any other types of errors
      throw new Error(`Error fetching block data: ${(error as Error).message}`);
    }
  }

  /**
   * Validates the transaction nonce format
   * @param transactionNonce - The transaction nonce to validate
   * @returns True if valid, false otherwise
   */
  private validateTransactionNonce(transactionNonce: string | number): boolean {
    const num = Number(transactionNonce);
    // Ensure the nonce is a non-negative integer
    return !isNaN(num) && num >= 0 && Number.isInteger(num);
  }
}

// Create and export a singleton instance
const blockDataViaTransactionNonceService =
  new BlockDataViaTransactionNonceService();
export default blockDataViaTransactionNonceService;

// Export the class itself for testing purposes
export { BlockDataViaTransactionNonceService };
