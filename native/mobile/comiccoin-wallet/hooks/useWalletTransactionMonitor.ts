// monorepo/native/mobile/comiccoin-wallet/hooks/useWalletTransactionMonitor.ts
import { useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWalletStream } from "./useWalletStream";
import { walletTransactionEventEmitter } from "../utils/eventEmitter"; // Import the event emitter
import { LatestBlockTransaction } from "../services/transaction/LatestBlockTransactionSSEService";

interface StoredTransaction {
  timestamp: number;
  walletAddress: string;
}

interface UseWalletTransactionMonitorOptions {
  walletAddress?: string;
}

export function useWalletTransactionMonitor({
  walletAddress,
}: UseWalletTransactionMonitorOptions) {
  const isInitialized = useRef<boolean>(false);

  const getStorageKey = useCallback((address: string) => {
    return `wallet_latest_transaction_${address}`;
  }, []);

  const isNewerTransaction = useCallback(
    async (address: string, newTimestamp: number): Promise<boolean> => {
      try {
        const storedData = await AsyncStorage.getItem(getStorageKey(address));
        if (!storedData) return true;

        const stored: StoredTransaction = JSON.parse(storedData);
        return newTimestamp > stored.timestamp;
      } catch (error) {
        console.log("Error checking transaction timestamp:", error);
        return false;
      }
    },
    [getStorageKey],
  );

  const storeLatestTransaction = useCallback(
    async (address: string, timestamp: number) => {
      try {
        const data: StoredTransaction = { timestamp, walletAddress: address };
        await AsyncStorage.setItem(
          getStorageKey(address),
          JSON.stringify(data),
        );
      } catch (error) {
        console.log("Error storing transaction:", error);
      }
    },
    [getStorageKey],
  );

  const handleTransaction = useCallback(
    async (transaction: LatestBlockTransaction) => {
      if (!walletAddress) return;

      const isNewer = await isNewerTransaction(
        walletAddress,
        transaction.timestamp,
      );
      if (isNewer) {
        await storeLatestTransaction(walletAddress, transaction.timestamp);

        console.log("🔔 Emitting new transaction event...");
        walletTransactionEventEmitter.emit("newTransaction", {
          walletAddress,
          transaction,
        });
      }
    },
    [walletAddress, isNewerTransaction, storeLatestTransaction],
  );

  useWalletStream({ onTransactionReceived: handleTransaction });

  useEffect(() => {
    return () => {
      if (walletAddress) {
        AsyncStorage.removeItem(getStorageKey(walletAddress)).catch(
          console.error,
        );
      }
    };
  }, [walletAddress, getStorageKey]);

  return {};
}
