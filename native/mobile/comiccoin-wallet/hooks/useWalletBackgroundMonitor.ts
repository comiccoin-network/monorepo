// monorepo/native/mobile/comiccoin-wallet/hooks/useWalletBackgroundMonitor.ts
import { useEffect, useCallback, useState } from "react";
import { AppState } from "react-native";
import { useWallet } from "./useWallet";
import {
  configureBackgroundFetch,
  registerBackgroundFetch,
  unregisterBackgroundFetch,
  clearBackgroundFetch,
  getBackgroundFetchStatus,
} from "../services/transaction/BackgroundTransactionService";

/**
 * Hook to manage background monitoring of wallet transactions
 */
export function useWalletBackgroundMonitor() {
  const { currentWallet, isAuthenticated, isLocked } = useWallet();
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);

  const startMonitoring = useCallback(async () => {
    if (!currentWallet?.address || !isAuthenticated || isLocked) {
      console.log(`
🚫 Background Monitor Start Failed 🚫
==========================================
💳 Wallet Status
------------------------------------------
📍 Address: ${currentWallet?.address ? `${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}` : "None"}
🔐 Auth: ${isAuthenticated ? "Yes" : "No"}
🔒 Locked: ${isLocked ? "Yes" : "No"}
------------------------------------------
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
      return;
    }

    try {
      console.log(`
🚀 Initializing Background Monitor 🚀
==========================================
💳 Wallet Details
------------------------------------------
📍 Address: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
🔐 Auth: Active
🔒 Status: Unlocked
------------------------------------------
⏰ Time: ${new Date().toLocaleTimeString()}
🔄 Action: Configuring service...
==========================================
`);

      configureBackgroundFetch(currentWallet.address);
      const success = await registerBackgroundFetch();

      if (success) {
        setIsMonitoringActive(true);
        console.log(`
✅ Background Monitor Active ✅
==========================================
💳 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
📡 Status: Monitoring
⏰ Time: ${new Date().toLocaleTimeString()}
🎯 Result: Setup Complete
==========================================
`);
      } else {
        console.log(`
⚠️ Background Monitor Setup Failed ⚠️
==========================================
💳 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
❌ Status: Registration Failed
⏰ Time: ${new Date().toLocaleTimeString()}
🔍 Action: Check system permissions
==========================================
`);
      }
    } catch (error) {
      console.log(`
❌ Background Monitor Error ❌
==========================================
💳 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
⚠️ Error: ${error instanceof Error ? error.message : "Unknown error"}
⏰ Time: ${new Date().toLocaleTimeString()}
🔍 Status: Setup Failed
==========================================
`);
    }
  }, [currentWallet?.address, isAuthenticated, isLocked]);

  const stopMonitoring = useCallback(async () => {
    try {
      console.log(`
🛑 Stopping Background Monitor 🛑
==========================================
💳 Wallet: ${currentWallet?.address ? `${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}` : "None"}
📡 Status: Shutting down
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);

      await unregisterBackgroundFetch();
      clearBackgroundFetch();
      setIsMonitoringActive(false);

      console.log(`
✅ Background Monitor Stopped ✅
==========================================
📡 Status: Inactive
⏰ Time: ${new Date().toLocaleTimeString()}
🎯 Result: Cleanup Complete
==========================================
`);
    } catch (error) {
      console.log(`
❌ Monitor Stop Error ❌
==========================================
💳 Wallet: ${currentWallet?.address ? `${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}` : "None"}
⚠️ Error: ${error instanceof Error ? error.message : "Unknown error"}
⏰ Time: ${new Date().toLocaleTimeString()}
🔍 Status: Cleanup Failed
==========================================
`);
    }
  }, [currentWallet?.address]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (nextAppState === "background") {
          console.log(`
📱 App State Changed: Background 📱
==========================================
💳 Wallet: ${currentWallet?.address ? `${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}` : "None"}
🔐 Monitor Active: ${isMonitoringActive ? "Yes" : "No"}
🔒 Auth Status: ${isAuthenticated ? "Authenticated" : "Not Authenticated"}
🔑 Lock Status: ${isLocked ? "Locked" : "Unlocked"}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);

          if (
            !isMonitoringActive &&
            currentWallet?.address &&
            isAuthenticated &&
            !isLocked
          ) {
            await startMonitoring();
          }
        } else if (nextAppState === "active") {
          console.log(`
📱 App State Changed: Active 📱
==========================================
💳 Wallet: ${currentWallet?.address ? `${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}` : "None"}
🔄 Action: Checking monitor status
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);

          const status = await getBackgroundFetchStatus();
          setIsMonitoringActive(status.isRegistered);

          console.log(`
📊 Monitor Status Updated 📊
==========================================
📡 Active: ${status.isRegistered ? "Yes" : "No"}
🔔 Status: ${status.statusName}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
        }
      },
    );

    return () => {
      subscription.remove();
      console.log(`
🧹 Cleaning Up App State Listener 🧹
==========================================
📡 Status: Removed
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
    };
  }, [
    isMonitoringActive,
    currentWallet?.address,
    isAuthenticated,
    isLocked,
    startMonitoring,
  ]);

  // Handle wallet state changes
  useEffect(() => {
    const handleWalletStateChange = async () => {
      const shouldMonitor =
        currentWallet?.address &&
        isAuthenticated &&
        !isLocked &&
        !isMonitoringActive;
      const shouldStop =
        (!currentWallet?.address || !isAuthenticated || isLocked) &&
        isMonitoringActive;

      console.log(`
💳 Wallet State Changed 💳
==========================================
📍 Address: ${currentWallet?.address ? `${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}` : "None"}
🔐 Auth: ${isAuthenticated ? "Yes" : "No"}
🔒 Locked: ${isLocked ? "Yes" : "No"}
📡 Monitoring: ${isMonitoringActive ? "Active" : "Inactive"}
🎯 Action: ${shouldMonitor ? "Starting Monitor" : shouldStop ? "Stopping Monitor" : "No Change"}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);

      if (shouldMonitor) {
        await startMonitoring();
      } else if (shouldStop) {
        await stopMonitoring();
      }
    };

    handleWalletStateChange();
  }, [
    currentWallet?.address,
    isAuthenticated,
    isLocked,
    isMonitoringActive,
    startMonitoring,
    stopMonitoring,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isMonitoringActive) {
        console.log(`
🧹 Component Cleanup 🧹
==========================================
📡 Status: Active monitor detected
🔄 Action: Stopping background monitor
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
        stopMonitoring();
      }
    };
  }, [isMonitoringActive, stopMonitoring]);

  return {
    isMonitoringActive,
    startMonitoring,
    stopMonitoring,
  };
}
