// monorepo/native/mobile/comiccoin-wallet/src/services/blockdata/BlockDataViaHeaderNumberService.ts
import config from "../../config";

// Define interfaces for our response data
interface BlockData {
  header: {
    number_string: string;
    time_string: string;
    previous_header_hash_string: string;
    merkle_root_hash_string: string;
  };
  trans: Array<any>; // Define specific transaction type if available
  [key: string]: any;
}

interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

class BlockDataViaHeaderNumberService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.AUTHORITY_API_URL;
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
      const response = await fetch(
        `${this.baseURL}/authority/api/v1/blockdata-via-header-number/${headerNumber}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        let errorMessage = "Failed to fetch block data";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If parsing error response fails, use status text
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data: BlockData = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw new Error(
          "Network request failed. Please check your connection.",
        );
      }
      // Rethrow any other errors
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
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
