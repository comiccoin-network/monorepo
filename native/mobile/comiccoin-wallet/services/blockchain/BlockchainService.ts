// monorepo/native/mobile/comiccoin-wallet/services/blockchain/BlockchainService.ts
import config from "../../config";

interface TransactionSignature {
  v: string;
  r: string;
  s: string;
}

interface Transaction {
  id: string;
  timestamp: number;
  fee: number;
  type: string;
  value: number;
  actualValue: number;
  from: string;
  to: string;
  chainId: string;
  tokenId: string | null;
  tokenMetadataURI: string | null;
  tokenNonce: string | null;
  data: string;
  signature: TransactionSignature;
  status: "confirmed" | "pending";
}

// Define the shape of the API response
interface ApiTransaction {
  nonce_string?: string;
  nonce_bytes?: string;
  timestamp: number;
  fee: number;
  type: string;
  value: number;
  from: string;
  to: string;
  chain_id: string;
  token_id_string: string | null;
  token_metadata_uri: string | null;
  token_nonce_string: string | null;
  data_string?: string;
  data?: string;
  v_bytes: string;
  r_bytes: string;
  s_bytes: string;
}

// Define possible error types for better error handling
class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

class ApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

class BlockchainService {
  private readonly BASE_URL: string;
  private readonly defaultHeaders: HeadersInit;

  constructor() {
    // Use the configuration from our config file
    this.BASE_URL = config.AUTHORITY_API_URL;

    this.defaultHeaders = {
      "Content-Type": "application/json",
    };

    // Log the configured URL in development mode
    if (__DEV__) {
      console.log("BlockchainService initialized with URL:", this.BASE_URL);
    }
  }

  /**
   * Fetches transactions for a given wallet address
   * @param address - The wallet address to fetch transactions for
   * @param type - Optional transaction type filter
   * @returns Promise<Transaction[]> - Array of formatted transactions
   * @throws {NetworkError} When network connection fails
   * @throws {ApiError} When API returns an error response
   */
  async fetchWalletTransactions(
    address: string,
    type: string | null = null,
  ): Promise<Transaction[]> {
    try {
      // Log the request parameters in development
      if (__DEV__) {
        console.log("fetchWalletTransactions called with:", {
          address,
          type,
        });
      }

      // Build the URL with query parameters
      const queryParams = new URLSearchParams({
        address: address,
        ...(type && { type }),
      });

      const url = `${this.BASE_URL}/api/v1/block-transactions?${queryParams.toString()}`;

      if (__DEV__) {
        console.log("Fetching from URL:", url);
      }

      // Make the API request
      const response = await fetch(url, {
        method: "GET",
        headers: this.defaultHeaders,
      });

      // Handle non-200 responses
      if (!response.ok) {
        let errorMessage: string;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || "Failed to fetch transactions";
        } catch {
          errorMessage = "Failed to fetch transactions";
        }
        throw new ApiError(errorMessage, response.status);
      }

      // Parse the response
      const data: ApiTransaction[] = await response.json();

      // Transform the API response into our Transaction type
      return this.transformTransactions(data);
    } catch (error) {
      // Handle specific error types
      if (error instanceof ApiError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        error.message === "Network request failed"
      ) {
        throw new NetworkError("Network error - please check your connection");
      }

      // Log unexpected errors in development
      if (__DEV__) {
        console.error("Transaction fetch error:", error);
      }

      // Re-throw as a generic error for unexpected cases
      throw new Error(
        "An unexpected error occurred while fetching transactions",
      );
    }
  }

  /**
   * Transforms API transaction data into our internal Transaction format
   * @param apiTransactions - Raw transaction data from the API
   * @returns Formatted Transaction array
   */
  private transformTransactions(
    apiTransactions: ApiTransaction[],
  ): Transaction[] {
    return apiTransactions.map(
      (tx): Transaction => ({
        id: tx.nonce_string || tx.nonce_bytes || "",
        timestamp: tx.timestamp,
        fee: tx.fee,
        type: tx.type,
        value: tx.value,
        actualValue: tx.value - tx.fee,
        from: tx.from,
        to: tx.to,
        chainId: tx.chain_id,
        tokenId: tx.token_id_string,
        tokenMetadataURI: tx.token_metadata_uri,
        tokenNonce: tx.token_nonce_string,
        data: tx.data_string || tx.data || "",
        signature: {
          v: tx.v_bytes,
          r: tx.r_bytes,
          s: tx.s_bytes,
        },
        status: tx.timestamp ? "confirmed" : "pending",
      }),
    );
  }

  /**
   * Configuration method to update the base URL
   * Useful for switching between environments or testing
   */
  public setBaseUrl(url: string): void {
    if (!url) {
      throw new Error("Base URL cannot be empty");
    }
    this.BASE_URL = url;
  }
}

// Create and export a singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;

// Export types for use in other parts of the application
export type { Transaction, TransactionSignature };
export { NetworkError, ApiError };
