// monorepo/native/mobile/comiccoin-wallet/hooks/useWalletTransactionMonitor.ts
import { useEffect, useCallback, useRef } from "react";
import { useWalletStream } from "./useWalletStream";
import { transactionManager } from "../services/transaction/TransactionManager";
import { walletTransactionEventEmitter } from "../utils/eventEmitter";
import { LatestBlockTransaction } from "../services/transaction/LatestBlockTransactionSSEService";

interface UseWalletTransactionMonitorOptions {
  walletAddress?: string;
  debugMode?: boolean;
}

export function useWalletTransactionMonitor({
  walletAddress,
  debugMode = __DEV__,
}: UseWalletTransactionMonitorOptions) {
  const isInitialized = useRef<boolean>(false);

  const log = useCallback(
    (message: string, data?: any) => {
      if (debugMode) {
        console.log(`${message}`, data ? data : "");
      }
    },
    [debugMode],
  );

  const handleTransaction = useCallback(
    async (transaction: LatestBlockTransaction) => {
      if (!walletAddress) {
        log("⚠️ No wallet address available for transaction processing");
        return;
      }

      try {
        log("📥 Received transaction", {
          type: transaction.type,
          timestamp: transaction.timestamp,
          walletAddress: walletAddress.slice(0, 6),
        });

        const processed = await transactionManager.processTransaction(
          transaction,
          walletAddress,
        );

        if (processed) {
          log("🔔 Emitting transaction event", {
            walletAddress: walletAddress.slice(0, 6),
          });
          walletTransactionEventEmitter.emit("newTransaction", {
            walletAddress,
            transaction,
          });
        } else {
          log("⏭️ Transaction not processed", {
            reason: "Already processed or invalid",
          });
        }
      } catch (error) {
        log("❌ Error processing transaction", {
          error: error instanceof Error ? error.message : "Unknown error",
          walletAddress: walletAddress.slice(0, 6),
        });
      }
    },
    [walletAddress, log],
  );

  // Initialize monitor
  useEffect(() => {
    if (!walletAddress) {
      log("⏳ Waiting for wallet address");
      return;
    }

    if (!isInitialized.current) {
      log("🚀 Initializing transaction monitor", {
        address: walletAddress.slice(0, 6),
      });

      transactionManager.initialize().catch((error) => {
        log("❌ Failed to initialize transaction manager:", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      });

      isInitialized.current = true;
    }

    return () => {
      if (walletAddress) {
        log("👋 Cleaning up transaction monitor", {
          address: walletAddress.slice(0, 6),
        });
        isInitialized.current = false;
      }
    };
  }, [walletAddress, log]);

  const { isConnecting } = useWalletStream({
    onTransactionReceived: handleTransaction,
    onConnectionStateChange: (connected) => {
      log(`${connected ? "🟢" : "🔴"} Stream connection state changed`, {
        connected,
        walletAddress: walletAddress ? walletAddress.slice(0, 6) : "none",
      });
    },
    onError: (error) => {
      log("❌ Stream error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        walletAddress: walletAddress ? walletAddress.slice(0, 6) : "none",
      });
    },
  });

  return {
    isConnecting,
    clearTransactionHistory: useCallback(async () => {
      if (walletAddress) {
        log("🧹 Clearing transaction history", {
          address: walletAddress.slice(0, 6),
        });
        await transactionManager.clearTransactionHistory(walletAddress);
      } else {
        log("⚠️ Cannot clear history - no wallet address available");
      }
    }, [walletAddress, log]),
  };
}
