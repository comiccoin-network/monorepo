// monorepo/native/mobile/comiccoin-wallet/src/services/blockdata/BlockDataViaHeaderNumberService.ts
import axios, { AxiosInstance, AxiosError } from "axios";
import config from "../../../config";

// Define interfaces for our response data
interface BlockData {
  // Add specific block data properties here
  // This is a placeholder - replace with actual block data structure
  [key: string]: any;
}

interface ApiError {
  message: string;
  // Add other error properties as needed
}

class BlockDataViaHeaderNumberService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.AUTHORITY_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Fetches block data for a specific block header number
   * @param headerNumber - The block header number to fetch
   * @returns Promise resolving to block data
   * @throws Error if the request fails or validation fails
   */
  async getBlockDataByHeaderNumber(
    headerNumber: string | number,
  ): Promise<BlockData> {
    // Validate header number before making the request
    if (!this.validateHeaderNumber(headerNumber)) {
      throw new Error("Invalid block header number");
    }

    try {
      const response = await this.client.get<BlockData>(
        `/api/v1/blockdata-via-header-number/${headerNumber}`,
      );
      return response.data;
    } catch (error) {
      // Type guard to check if error is AxiosError
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>;

        if (axiosError.response) {
          // Server responded with error
          const errorMessage =
            axiosError.response.data?.message || axiosError.message;
          throw new Error(`Failed to fetch block data: ${errorMessage}`);
        } else if (axiosError.request) {
          // Request made but no response received
          throw new Error("No response received from server");
        }
      }
      // Generic error handling
      throw new Error(`Error fetching block data: ${(error as Error).message}`);
    }
  }

  /**
   * Validates the block header number format
   * @param headerNumber - The block header number to validate
   * @returns True if valid, false otherwise
   */
  private validateHeaderNumber(headerNumber: string | number): boolean {
    const num = Number(headerNumber);
    return !isNaN(num) && num >= 0 && Number.isInteger(num);
  }
}

// Create and export a singleton instance
const blockDataViaHeaderNumberService = new BlockDataViaHeaderNumberService();
export default blockDataViaHeaderNumberService;

// Export the class itself for testing purposes
export { BlockDataViaHeaderNumberService };
