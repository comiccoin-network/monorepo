// monorepo/native/mobile/comiccoin-wallet/components/TransactionNotificationHandler.tsx
import { useEffect, useCallback, useState } from "react";
import * as Notifications from "expo-notifications";
import { AppState, Platform } from "react-native";
import { useWallet } from "../hooks/useWallet";
import { transactionManager } from "../services/transaction/TransactionManager";
import type { TransactionEvent } from "../services/transaction/TransactionManager";
import {
  configureBackgroundFetch,
  registerBackgroundFetch,
  unregisterBackgroundFetch,
  clearBackgroundFetch,
  getBackgroundFetchStatus,
} from "../services/transaction/BackgroundTransactionService";
import { useWalletBackgroundMonitor } from "../hooks/useWalletBackgroundMonitor";

// Known burn addresses in the system
const BURN_ADDRESSES = [
  "0x0000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000dead",
  "0x0000000000000000000000000000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000000000000000000000000000dead",
].map((addr) => addr.toLowerCase());

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldCustomizeAudioAttributes: Platform.OS === "android",
  }),
});

export function TransactionNotificationHandler() {
  // Hooks and state
  const { currentWallet } = useWallet();
  const [badgeCount, setBadgeCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [isBackgroundFetchConfigured, setIsBackgroundFetchConfigured] =
    useState(false);
  const [lastProcessedTx, setLastProcessedTx] = useState<string | null>(null);

  //
  // <Background fetch handler for register/unregister>
  //
  const { isMonitoringActive } = useWalletBackgroundMonitor();
  useEffect(() => {
    if (isMonitoringActive) {
      console.log(
        "🔄 Background monitoring is active, notifications will be generated",
      );
    } else {
      console.log("⏸️ Background monitoring is inactive");
    }
  }, [isMonitoringActive]);
  //
  // </ Background fetch handler for register/unregister>
  //

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        const isGranted = status === "granted";
        setHasPermission(isGranted);

        console.log(
          isGranted
            ? "✅ Notification permissions granted"
            : "⚠️ Notification permissions denied",
        );
      } catch (error) {
        console.log("❌ Error requesting notification permissions:", error);
        setHasPermission(false);
      }
    };

    requestPermissions();
  }, []);

  // Configure background fetch when wallet changes
  useEffect(() => {
    const setupBackgroundFetch = async () => {
      if (!currentWallet?.address || !hasPermission) {
        if (isBackgroundFetchConfigured) {
          console.log("🔄 Clearing background fetch configuration");
          await unregisterBackgroundFetch();
          clearBackgroundFetch();
          setIsBackgroundFetchConfigured(false);
        }
        return;
      }

      try {
        // Configure and register background fetch
        configureBackgroundFetch(currentWallet.address);
        await registerBackgroundFetch();
        setIsBackgroundFetchConfigured(true);

        // Log the current status
        const status = await getBackgroundFetchStatus();
        console.log("📊 Background fetch status:", status);
      } catch (error) {
        console.log("❌ Error setting up background fetch:", error);
      }
    };

    setupBackgroundFetch();

    // Cleanup
    return () => {
      if (isBackgroundFetchConfigured) {
        unregisterBackgroundFetch().catch(console.error);
      }
    };
  }, [currentWallet?.address, hasPermission]);

  // Generate notification content based on transaction type
  const generateNotificationContent = useCallback(
    (transaction: TransactionEvent["transaction"]) => {
      const isBurnTransaction =
        transaction.to && BURN_ADDRESSES.includes(transaction.to.toLowerCase());

      const value =
        transaction.type === "token"
          ? `NFT #${transaction.valueOrTokenID}`
          : `${transaction.valueOrTokenID} CC`;

      let title: string;
      let body: string;

      if (isBurnTransaction) {
        title = "Coins Burned 🔥";
        body = `${value} have been burned permanently`;
      } else if (transaction.direction === "TO") {
        title = "Coins Received ✨";
        body = `You've received ${value} in your wallet`;
      } else if (transaction.direction === "FROM") {
        title = "Coins Sent 💸";
        body = `You've sent ${value} from your wallet`;
      } else {
        title = "Transaction Alert";
        body = `A new transaction of ${value} has been processed`;
      }

      return { title, body };
    },
    [],
  );

  // Handle transactions and create notifications
  const handleTransaction = useCallback(
    async (event: TransactionEvent) => {
      if (!hasPermission) {
        console.log("⚠️ Skipping notification - no permission");
        return;
      }

      const txId = `${event.transaction.type}-${event.transaction.valueOrTokenID}-${event.timestamp}`;
      if (txId === lastProcessedTx) {
        console.log("🔄 Skipping duplicate transaction notification");
        return;
      }
      setLastProcessedTx(txId);

      try {
        const { title, body } = generateNotificationContent(event.transaction);
        const currentAppState = AppState.currentState;

        // Update badge count if app is not active
        const shouldUpdateBadge = currentAppState !== "active";
        const newBadgeCount = shouldUpdateBadge ? badgeCount + 1 : 0;

        if (shouldUpdateBadge) {
          setBadgeCount(newBadgeCount);
          await Notifications.setBadgeCountAsync(newBadgeCount);
        }

        // Schedule the notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: {
              transactionType: event.transaction.type,
              direction: event.transaction.direction,
              value: event.transaction.valueOrTokenID,
              timestamp: event.timestamp,
            },
            sound: "default",
            badge: newBadgeCount,
          },
          trigger: null, // Show immediately
        });

        console.log("✅ Transaction notification scheduled:", {
          title,
          appState: currentAppState,
          badgeCount: newBadgeCount,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.log("❌ Error scheduling notification:", error);
      }
    },
    [generateNotificationContent, badgeCount, hasPermission, lastProcessedTx],
  );

  // Set up notification listeners
  useEffect(() => {
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener(async () => {
        // Reset badge count for foreground notifications
        await Notifications.setBadgeCountAsync(0);
        setBadgeCount(0);
        console.log("📱 Notification received in foreground");
      });

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(async () => {
        // Reset badge count when user interacts with notification
        await Notifications.setBadgeCountAsync(0);
        setBadgeCount(0);
        console.log("👆 User interacted with notification");
      });

    // Clean up subscriptions
    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  // Monitor app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (nextAppState === "active") {
          try {
            // Reset notifications when app becomes active
            await Notifications.setBadgeCountAsync(0);
            setBadgeCount(0);
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log("🔄 Reset notifications on app activation");
            // Get latest background fetch status
            const status = await getBackgroundFetchStatus();
            console.log("📊 Background fetch status on activation:", status);
          } catch (error) {
            console.log("❌ Error resetting notifications:", error);
          }
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Subscribe to transaction events from the manager
  useEffect(() => {
    if (!currentWallet?.address) {
      console.log("⚠️ No wallet available for monitoring");
      return;
    }

    let subscriberId: string;
    try {
      subscriberId = transactionManager.subscribe(
        currentWallet.address,
        handleTransaction,
      );
      console.log("✅ Transaction subscription active", { subscriberId });
    } catch (error) {
      console.log("❌ Failed to subscribe to transactions:", error);
      return;
    }

    return () => {
      try {
        if (subscriberId) {
          transactionManager.unsubscribe(currentWallet.address, subscriberId);
          console.log("✅ Transaction subscription cleaned up", {
            subscriberId,
          });
        }
      } catch (error) {
        console.log("❌ Error during unsubscribe:", error);
      }
    };
  }, [currentWallet?.address, handleTransaction]);

  // Component doesn't render anything
  return null;
}

// Utility functions for external use
export const clearAllNotifications = async () => {
  try {
    await Notifications.setBadgeCountAsync(0);
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("✅ All notifications cleared successfully");
    return true;
  } catch (error) {
    console.log("❌ Error clearing notifications:", error);
    return false;
  }
};

export const removeSpecificNotification = async (identifier: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log(`✅ Notification ${identifier} removed successfully`);
    return true;
  } catch (error) {
    console.log(`❌ Error removing notification ${identifier}:`, error);
    return false;
  }
};
