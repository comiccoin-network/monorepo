// monorepo/native/mobile/comiccoin-wallet/services/transaction/OwnedTokenListService.ts
import config from "../../config";

interface TokenMetadataAttribute {
  display_type: string;
  trait_type: string;
  value: string;
}

interface TokenMetadata {
  image: string;
  external_url: string;
  description: string;
  name: string;
  attributes: TokenMetadataAttribute[];
  background_color: string;
  animation_url?: string;
  youtube_url?: string;
}

interface OwnedTokenTransactionSignature {
  v: string | null;
  r: string;
  s: string;
}

interface OwnedTokenTransaction {
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
  tokenMetadata: TokenMetadata | null;
  tokenNonce: string | null;
  data: string;
  signature: OwnedTokenTransactionSignature;
  status: "confirmed" | "pending";
}

interface ApiOwnedTokenTransaction {
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
  token_metadata?: TokenMetadata;
  token_nonce_string: string | null;
  data_string?: string;
  data?: string;
  v_bytes: string | null;
  r_bytes: string;
  s_bytes: string;
}

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

class OwnedTokenListService {
  private readonly BASE_URL: string;
  private readonly defaultHeaders: HeadersInit;

  constructor() {
    this.BASE_URL = config.AUTHORITY_API_URL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };

    if (__DEV__) {
      console.log("🚀 Service initialized with URL:", this.BASE_URL);
    }
  }

  async fetchWalletTransactions(
    address: string,
    type: string | null = null,
  ): Promise<OwnedTokenTransaction[]> {
    try {
      if (__DEV__) {
        console.log("📞 fetchWalletTransactions called with:", {
          address,
          type,
        });
      }

      // Build the query parameters
      const params = new URLSearchParams();
      params.append("address", address);
      if (type) params.append("type", type);

      const url = `${this.BASE_URL}/authority/api/v1/block-transactions/owned-tokens`;
      const finalUrl = `${url}?${params.toString()}`;

      if (__DEV__) {
        console.log("🌐 Fetching from URL:", finalUrl);
      }

      const response = await fetch(finalUrl, {
        method: "GET",
        headers: this.defaultHeaders,
      });

      if (!response.ok) {
        const text = await response.text();
        console.log("API Response:", {
          status: response.status,
          statusText: response.statusText,
          body: text,
        });

        let errorMessage: string;
        try {
          const errorData = JSON.parse(text);
          errorMessage =
            errorData.message ||
            `Failed to fetch transactions (${response.status})`;
        } catch {
          errorMessage = `Failed to fetch transactions (${response.status}: ${response.statusText})`;
        }
        throw new ApiError(errorMessage, response.status);
      }

      const data: ApiOwnedTokenTransaction[] = await response.json();

      if (__DEV__) {
        console.log("✅ Successfully fetched transactions:", data.length);
      }

      return this.transformOwnedTokenTransactions(data);
    } catch (error) {
      if (__DEV__) {
        console.log("🔥 Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }

      if (error instanceof ApiError) {
        throw error;
      }

      if (
        error instanceof TypeError &&
        error.message === "Network request failed"
      ) {
        throw new NetworkError("Network error - please check your connection");
      }

      throw error;
    }
  }

  private transformOwnedTokenTransactions(
    apiTransactions: ApiOwnedTokenTransaction[],
  ): OwnedTokenTransaction[] {
    if (__DEV__) {
      console.log("🔄 Transforming transactions...");
    }

    return apiTransactions.map(
      (tx): OwnedTokenTransaction => ({
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
        tokenMetadata: tx.token_metadata || null,
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
}

const transactionListService = new OwnedTokenListService();
export default transactionListService;

export type {
  OwnedTokenTransaction,
  OwnedTokenTransactionSignature,
  TokenMetadata,
  TokenMetadataAttribute,
};
export { NetworkError, ApiError };
