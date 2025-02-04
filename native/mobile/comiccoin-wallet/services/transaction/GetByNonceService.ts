// monorepo/native/mobile/comiccoin-wallet/src/services/transaction/GetByNonceService.ts
import config from "../../config";

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
}

interface SignedTransaction extends Transaction {
  v_bytes: string;
  r_bytes: string;
  s_bytes: string;
}

interface BlockTransactionByOnce extends SignedTransaction {
  timestamp: number;
  fee: number;
}

interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

const debugLog = (emoji: string, message: string, data?: any) => {
  console.log(
    `${emoji} [BlockTransactionByOnceService] ${message}`,
    data ? { timestamp: new Date().toISOString(), ...data } : "",
  );
};

class BlockTransactionByOnceService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.AUTHORITY_API_URL;
    debugLog("🏗️", "Service initialized", {
      baseURL: this.baseURL,
      environment: process.env.NODE_ENV,
    });
  }

  async getBlockTransactionByOnce(
    transactionNonce: string | number,
  ): Promise<BlockTransactionByOnce> {
    debugLog("📤", "Request initiated", {
      nonce: transactionNonce,
      requestId: Math.random().toString(36).substring(7),
    });

    if (!this.validateTransactionNonce(transactionNonce)) {
      debugLog("❌", "Nonce validation failed", {
        nonce: transactionNonce,
        type: typeof transactionNonce,
      });
      throw new Error("Invalid transaction nonce");
    }

    const endpoint = `${this.baseURL}/api/v1/block-transaction-by-nonce/${transactionNonce}`;
    debugLog("🔗", "Endpoint constructed", {
      endpoint,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    try {
      const startTime = performance.now();
      debugLog("🚀", "Making fetch request", {
        nonce: transactionNonce,
        startTime: new Date().toISOString(),
      });

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const requestDuration = (performance.now() - startTime).toFixed(2);
      debugLog("⏱️", "Response received", {
        duration: `${requestDuration}ms`,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch block transaction";
        try {
          const errorData = await response.json();
          debugLog("🚫", "Error response parsed", {
            status: response.status,
            errorData,
            nonce: transactionNonce,
          });
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          debugLog("⚠️", "Failed to parse error response", {
            status: response.status,
            statusText: response.statusText,
            parseError:
              parseError instanceof Error
                ? parseError.message
                : "Unknown parse error",
          });
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      debugLog("📦", "Response parsed", {
        dataSize: JSON.stringify(responseData).length,
        hasData: !!responseData,
      });

      const data: BlockTransactionByOnce = responseData;

      debugLog("✅", "Transaction processed", {
        nonce: transactionNonce,
        timestamp: new Date(data.timestamp * 1000).toISOString(),
        type: data.type,
        from: data.from,
        to: data.to,
        value: data.value,
        requestDuration: `${requestDuration}ms`,
      });

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        debugLog("🌐", "Network error occurred", {
          error: error.message,
          nonce: transactionNonce,
          url: endpoint,
          stack: error.stack,
        });
        throw new Error(
          "Network request failed. Please check your connection.",
        );
      }

      debugLog("💥", "Unexpected error", {
        errorType:
          error instanceof Error ? error.constructor.name : typeof error,
        message: error instanceof Error ? error.message : "Unknown error",
        nonce: transactionNonce,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }

  validateTransactionNonce(transactionNonce: string | number): boolean {
    debugLog("🔍", "Validating nonce", {
      nonce: transactionNonce,
      type: typeof transactionNonce,
    });

    const num = Number(transactionNonce);
    const isValid = !isNaN(num) && num >= 0 && Number.isInteger(num);

    if (!isValid) {
      debugLog("⚠️", "Nonce validation failed", {
        nonce: transactionNonce,
        parsed: num,
        isNaN: isNaN(num),
        isNegative: num < 0,
        isInteger: Number.isInteger(num),
      });
    } else {
      debugLog("✅", "Nonce validation passed", {
        original: transactionNonce,
        parsed: num,
        type: typeof num,
      });
    }

    return isValid;
  }
}

// Create and export a singleton instance
const blockTransactionByOnceService = new BlockTransactionByOnceService();
debugLog("🚀", "Service singleton created");

export default blockTransactionByOnceService;
export { BlockTransactionByOnceService };
