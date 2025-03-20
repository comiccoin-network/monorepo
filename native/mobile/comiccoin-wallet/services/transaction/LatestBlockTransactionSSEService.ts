// monorepo/native/mobile/comiccoin-wallet/services/blockchain/LatestBlockTransactionSSEService.ts
import EventSource from "react-native-sse";
import config from "../../config";

//
// At the lowest level, we have the LatestBlockTransactionSSEService that manages the raw SSE connection with proper error handling and reconnection logic.
//
// In the middle, we created the useWalletTransactionMonitor hook that intelligently manages transaction state using local storage. This layer prevents unnecessary refreshes by comparing transaction timestamps and only triggers updates when genuinely new transactions arrive.
//
// At the top, we integrated everything into your Overview component with clear status indicators and informative logging, giving users a smooth experience while keeping developers well-informed about the system's state.
//

export interface LatestBlockTransaction {
  direction: string;
  type: string;
  valueOrTokenID: number;
  timestamp: number;
}

export const parseTransaction = (
  data: string,
): LatestBlockTransaction | null => {
  try {
    const [direction, type, value, timestamp] = data.split("|");
    return {
      direction,
      type,
      valueOrTokenID: parseFloat(value),
      timestamp: parseInt(timestamp, 10),
    };
  } catch (error) {
    console.log("Error parsing transaction data:", error, data);
    return null;
  }
};

class LatestBlockTransactionSSEService {
  private eventSource: EventSource | null = null;
  private address: string;
  private onMessageCallback: ((data: LatestBlockTransaction) => void) | null =
    null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private baseUrl: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private isIntentionallyDisconnected: boolean = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private baseReconnectDelay: number = 2000; // Start with 2 second delay

  constructor(address: string = "") {
    this.address = address;
    this.baseUrl = config.AUTHORITY_API_URL;

    console.log(`[LatestBlockTransactionSSEService] Initialized with:`, {
      address: this.address,
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
        "[LatestBlockTransactionSSEService] Skipping reconnection as service was intentionally disconnected",
      );
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(
        "[LatestBlockTransactionSSEService] Max reconnection attempts reached",
      );
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error("Max reconnection attempts reached"));
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = this.getReconnectDelay();

    console.log(
      `[LatestBlockTransactionSSEService] Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`,
    );

    this.reconnectTimeout = setTimeout(() => {
      console.log(
        `[LatestBlockTransactionSSEService] Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );

      // Only attempt reconnection if we still have callbacks
      if (this.onMessageCallback && this.onErrorCallback) {
        this.disconnect(false); // Don't mark as intentionally disconnected
        this.connect(this.onMessageCallback, this.onErrorCallback);
      } else {
        console.log(
          "[LatestBlockTransactionSSEService] No callbacks available for reconnection",
        );
      }
    }, delay);
  }

  connect(
    onMessage: (data: LatestBlockTransaction) => void,
    onError: (error: Error) => void,
  ): void {
    console.log(
      "[LatestBlockTransactionSSEService] Attempting to establish connection...",
      {
        environment: __DEV__ ? "development" : "production",
        reconnectAttempt: this.reconnectAttempts,
      },
    );

    if (!this.baseUrl) {
      const error = new Error("AUTHORITY_API_URL is not configured in config");
      console.log(
        "[LatestBlockTransactionSSEService] Configuration Error:",
        error,
      );
      onError(error);
      return;
    }

    this.onMessageCallback = onMessage;
    this.onErrorCallback = onError;
    this.isIntentionallyDisconnected = false;

    try {
      const url = this.buildUrl();
      console.log(
        `[LatestBlockTransactionSSEService] Connecting to URL: ${url}`,
      );

      this.eventSource = new EventSource(url, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          address: this.address,
        }),
        pollingInterval: 0,
        timeout: 60000,
        debug: __DEV__,
        timeoutBeforeConnection: __DEV__ ? 1000 : 500,
      });

      this.eventSource.addEventListener("open", () => {
        console.log(
          "[LatestBlockTransactionSSEService] Connection opened successfully",
        );
      });

      this.eventSource.addEventListener("message", (event: MessageEvent) => {
        if (__DEV__) {
          console.log("[LatestBlockTransactionSSEService] Received message:", {
            type: event.type,
            dataLength: event.data?.length || 0,
            lastEventId: event.lastEventId || "none",
          });
        }

        if (this.onMessageCallback) {
          try {
            const parsedTransaction = parseTransaction(event.data);
            if (parsedTransaction) {
              this.onMessageCallback(parsedTransaction);
            }
            if (__DEV__) {
              console.log(
                "[LatestBlockTransactionSSEService] Message callback executed successfully",
              );
            }
          } catch (error) {
            console.log(
              "[LatestBlockTransactionSSEService] Error in message callback:",
              error,
            );
            if (this.onErrorCallback) {
              this.onErrorCallback(
                error instanceof Error ? error : new Error(String(error)),
              );
            }
          }
        }
      });

      this.eventSource.addEventListener("error", (event: Event) => {
        if (event.type === "timeout") {
          console.log(
            "[LatestBlockTransactionSSEService] Connection timed out, initiating reconnection",
          );
          this.handleReconnection();
        } else {
          const errorDetails = {
            type: event.type,
            message: "message" in event ? event.message : "No message",
            error: "error" in event ? event.error : "No error details",
            url: url,
            environment: __DEV__ ? "development" : "production",
            reconnectAttempt: this.reconnectAttempts,
          };

          console.log(
            "[LatestBlockTransactionSSEService] Error event received:",
            errorDetails,
          );

          if (this.onErrorCallback) {
            if (event.type === "error") {
              this.onErrorCallback(
                new Error(`Connection error: ${errorDetails.message}`),
              );
            } else if (event.type === "exception" && "error" in event) {
              this.onErrorCallback(
                event.error instanceof Error
                  ? event.error
                  : new Error(String(event.error)),
              );
            }
          }
        }
      });
    } catch (error) {
      console.log(
        "[LatestBlockTransactionSSEService] Error creating EventSource:",
        error,
      );
      if (this.onErrorCallback) {
        this.onErrorCallback(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }
  }

  disconnect(intentional: boolean = true): void {
    this.clearReconnectTimeout();

    console.log("[LatestBlockTransactionSSEService] Initiating disconnect...", {
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
        console.log(
          "[LatestBlockTransactionSSEService] Error during disconnect:",
          error,
        );
      }
    }

    if (intentional) {
      this.onMessageCallback = null;
      this.onErrorCallback = null;
      this.reconnectAttempts = 0;
      console.log(
        "[LatestBlockTransactionSSEService] Reset service state due to intentional disconnect",
      );
    }
  }

  private buildUrl(): string {
    const cleanBaseUrl = this.baseUrl.replace(/\/+$/, "");
    const url = `${cleanBaseUrl}/authority/api/v1/latest-block-transaction/sse?address=${this.address}`;

    if (!this.validateUrl(url)) {
      console.log(`Invalid URL constructed: ${url}`);
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

export default LatestBlockTransactionSSEService;
