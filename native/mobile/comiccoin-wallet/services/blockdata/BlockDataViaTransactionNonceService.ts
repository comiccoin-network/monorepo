// monorepo/native/mobile/comiccoin-wallet/src/services/blockdata/BlockDataViaTransactionNonceService.ts
import config from "../../config";

interface BlockHeader {
  chain_id: number;
  number_bytes: string;
  number_string: string;
  prev_block_hash: string;
  timestamp: number;
  difficulty: number;
  beneficiary: string;
  transaction_fee: number;
  state_root: string;
  trans_root: string;
  nonce_bytes: string;
  nonce_string: string;
  latest_token_id_bytes: string;
  latest_token_id_string: string;
  tokens_root: string;
}

interface Transaction {
  chain_id: number;
  nonce_bytes: string;
  nonce_string: string;
  from: string;
  to: string;
  value: number;
  data: string;
  data_string: string;
  type: "coin" | "token";
  token_id_bytes: string | null;
  token_id_string: string;
  token_metadata_uri: string;
  token_nonce_bytes: string | null;
  token_nonce_string: string;
  v_bytes: string;
  r_bytes: string;
  s_bytes: string;
  timestamp: number;
  fee: number;
}

interface Validator {
  id: string;
  public_key_bytes: string;
}

interface BlockData {
  hash: string;
  header: BlockHeader;
  header_signature_bytes: string;
  trans: Transaction[];
  validator: Validator;
}

interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

class BlockDataViaTransactionNonceService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.AUTHORITY_API_URL;
    console.log("🏗️ BlockDataViaTransactionNonceService initialized:", {
      baseURL: this.baseURL,
    });
  }

  async getBlockDataByTransactionNonce(
    transactionNonce: string | number,
  ): Promise<BlockData> {
    console.log("📤 Fetching block data for transaction:", {
      nonce: transactionNonce,
      timestamp: new Date().toISOString(),
    });

    if (!this.validateTransactionNonce(transactionNonce)) {
      console.error("❌ Invalid transaction nonce:", {
        nonce: transactionNonce,
        type: typeof transactionNonce,
      });
      throw new Error("Invalid transaction nonce");
    }

    const endpoint = `${this.baseURL}/api/v1/blockdata-via-tx-nonce/${transactionNonce}`;
    console.log("🔗 Making API request:", {
      endpoint: endpoint,
      method: "GET",
    });

    try {
      const startTime = performance.now();
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const requestDuration = (performance.now() - startTime).toFixed(2);
      console.log("⏱️ Request completed:", {
        duration: `${requestDuration}ms`,
        status: response.status,
        ok: response.ok,
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch block data";
        try {
          const errorData = await response.json();
          console.error("🚫 API error response:", {
            status: response.status,
            errorData,
            nonce: transactionNonce,
          });
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error("⚠️ Failed to parse error response:", {
            status: response.status,
            statusText: response.statusText,
            parseError,
          });
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data: BlockData = await response.json();

      console.log("✅ Successfully fetched block data:", {
        blockNumber: data.header.number_string,
        timestamp: data.header.time_string,
        transactionsCount: data.trans.length,
        requestDuration: `${requestDuration}ms`,
      });

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        console.error("🌐 Network error:", {
          error: error.message,
          nonce: transactionNonce,
          url: endpoint,
        });
        throw new Error(
          "Network request failed. Please check your connection.",
        );
      }

      console.error("💥 Unexpected error during fetch:", {
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
        message: error instanceof Error ? error.message : "Unknown error",
        nonce: transactionNonce,
      });

      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }

  validateTransactionNonce(transactionNonce: string | number): boolean {
    console.log("🔍 Validating transaction nonce:", {
      nonce: transactionNonce,
      type: typeof transactionNonce,
    });

    const num = Number(transactionNonce);
    const isValid = !isNaN(num) && num >= 0 && Number.isInteger(num);

    if (!isValid) {
      console.warn("⚠️ Invalid transaction nonce:", {
        nonce: transactionNonce,
        parsed: num,
        isNaN: isNaN(num),
        isNegative: num < 0,
        isInteger: Number.isInteger(num),
      });
    } else {
      console.log("✅ Transaction nonce validation passed:", {
        original: transactionNonce,
        parsed: num,
      });
    }

    return isValid;
  }
}

// Create and export a singleton instance
const blockDataViaTransactionNonceService =
  new BlockDataViaTransactionNonceService();
console.log("🚀 BlockDataViaTransactionNonceService singleton created");

export default blockDataViaTransactionNonceService;
export { BlockDataViaTransactionNonceService };
