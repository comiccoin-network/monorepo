// monorepo/native/mobile/comiccoin-wallet/src/services/coin/TransferService.ts
import { ethers } from "ethers";
import config from "../../config";
import walletService from "../wallet/WalletService";

// Define interfaces for our transaction types
interface TransactionTemplate {
  chain_id: number;
  from: string;
  to: string;
  nonce_bytes: number[];
  value: number;
  type: "coin";
}

interface SignedTransaction extends TransactionTemplate {
  nonce_string: string;
  data: string;
  data_string: string;
  token_id_bytes: number[] | null;
  token_id_string: string;
  token_metadata_uri: string;
  token_nonce_bytes: number[] | null;
  token_nonce_string: string;
  v_bytes: number[];
  r_bytes: number[];
  s_bytes: number[];
}

interface VerificationResult {
  isValid: boolean;
  recoveredAddress?: string;
  error?: string | null;
}

interface TransactionSubmissionResult {
  success: boolean;
  transactionId: string;
}

interface TransactionTemplateRequest {
  sender_account_address: string;
  recipient_address: string;
  value: number;
  data: string;
  type: "coin";
}

class CoinTransferService {
  private readonly BASE_URL: string;
  private readonly defaultHeaders: { [key: string]: string };
  private readonly comicCoinId: number;
  private chainId: number;

  constructor() {
    this.BASE_URL = config.AUTHORITY_API_URL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
    this.comicCoinId = 29;
    this.chainId = 1;
  }

  /**
   * Initializes the service with a specific chain ID
   * @param chainId - The blockchain network identifier
   */
  public initialize(chainId: number): void {
    this.chainId = chainId;
  }

  /**
   * Generates a unique Object ID for transactions
   * @returns A hexadecimal string representing a unique identifier
   */
  private generateObjectId(): string {
    const timestamp = Math.floor(Date.now() / 1000)
      .toString(16)
      .padStart(8, "0");
    const machineId = Math.floor(Math.random() * 16777216)
      .toString(16)
      .padStart(6, "0");
    const processId = Math.floor(Math.random() * 65536)
      .toString(16)
      .padStart(4, "0");
    const counter = Math.floor(Math.random() * 16777216)
      .toString(16)
      .padStart(6, "0");
    return timestamp + machineId + processId + counter;
  }

  /**
   * Removes empty or null values from an object recursively
   * @param obj - Object to clean
   * @returns Cleaned object with empty/null values removed
   */
  private cleanMap<T extends object>(obj: T): Partial<T> {
    const result = { ...obj };

    for (const [key, value] of Object.entries(result)) {
      if (value === null) {
        delete result[key];
        continue;
      }

      if (typeof value === "string" && value === "") {
        delete result[key];
        continue;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          delete result[key];
          continue;
        }
        // Clean array elements if they are objects
        for (let i = 0; i < value.length; i++) {
          if (typeof value[i] === "object" && value[i] !== null) {
            value[i] = this.cleanMap(value[i]);
          }
        }
        continue;
      }

      if (typeof value === "object") {
        const cleaned = this.cleanMap(value);
        if (Object.keys(cleaned).length === 0) {
          delete result[key];
        } else {
          result[key] = cleaned;
        }
      }
    }

