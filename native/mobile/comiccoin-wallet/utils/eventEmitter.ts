import { EventEmitter } from "events";

// Create a global event emitter instance
class WalletTransactionEventEmitter extends EventEmitter {}

// Export a singleton instance
export const walletTransactionEventEmitter =
  new WalletTransactionEventEmitter();
