// monorepo/native/mobile/comiccoin-wallet/hooks/useWalletTransactionMonitor.ts
import { useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWalletStream } from "./useWalletStream";
import { LatestBlockTransaction } from "../services/transaction/LatestBlockTransactionSSEService";

interface StoredTransaction {
  timestamp: number;
  walletAddress: string;
}

interface UseWalletTransactionMonitorOptions {
  walletAddress?: string;
  onNewTransaction?: () => void;
  onConnectionStateChange?: (connected: boolean) => void;
}

export function useWalletTransactionMonitor({
  walletAddress,
  onNewTransaction,
  onConnectionStateChange,
}: UseWalletTransactionMonitorOptions) {
  // Track if we've initialized storage for this wallet
  const isInitialized = useRef<boolean>(false);

  const getStorageKey = useCallback((address: string) => {
    return `wallet_latest_transaction_${address}`;
  }, []);

  // Enhanced check for initialization
  const checkInitialization = useCallback(
    async (address: string): Promise<boolean> => {
      try {
        const storedData = await AsyncStorage.getItem(getStorageKey(address));
        return storedData !== null;
      } catch (error) {
        console.log(`
❌ Initialization Check Failed ❌
================================
🔑 Storage Key: ${getStorageKey(address)}
⏰ Time: ${new Date().toLocaleTimeString()}
❌ Error: ${error instanceof Error ? error.message : "Unknown error"}
================================`);
        return false;
      }
    },
    [getStorageKey],
  );

  const isNewerTransaction = useCallback(
    async (address: string, newTimestamp: number): Promise<boolean> => {
      try {
        const storedData = await AsyncStorage.getItem(getStorageKey(address));
        if (!storedData) {
          console.log(`
📭 No Stored Transaction 📭
================================
🔗 Wallet: ${address.slice(0, 6)}...${address.slice(-4)}
⏰ Time: ${new Date().toLocaleTimeString()}
ℹ️  Status: First transaction for this wallet
================================`);
          return false; // Changed from true to false - we don't consider it "newer" if there's no stored data
        }

        const stored: StoredTransaction = JSON.parse(storedData);
        const isNewer = newTimestamp > stored.timestamp;

        console.log(`
🔍 Transaction Timestamp Check 🔍
================================
🔗 Wallet: ${address.slice(0, 6)}...${address.slice(-4)}
📅 Stored: ${new Date(stored.timestamp).toLocaleString()}
📅 New: ${new Date(newTimestamp).toLocaleString()}
✨ Result: ${isNewer ? "Newer!" : "Not newer"}
================================`);

        return isNewer;
      } catch (error) {
        console.log(`
⚠️ Timestamp Check Error ⚠️
================================
🔗 Wallet: ${address.slice(0, 6)}...${address.slice(-4)}
❌ Error: ${error instanceof Error ? error.message : "Unknown error"}
⏰ Time: ${new Date().toLocaleTimeString()}
================================`);
        return false; // Changed from true to false for safety
      }
    },
    [getStorageKey],
  );

  const storeLatestTransaction = useCallback(
    async (address: string, timestamp: number) => {
      try {
        const data: StoredTransaction = {
          timestamp,
          walletAddress: address,
        };
        await AsyncStorage.setItem(
          getStorageKey(address),
          JSON.stringify(data),
        );

        console.log(`
💾 Transaction Stored Successfully 💾
================================
🔗 Wallet: ${address.slice(0, 6)}...${address.slice(-4)}
⏰ Timestamp: ${new Date(timestamp).toLocaleString()}
✅ Status: Saved to storage
================================`);
      } catch (error) {
        console.log(`
❌ Storage Error ❌
================================
🔗 Wallet: ${address.slice(0, 6)}...${address.slice(-4)}
❌ Error: ${error instanceof Error ? error.message : "Unknown error"}
⏰ Time: ${new Date().toLocaleTimeString()}
================================`);
      }
    },
    [getStorageKey],
  );

  const handleTransaction = useCallback(
    async (transaction: LatestBlockTransaction) => {
      if (!walletAddress) return;

      try {
        // Add debugging to see what's coming in
        console.log(`
  📥 Processing Transaction 📥
  ================================
  🔗 Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}
  🕒 Timestamp: ${new Date(transaction.timestamp).toLocaleString()}
  🔄 Type: ${transaction.type}
  ⬆️  Direction: ${transaction.direction}
  ================================`);

        // First let's check what's in storage
        const storedData = await AsyncStorage.getItem(
          getStorageKey(walletAddress),
        );

        // If no stored data, this is our first transaction
        if (!storedData) {
          console.log(`
  🆕 First Transaction Detected 🆕
  ================================
  🔗 Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}
  ⏰ Time: ${new Date().toLocaleTimeString()}
  📝 Action: Storing first transaction
  ================================`);

          await storeLatestTransaction(walletAddress, transaction.timestamp);
          isInitialized.current = true;
          onNewTransaction?.();
          return;
        }

        // If we have stored data, parse it and compare timestamps
        const stored: StoredTransaction = JSON.parse(storedData);
        const isNewer = transaction.timestamp > stored.timestamp;

        console.log(`
  🔍 Comparing Transactions 🔍
  ================================
  🔗 Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}
  📅 Stored: ${new Date(stored.timestamp).toLocaleString()}
  📅 New: ${new Date(transaction.timestamp).toLocaleString()}
  ✨ Result: ${isNewer ? "Newer!" : "Not newer"}
  ================================`);

        if (isNewer) {
          await storeLatestTransaction(walletAddress, transaction.timestamp);
          onNewTransaction?.();
        }
      } catch (error) {
        console.log(`
  🚨 Transaction Processing Error 🚨
  ================================
  🔗 Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}
  ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}
  ⏰ Time: ${new Date().toLocaleTimeString()}
  ================================`);
      }
    },
    [walletAddress, getStorageKey, storeLatestTransaction, onNewTransaction],
  );

  // Use our existing wallet stream hook with the new handler
  const { reconnect } = useWalletStream({
    onTransactionReceived: handleTransaction,
    onConnectionStateChange,
    onError: (error) => {
      console.log("Wallet stream error:", error);
    },
  });

  // Clean up stored data when the component unmounts
  useEffect(() => {
    return () => {
      if (walletAddress) {
        // We're using a void callback here since useEffect cleanup can't be async
        AsyncStorage.removeItem(getStorageKey(walletAddress)).catch((error) =>
          console.log("Error cleaning up stored transaction:", error),
        );
      }
    };
  }, [walletAddress, getStorageKey]);

  return {
    reconnect,
  };
}