    return result;
  }

  /**
   * Fetches a transaction template from the server
   */
  public async getTransactionTemplate(
    senderAddress: string,
    recipientAddress: string,
    amount: number | string,
    message: string = "",
  ): Promise<TransactionTemplate> {
    try {
      const currentWallet = walletService.getCurrentWallet();
      if (!currentWallet) {
        throw new Error("No wallet is currently loaded");
      }

      if (currentWallet.address.toLowerCase() !== senderAddress.toLowerCase()) {
        throw new Error("Sender address does not match current wallet");
      }

      const requestPayload: TransactionTemplateRequest = {
        sender_account_address: senderAddress.toLowerCase(),
        recipient_address: recipientAddress.toLowerCase(),
        value: parseInt(amount.toString()),
        data: "",
        type: "coin",
      };

      console.log("Requesting template with payload:", requestPayload);

      const response = await fetch(
        `${this.BASE_URL}/api/v1/transaction/prepare`,
        {
          method: "POST",
          headers: this.defaultHeaders,
          body: JSON.stringify(requestPayload),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get transaction template");
      }

      return await response.json();
    } catch (error) {
      console.error("getTransactionTemplate error:", error);
      throw error;
    }
  }

  /**
   * Creates a stamp (hash) for transaction signing
   */
  private async createStamp(
    transaction: TransactionTemplate,
  ): Promise<Uint8Array> {
    console.log("Creating stamp from:", transaction);

    const orderedObj = {
      chain_id: transaction.chain_id,
      from: transaction.from.toLowerCase(),
      nonce_bytes: transaction.nonce_bytes,
      to: transaction.to.toLowerCase(),
      type: "coin" as const,
      value: transaction.value,
    };

    const initialJson = JSON.stringify(orderedObj);
    console.log("Initial JSON (raw):", initialJson);
    console.log(
      "Initial JSON bytes:",
      Array.from(ethers.toUtf8Bytes(initialJson)).map((b) =>
        b.toString(16).padStart(2, "0"),
      ),
    );

    const prefix = `\x19ComicCoin Signed Message:\n${initialJson.length}`;
    const stampBytes = ethers.toUtf8Bytes(prefix);
    const messageBytes = ethers.toUtf8Bytes(initialJson);

    return ethers.getBytes(
      ethers.keccak256(ethers.concat([stampBytes, messageBytes])),
    );
  }

  /**
   * Signs a transaction using the current wallet
   */
  public async signTransaction(
    template: TransactionTemplate,
  ): Promise<SignedTransaction> {
    try {
      const currentWallet = walletService.getCurrentWallet();
      if (!currentWallet) {
        throw new Error("No wallet is currently loaded");
      }

      console.log("Starting signing process:", {
        wallet_address: currentWallet.address,
        template: template,
      });

      const messageHash = await this.createStamp(template);
      console.log("Message hash:", ethers.hexlify(messageHash));

      const wallet = new ethers.Wallet(currentWallet.privateKey);
      const signature = await wallet.signingKey.sign(messageHash);

      const recoveryBit = signature.yParity;
      const v = this.comicCoinId + recoveryBit;

      const verifySignature = ethers.Signature.from({
        r: signature.r,
        s: signature.s,
        v: 27 + recoveryBit,
      });

      const recoveredAddr = ethers.recoverAddress(messageHash, verifySignature);
      if (recoveredAddr.toLowerCase() !== currentWallet.address.toLowerCase()) {
        throw new Error(
          "Pre-verification failed - recovered address does not match sender",
        );
      }

      const signedTx: SignedTransaction = {
        ...template,
        nonce_string: "",
        data: "",
        data_string: "",
        token_id_bytes: null,
        token_id_string: "",
        token_metadata_uri: "",
        token_nonce_bytes: null,
        token_nonce_string: "",
        v_bytes: [v],
        r_bytes: Array.from(ethers.getBytes(signature.r)),
        s_bytes: Array.from(ethers.getBytes(signature.s)),
      };

      const verificationResult = await this.verifySignature(signedTx);
      if (!verificationResult.isValid) {
        throw new Error(
          "Final verification failed: " + verificationResult.error,
        );
      }

      return signedTx;
    } catch (error) {
      console.error("signTransaction error:", error);
      throw error;
    }
  }

  /**
   * Verifies a transaction signature
   */
  public async verifySignature(
    signedTransaction: SignedTransaction,
  ): Promise<VerificationResult> {
    try {
      console.log("Starting verification with:", {
        from: signedTransaction.from,
        v_bytes: signedTransaction.v_bytes,
        r_bytes: signedTransaction.r_bytes.slice(0, 5),
        s_bytes: signedTransaction.s_bytes.slice(0, 5),
      });

      const messageHash = await this.createStamp(signedTransaction);

      const r = ethers.hexlify(new Uint8Array(signedTransaction.r_bytes));
      const s = ethers.hexlify(new Uint8Array(signedTransaction.s_bytes));

      const comicCoinV = signedTransaction.v_bytes[0];
      const recoveryBit = comicCoinV - this.comicCoinId;
      const ethersV = 27 + recoveryBit;

      console.log("Verification values:", {
        comicCoinV,
        recoveryBit,
        ethersV,
        r: r,
        s: s,
      });

      const signature = ethers.Signature.from({
        r: r,
        s: s,
        v: ethersV,
      });

      console.log("Verification components:", {
        messageHash: ethers.hexlify(messageHash),
        signature_v: signature.v,
        signature_r: signature.r,
        signature_s: signature.s,
      });

      const recoveredAddress = ethers.recoverAddress(messageHash, signature);
      const isValid =
        recoveredAddress.toLowerCase() === signedTransaction.from.toLowerCase();

      console.log("Recovery result:", {
        recovered: recoveredAddress,
        expected: signedTransaction.from,
        isValid: isValid,
      });

      return {
        isValid,
        recoveredAddress,
        error: isValid
          ? null
          : "Recovered address does not match transaction sender",
      };
    } catch (error) {
      console.error("Verification error:", error);
      return {
        isValid: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Submits a signed transaction to the mempool
   */
  public async submitSignedTransaction(
    signedTransaction: SignedTransaction,
  ): Promise<TransactionSubmissionResult> {
    try {
      const mempoolTransaction = {
        id: this.generateObjectId(),
        ...signedTransaction,
      };

      console.log("Submitting transaction:", {
        id: mempoolTransaction.id,
        chain_id: mempoolTransaction.chain_id,
        from: mempoolTransaction.from,
        to: mempoolTransaction.to,
        value: mempoolTransaction.value,
        v_bytes: mempoolTransaction.v_bytes.map((b) =>
          b.toString(16).padStart(2, "0"),
        ),
        r_bytes:
          mempoolTransaction.r_bytes
            .slice(0, 4)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("") + "...",
        s_bytes:
          mempoolTransaction.s_bytes
            .slice(0, 4)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("") + "...",
      });

      const requestBody = JSON.stringify(mempoolTransaction);
      console.log("Request body:", requestBody);

      const response = await fetch(
        `${this.BASE_URL}/api/v1/mempool-transactions`,
        {
          method: "POST",
          headers: this.defaultHeaders,
          body: requestBody,
        },
      );

      if (response.status === 201) {
        return {
          success: true,
          transactionId: mempoolTransaction.id,
        };
      }

      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }

      throw new Error(errorData.message || "Failed to submit transaction");
    } catch (error) {
      console.error("submitSignedTransaction error:", error);
      console.error("Error details:", {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      throw error;
    }
  }
}

// Create and export singleton instance
const coinTransferService = new CoinTransferService();
export default coinTransferService;

// Export the class for testing purposes
export { CoinTransferService };
