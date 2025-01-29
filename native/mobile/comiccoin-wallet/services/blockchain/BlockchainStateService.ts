// monorepo/native/mobile/comiccoin-wallet/services/blockchain/BlockchainStateService.ts
import EventSource from "react-native-sse";
import config from "../../config";

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
  private baseUrl: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private isIntentionallyDisconnected: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private baseReconnectDelay: number = 2000; // Start with 2 second delay

  constructor(chainId: number = 1) {
    this.chainId = chainId;
    this.baseUrl = config.AUTHORITY_API_URL;

    console.log(`[BlockchainStateService] Initialized with:`, {
      chainId: this.chainId,
      baseUrl: this.baseUrl,
      environment: __DEV__ ? "development" : "production",
    });
  }

  private getReconnectDelay(): number {
    // Exponential backoff: 2s, 4s, 8s, 16s, 32s
    return this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private async handleReconnection(): Promise<void> {
    this.clearReconnectTimeout();

    if (this.isIntentionallyDisconnected) {
      console.log(
        "[BlockchainStateService] Skipping reconnection as service was intentionally disconnected",
      );
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        "[BlockchainStateService] Max reconnection attempts reached",
      );
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error("Max reconnection attempts reached"));
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = this.getReconnectDelay();

    console.log(
      `[BlockchainStateService] Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`,
    );

    this.reconnectTimeout = setTimeout(() => {
      console.log(
        `[BlockchainStateService] Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );

      // Only attempt reconnection if we still have callbacks
      if (this.onMessageCallback && this.onErrorCallback) {
        this.disconnect(false); // Don't mark as intentionally disconnected
        this.connect(this.onMessageCallback, this.onErrorCallback);
      } else {
        console.log(
          "[BlockchainStateService] No callbacks available for reconnection",
        );
      }
    }, delay);
  }

  connect(
    onMessage: (data: string) => void,
    onError: (error: any) => void,
  ): void {
    console.log(
      "[BlockchainStateService] Attempting to establish connection...",
      {
        environment: __DEV__ ? "development" : "production",
        reconnectAttempt: this.reconnectAttempts,
      },
    );

    if (!this.baseUrl) {
      const error = new Error("AUTHORITY_API_URL is not configured in config");
      console.error("[BlockchainStateService] Configuration Error:", error);
      onError(error);
      return;
    }

    this.onMessageCallback = onMessage;
    this.onErrorCallback = onError;
    this.isIntentionallyDisconnected = false;

    try {
      const url = this.buildUrl();
      console.log(`[BlockchainStateService] Connecting to URL: ${url}`);

      this.eventSource = new EventSource(url, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          chain_id: this.chainId,
        }),
        pollingInterval: 0,
        timeout: 60000,
        debug: __DEV__,
        timeoutBeforeConnection: __DEV__ ? 1000 : 500,
      });

      this.eventSource.addEventListener("open", () => {
        console.log("[BlockchainStateService] Connection opened successfully");
      });

      this.eventSource.addEventListener("message", (event) => {
        if (__DEV__) {
          console.log("[BlockchainStateService] Received message:", {
            type: event.type,
            dataLength: event.data?.length || 0,
            lastEventId: event.lastEventId || "none",
          });
        }

        if (this.onMessageCallback) {
          try {
            this.onMessageCallback(event.data);
            if (__DEV__) {
              console.log(
                "[BlockchainStateService] Message callback executed successfully",
              );
            }
          } catch (error) {
            console.error(
              "[BlockchainStateService] Error in message callback:",
              error,
            );
            if (this.onErrorCallback) {
              this.onErrorCallback(error);
            }
          }
        }
      });

      this.eventSource.addEventListener("error", (event) => {
        if (event.type === "timeout") {
          console.log(
            "[BlockchainStateService] Connection timed out, initiating reconnection",
          );
          this.handleReconnection();
        } else {
          const errorDetails = {
            type: event.type,
            message: event.message || "No message",
            error: event.error || "No error details",
            url: url,
            environment: __DEV__ ? "development" : "production",
            reconnectAttempt: this.reconnectAttempts,
          };

          console.error(
            "[BlockchainStateService] Error event received:",
            errorDetails,
          );

          if (this.onErrorCallback) {
            if (event.type === "error") {
              this.onErrorCallback(
                new Error(`Connection error: ${event.message}`),
              );
            } else if (event.type === "exception") {
              this.onErrorCallback(event.error);
            }
          }
        }
      });
    } catch (error) {
      console.error(
        "[BlockchainStateService] Error creating EventSource:",
        error,
      );
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    }
  }

  disconnect(intentional: boolean = true): void {
    this.clearReconnectTimeout();

    console.log("[BlockchainStateService] Initiating disconnect...", {
      intentional,
      reconnectAttempts: this.reconnectAttempts,
    });

    this.isIntentionallyDisconnected = intentional;

    if (this.eventSource) {
      try {
        this.eventSource.removeAllEventListeners();
        this.eventSource.close();
        this.eventSource = null;
      } catch (error) {
        console.error(
          "[BlockchainStateService] Error during disconnect:",
          error,
        );
      }
    }

    if (intentional) {
      this.onMessageCallback = null;
      this.onErrorCallback = null;
      this.reconnectAttempts = 0;
      console.log(
        "[BlockchainStateService] Reset service state due to intentional disconnect",
      );
    }
  }

  private buildUrl(): string {
    const cleanBaseUrl = this.baseUrl.replace(/\/+$/, "");
    const url =
      `${cleanBaseUrl}/api/v1/blockchain-state/sse?chain_id=` + this.chainId;

    if (!this.validateUrl(url)) {
      console.error(`Invalid URL constructed: ${url}`);
      throw new Error(`Invalid URL constructed: ${url}`);
    }

    return url;
  }

  private validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export default BlockchainStateService;
