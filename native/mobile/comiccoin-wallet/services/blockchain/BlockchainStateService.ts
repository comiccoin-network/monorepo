// monorepo/native/mobile/comiccoin-wallet/services/blockchain/BlockchainStateService.ts
import { Platform } from "react-native";
import { AUTHORITY_API_URL } from "../../config";

export interface BlockchainState {
  chain_id: number;
  latest_block_number_bytes: string;
  latest_hash: string;
  latest_token_id_bytes: string;
  transaction_fee: number;
  account_hash_state: string;
  token_hash_state: string;
}

class BlockchainStateService {
  private eventSource: EventSource | null = null;
  private chainId: number;
  private onMessageCallback: ((data: string) => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;

  constructor(chainId: number = 1) {
    this.chainId = chainId;
  }

  connect(
    onMessage: (data: string) => void,
    onError: (error: any) => void,
  ): void {
    this.onMessageCallback = onMessage;
    this.onErrorCallback = onError;

    // If we're on web, use regular EventSource
    if (Platform.OS === "web") {
      const url = `${AUTHORITY_API_URL}/api/v1/blockchain-state/sse?chain_id=${this.chainId}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onmessage = (event) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(event.data);
        }
      };

      this.eventSource.onerror = (error) => {
        if (this.onErrorCallback) {
          this.onErrorCallback(error);
        }
      };
    } else {
      // For mobile platforms, we'll use a POST request with appropriate headers
      this.connectMobile();
    }
  }

  private async connectMobile(): Promise<void> {
    try {
      const response = await fetch(
        `${AUTHORITY_API_URL}/api/v1/blockchain-state/sse?chain_id=${this.chainId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        },
      );

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get reader from response");
      }

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the Uint8Array to a string
        const text = new TextDecoder().decode(value);
        const lines = text.split("\n");

        // Process each line
        lines.forEach((line) => {
          if (line.startsWith("data: ")) {
            const data = line.slice(6); // Remove 'data: ' prefix
            if (this.onMessageCallback) {
              this.onMessageCallback(data);
            }
          }
        });
      }
    } catch (error) {
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    }
  }

  disconnect(): void {
    if (Platform.OS === "web" && this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.onMessageCallback = null;
    this.onErrorCallback = null;
  }
}

export default BlockchainStateService;
