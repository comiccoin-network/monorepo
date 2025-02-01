// monorepo/native/mobile/comiccoin-wallet/services/transaction/TransactionManager.ts
import { LatestBlockTransaction } from "./LatestBlockTransactionSSEService";
import walletService from "../wallet/WalletService";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TransactionCallback {
  id: string;
  callback: (transaction: TransactionEvent) => void;
}

interface TransactionEvent {
  walletAddress: string;
  transaction: LatestBlockTransaction;
  timestamp: number;
}

class TransactionManager {
  private static instance: TransactionManager | null = null;
  private subscribers: Map<string, Set<TransactionCallback>>;
  private lastProcessedTransactions: Map<string, number>;
  private readonly LAST_TRANSACTION_KEY = "last_transaction_v1";

  private constructor() {
    this.subscribers = new Map();
    this.lastProcessedTransactions = new Map();
    console.log("🏗️ TransactionManager initialized");
  }

  static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }
    return TransactionManager.instance;
  }

  async initialize(): Promise<void> {
    console.log("🚀 Initializing TransactionManager");
    try {
      const storedData = await AsyncStorage.getItem(this.LAST_TRANSACTION_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        Object.entries(parsedData).forEach(([address, timestamp]) => {
          this.lastProcessedTransactions.set(address, timestamp as number);
        });
        console.log("📥 Loaded stored transaction data", {
          addresses: Array.from(this.lastProcessedTransactions.keys()),
        });
      }
    } catch (error) {
      console.error("❌ Failed to initialize TransactionManager:", error);
    }
  }

  subscribe(
    walletAddress: string,
    callback: (transaction: TransactionEvent) => void,
  ): string {
    if (!walletService.checkSession()) {
      console.warn("⚠️ Cannot subscribe - no active wallet session");
      throw new Error("No active wallet session");
    }

    const subscriberId = `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const normalizedAddress = walletAddress.toLowerCase();

    if (!this.subscribers.has(normalizedAddress)) {
      this.subscribers.set(normalizedAddress, new Set());
    }

    this.subscribers.get(normalizedAddress)!.add({
      id: subscriberId,
      callback,
    });

    console.log("✅ New subscriber added", {
      address: normalizedAddress.slice(0, 6),
      subscriberId,
      totalSubscribers: this.subscribers.get(normalizedAddress)!.size,
    });

    return subscriberId;
  }

  unsubscribe(walletAddress: string, subscriberId: string): boolean {
    const normalizedAddress = walletAddress.toLowerCase();
    const subscribers = this.subscribers.get(normalizedAddress);

    if (!subscribers) {
      console.log("ℹ️ No subscribers found for address", {
        address: normalizedAddress.slice(0, 6),
      });
      return false;
    }

    const removed = Array.from(subscribers).some((sub) => {
      if (sub.id === subscriberId) {
        subscribers.delete(sub);
        return true;
      }
      return false;
    });

    if (subscribers.size === 0) {
      this.subscribers.delete(normalizedAddress);
    }

    console.log("🗑️ Subscriber removed", {
      address: normalizedAddress.slice(0, 6),
      subscriberId,
      success: removed,
      remainingSubscribers: subscribers.size,
    });

    return removed;
  }

  async processTransaction(
    transaction: LatestBlockTransaction,
    walletAddress: string,
  ): Promise<boolean> {
    if (!walletService.checkSession()) {
      console.warn("⚠️ Skipping transaction - no active session");
      return false;
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const subscribers = this.subscribers.get(normalizedAddress);

    if (!subscribers || subscribers.size === 0) {
      console.log("ℹ️ No active subscribers for transaction", {
        address: normalizedAddress.slice(0, 6),
      });
      return false;
    }

    const lastProcessed =
      this.lastProcessedTransactions.get(normalizedAddress) || 0;
    if (transaction.timestamp <= lastProcessed) {
      console.log("⏭️ Skipping already processed transaction", {
        address: normalizedAddress.slice(0, 6),
        timestamp: transaction.timestamp,
        lastProcessed,
      });
      return false;
    }

    const event: TransactionEvent = {
      walletAddress: normalizedAddress,
      transaction,
      timestamp: Date.now(),
    };

    console.log("📨 Broadcasting transaction", {
      address: normalizedAddress.slice(0, 6),
      type: transaction.type,
      subscribers: subscribers.size,
    });

    subscribers.forEach(({ callback }) => {
      try {
        callback(event);
      } catch (error) {
        console.error("❌ Error in subscriber callback:", error);
      }
    });

    this.lastProcessedTransactions.set(
      normalizedAddress,
      transaction.timestamp,
    );
    await this.persistLastProcessed();

    return true;
  }

  private async persistLastProcessed(): Promise<void> {
    try {
      const data = Object.fromEntries(this.lastProcessedTransactions);
      await AsyncStorage.setItem(
        this.LAST_TRANSACTION_KEY,
        JSON.stringify(data),
      );
      console.log("💾 Persisted last processed transactions");
    } catch (error) {
      console.error("❌ Failed to persist transaction data:", error);
    }
  }

  async clearTransactionHistory(walletAddress: string): Promise<void> {
    const normalizedAddress = walletAddress.toLowerCase();
    this.lastProcessedTransactions.delete(normalizedAddress);
    await this.persistLastProcessed();
    console.log("🧹 Cleared transaction history", {
      address: normalizedAddress.slice(0, 6),
    });
  }

  getSubscriberCount(walletAddress: string): number {
    const normalizedAddress = walletAddress.toLowerCase();
    return this.subscribers.get(normalizedAddress)?.size || 0;
  }
}

export const transactionManager = TransactionManager.getInstance();
export type { TransactionEvent };
