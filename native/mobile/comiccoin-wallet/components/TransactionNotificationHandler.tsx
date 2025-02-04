// monorepo/native/mobile/comiccoin-wallet/components/TransactionNotificationHandler.tsx

import { useEffect, useCallback, useState } from "react";
import * as Notifications from "expo-notifications";
import { AppState, Platform } from "react-native";
import { useWallet } from "../hooks/useWallet";
import { transactionManager } from "../services/transaction/TransactionManager";
import type { TransactionEvent } from "../services/transaction/TransactionManager";

// Configure the default behavior for all notifications in the app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,     // Show an alert when the app is in the foreground
    shouldPlaySound: true,     // Play a sound when the notification arrives
    shouldSetBadge: true,      // Update the app icon badge count
    shouldCustomizeAudioAttributes: false  // Use default audio settings
  }),
});

// Define known burn addresses in the system
const BURN_ADDRESSES = [
  "0x0000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000dead",
  "0x0000000000000000000000000000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000000000000000000000000000dead",
].map((addr) => addr.toLowerCase());

// Utility function to clear all notifications and badge counts
export const clearAllNotifications = async () => {
  try {
    await Notifications.setBadgeCountAsync(0);
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All notifications cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing notifications:', error);
    return false;
  }
};

// Utility function to remove a specific notification by its identifier
export const removeSpecificNotification = async (identifier: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log(`✅ Notification ${identifier} removed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error removing notification ${identifier}:`, error);
    return false;
  }
};

export function TransactionNotificationHandler() {
  const { currentWallet } = useWallet();
  const [badgeCount, setBadgeCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [lastProcessedTx, setLastProcessedTx] = useState<string | null>(null);

  // Request notification permissions when the component mounts
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        const isGranted = status === 'granted';
        setHasPermission(isGranted);

        if (!isGranted) {
          console.log('⚠️ Notification permissions denied');
          return;
        }

        console.log('✅ Notification permissions granted');
      } catch (error) {
        console.error('❌ Error requesting notification permissions:', error);
        setHasPermission(false);
      }
    };

    requestPermissions();
  }, []);

  // Set up notification handlers for both foreground and background states
  useEffect(() => {
    // Handle notifications received while app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        // Clear badge count since user has seen the notification in-app
        await Notifications.setBadgeCountAsync(0);
        setBadgeCount(0);
        console.log('📱 Notification received in foreground');
      }
    );

    // Handle notification responses (when user taps the notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        await Notifications.setBadgeCountAsync(0);
        setBadgeCount(0);
        console.log('👆 User interacted with notification');
      }
    );

    // Clean up subscriptions when component unmounts
    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  // Monitor app state changes to manage notifications
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        try {
          // Clear all notifications and badge count when app becomes active
          await Notifications.setBadgeCountAsync(0);
          setBadgeCount(0);
          await Notifications.cancelAllScheduledNotificationsAsync();
          console.log('🔄 Reset notifications on app activation');
        } catch (error) {
          console.error('❌ Error resetting notifications:', error);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Generate appropriate notification content based on transaction type
  const generateNotificationContent = useCallback((transaction: TransactionEvent['transaction']) => {
    const isBurnTransaction = transaction.to &&
      BURN_ADDRESSES.includes(transaction.to.toLowerCase());

    const value = transaction.type === "token"
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
  }, []);

  // Handle incoming transactions and create notifications
  const handleTransaction = useCallback(async (event: TransactionEvent) => {
    if (!hasPermission) {
      console.log('⚠️ Skipping notification - no permission');
      return;
    }

    // Prevent duplicate notifications for the same transaction
    const txId = `${event.transaction.type}-${event.transaction.valueOrTokenID}-${event.timestamp}`;
    if (txId === lastProcessedTx) {
      console.log('🔄 Skipping duplicate transaction notification');
      return;
    }
    setLastProcessedTx(txId);

    try {
      const { title, body } = generateNotificationContent(event.transaction);
      const currentAppState = AppState.currentState;

      // Only increment badge count if app is not active
      const shouldUpdateBadge = currentAppState !== 'active';
      const newBadgeCount = shouldUpdateBadge ? badgeCount + 1 : 0;

      if (shouldUpdateBadge) {
        setBadgeCount(newBadgeCount);
      }

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
          sound: 'default',
          badge: shouldUpdateBadge ? newBadgeCount : 0,
        },
        trigger: null, // Show notification immediately
      });

      console.log('✅ Transaction notification scheduled:', {
        appState: currentAppState,
        badgeCount: newBadgeCount,
        title,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
    }
  }, [generateNotificationContent, badgeCount, hasPermission, lastProcessedTx]);

  // Set up transaction subscription
  useEffect(() => {
    if (!currentWallet?.address) {
      console.log("⚠️ No wallet available for monitoring");
      return;
    }

    let subscriberId: string;
    try {
      subscriberId = transactionManager.subscribe(
        currentWallet.address,
        handleTransaction
      );
      console.log("✅ Transaction subscription active");
    } catch (error) {
      console.error("❌ Failed to subscribe to transactions:", error);
      return;
    }

    // Cleanup subscription when component unmounts
    return () => {
      try {
        transactionManager.unsubscribe(currentWallet.address, subscriberId);
        console.log("✅ Transaction subscription cleaned up");
      } catch (error) {
        console.error("❌ Error during unsubscribe:", error);
      }
    };
  }, [currentWallet?.address, handleTransaction]);

  // This component doesn't render any UI elements
  return null;
}
