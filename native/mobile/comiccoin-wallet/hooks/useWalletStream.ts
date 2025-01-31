// monorepo/native/mobile/comiccoin-wallet/hooks/useWalletStream.ts
import { useEffect, useRef, useCallback, useState } from "react";
import { useWallet } from "./useWallet";
import LatestBlockTransactionSSEService, {
  LatestBlockTransaction,
} from "../services/transaction/LatestBlockTransactionSSEService";

// Configuration for exponential backoff reconnection strategy
const RECONNECT_CONFIG = {
  MAX_ATTEMPTS: 5, // Maximum number of reconnection attempts
  INITIAL_DELAY: 2000, // Initial delay of 2 seconds
  MAX_DELAY: 32000, // Maximum delay cap of 32 seconds
  BACKOFF_FACTOR: 2, // Multiply delay by this factor each attempt
};

// Interface defining the options for the wallet stream hook
export interface WalletStreamOptions {
  onTransactionReceived?: (transaction: LatestBlockTransaction) => void;
  onConnectionStateChange?: (connected: boolean) => void;
  onError?: (error: Error) => void;
  sessionCheckInterval?: number;
}

export function useWalletStream({
  onTransactionReceived,
  onConnectionStateChange,
  onError,
  sessionCheckInterval = 30000, // Default to checking session every 30 seconds
}: WalletStreamOptions = {}) {
  // Core wallet functionality
  const { currentWallet, checkSession } = useWallet();

  // Connection state management
  const [isConnecting, setIsConnecting] = useState(false);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const serviceRef = useRef<LatestBlockTransactionSSEService | null>(null);

  // Store callbacks in refs to maintain consistency across renders
  // This prevents unnecessary reconnections due to callback reference changes
  const callbackRefs = useRef({
    onTransaction: onTransactionReceived,
    onConnectionState: onConnectionStateChange,
    onError,
  });

  // Keep callback refs up to date with the latest prop values
  useEffect(() => {
    callbackRefs.current = {
      onTransaction: onTransactionReceived,
      onConnectionState: onConnectionStateChange,
      onError,
    };
  }, [onTransactionReceived, onConnectionStateChange, onError]);

  // Calculate delay for exponential backoff reconnection strategy
  const getReconnectDelay = useCallback(() => {
    const delay =
      RECONNECT_CONFIG.INITIAL_DELAY *
      Math.pow(RECONNECT_CONFIG.BACKOFF_FACTOR, reconnectAttempts.current);
    return Math.min(delay, RECONNECT_CONFIG.MAX_DELAY);
  }, []);

  // Cleanup function for reconnection timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = undefined;
    }
  }, []);

  // Disconnect the SSE service instance
  const disconnectService = useCallback(
    (intentional: boolean = true) => {
      clearReconnectTimeout();

      if (serviceRef.current) {
        serviceRef.current.disconnect(intentional);
        serviceRef.current = null;
        callbackRefs.current.onConnectionState?.(false);
      }
    },
    [clearReconnectTimeout],
  );

  // Handle reconnection logic with exponential backoff
  const handleReconnection = useCallback(() => {
    if (!currentWallet?.address || isConnecting) return;

    clearReconnectTimeout();

    if (reconnectAttempts.current >= RECONNECT_CONFIG.MAX_ATTEMPTS) {
      console.log(`
🚫 Maximum Reconnection Attempts Reached 🚫
================================
🔗 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
🔄 Attempts: ${RECONNECT_CONFIG.MAX_ATTEMPTS}/${RECONNECT_CONFIG.MAX_ATTEMPTS}
⏰ Time: ${new Date().toLocaleTimeString()}
❌ Status: Connection Failed
================================`);
      callbackRefs.current.onError?.(
        new Error("Maximum reconnection attempts reached"),
      );
      return;
    }

    const delay = getReconnectDelay();
    reconnectAttempts.current++;

    console.log(`
🔄 Scheduling Reconnection 🔄
================================
🔗 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
📊 Attempt: ${reconnectAttempts.current}/${RECONNECT_CONFIG.MAX_ATTEMPTS}
⏲️  Delay: ${delay}ms
⏰ Time: ${new Date().toLocaleTimeString()}
================================`);

    reconnectTimeout.current = setTimeout(() => {
      establishConnection();
    }, delay);
  }, [
    currentWallet?.address,
    isConnecting,
    clearReconnectTimeout,
    getReconnectDelay,
  ]);

  // Establish SSE connection with error handling
  const establishConnection = useCallback(() => {
    if (!currentWallet?.address || isConnecting) return;

    setIsConnecting(true);
    disconnectService(false);

    try {
      const service = new LatestBlockTransactionSSEService(
        currentWallet.address,
      );
      serviceRef.current = service;

      service.connect(
        // Transaction handler with session validation
        (transaction) => {
          if (!checkSession()) {
            disconnectService();
            callbackRefs.current.onError?.(new Error("Session expired"));
            return;
          }
          callbackRefs.current.onTransaction?.(transaction);
        },
        // Error handler with reconnection logic
        (error) => {
          console.log(`
❌ SSE Connection Error ❌
================================
🔗 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
❌ Error: ${error.message}
⏰ Time: ${new Date().toLocaleTimeString()}
🔄 Status: Initiating reconnection
================================`);
          callbackRefs.current.onError?.(error);

          if (!checkSession()) {
            disconnectService();
            return;
          }

          // Initiate reconnection for connection-related errors
          if (
            error.message.includes("timeout") ||
            error.message.includes("connection")
          ) {
            handleReconnection();
          }
        },
      );

      callbackRefs.current.onConnectionState?.(true);
      reconnectAttempts.current = 0; // Reset attempts on successful connection
    } catch (error) {
      console.log(`
🚨 SSE Connection Failed 🚨
================================
🔗 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
❌ Error: ${error instanceof Error ? error.message : "Unknown error"}
⏰ Time: ${new Date().toLocaleTimeString()}
🔄 Action: Attempting reconnection
================================`);
      callbackRefs.current.onError?.(
        error instanceof Error ? error : new Error("Connection failed"),
      );
      handleReconnection();
    } finally {
      setIsConnecting(false);
    }
  }, [
    currentWallet?.address,
    checkSession,
    disconnectService,
    handleReconnection,
  ]);

  // Set up connection and session monitoring
  useEffect(() => {
    if (!currentWallet?.address) {
      disconnectService();
      return;
    }

    establishConnection();

    // Set up periodic session check
    const sessionCheckId = setInterval(() => {
      if (!checkSession()) {
        console.log(`
⏰ Session Expired ⏰
================================
🔗 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
❌ Status: Session Invalid
⏰ Time: ${new Date().toLocaleTimeString()}
🔄 Action: Disconnecting SSE
================================`);
        disconnectService();
        callbackRefs.current.onError?.(new Error("Session expired"));
      } else if (!serviceRef.current && !isConnecting) {
        console.log(`
🔌 Connection Check 🔌
================================
🔗 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
✅ Session: Valid
❌ Connection: None
⏰ Time: ${new Date().toLocaleTimeString()}
🔄 Action: Initiating reconnection
================================`);
        establishConnection();
      }
    }, sessionCheckInterval);

    // Cleanup function
    return () => {
      clearInterval(sessionCheckId);
      disconnectService();
    };
  }, [
    currentWallet?.address,
    sessionCheckInterval,
    establishConnection,
    disconnectService,
    checkSession,
    isConnecting,
  ]);

  // Return hook interface
  return {
    reconnect: useCallback(() => {
      reconnectAttempts.current = 0; // Reset attempts for manual reconnection
      establishConnection();
    }, [establishConnection]),
    disconnect: useCallback(() => disconnectService(true), [disconnectService]),
    isConnecting,
  };
}
