// monorepo/native/mobile/comiccoin-wallet/services/BackgroundTransactionService.ts
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { transactionManager } from "./TransactionManager";
import { LatestBlockTransaction } from "./LatestBlockTransactionSSEService";
import { Platform } from "react-native";

// Define a unique task identifier for our background fetch
export const BACKGROUND_FETCH_TASK = "background-wallet-transactions";

// Store the current wallet address in memory
let activeWalletAddress: string | null = null;

// Keep track of registration state to prevent registration/unregistration conflicts
let isTaskRegistered = false;

// Configuration options for different platforms
const FETCH_CONFIG = {
  // Minimum interval between background fetches (in seconds)
  MINIMUM_INTERVAL: Platform.select({
    ios: 3600, // 60 minutes for iOS (note 60x60=3600)
    android: 3600, // 60 minutes for Android
    default: 3600,
  }),
  // Maximum number of retries for failed operations
  MAX_RETRIES: 3,
  // Delay between retries (in milliseconds)
  RETRY_DELAY: 5000,
};

/**
 * Get detailed status information about the background fetch service
 * This function provides a complete picture of the current state of background fetching
 */
export async function getBackgroundFetchStatus() {
  try {
    // Get the system's background fetch status
    const systemStatus = await BackgroundFetch.getStatusAsync();

    // Check if our task is registered with the system
    const systemRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_FETCH_TASK,
    );

    // Update our local tracking state to match system state
    isTaskRegistered = systemRegistered;

    console.log(`
📊 Background Service Status Check 📊
==========================================
🤖 Task: ${BACKGROUND_FETCH_TASK}
📡 System Status: ${BackgroundFetch.BackgroundFetchStatus[systemStatus]}
✅ Registered: ${systemRegistered ? "Yes" : "No"}
🏦 Active Wallet: ${
      activeWalletAddress
        ? `${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}`
        : "None"
    }
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);

    return {
      status: systemStatus,
      isRegistered: systemRegistered,
      statusName: BackgroundFetch.BackgroundFetchStatus[systemStatus],
      activeWallet: activeWalletAddress
        ? activeWalletAddress.slice(0, 6)
        : null,
    };
  } catch (error) {
    console.log(`
❌ Status Check Failed ❌
==========================================
🤖 Task: ${BACKGROUND_FETCH_TASK}
⚠️ Error: ${error instanceof Error ? error.message : "Unknown error"}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);

    // Return a safe default status if we can't get the real status
    return {
      status: BackgroundFetch.BackgroundFetchStatus.Denied,
      isRegistered: false,
      statusName: "Error",
      activeWallet: null,
    };
  }
}

/**
 * Safely check if the task is actually registered with the system
 */
async function checkTaskRegistration(): Promise<boolean> {
  try {
    return await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  } catch (error) {
    console.log(`
⚠️ Task Registration Check Failed ⚠️
==========================================
🤖 Task: ${BACKGROUND_FETCH_TASK}
❌ Error: ${error instanceof Error ? error.message : "Unknown error"}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
    return false;
  }
}

/**
 * Configure the background service with a wallet address
 * @param walletAddress - The wallet address to monitor
 */
export const configureBackgroundFetch = (walletAddress: string) => {
  console.log(`
🔧 Configuring Background Fetch Service 🔧
==========================================
🏦 Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
  activeWalletAddress = walletAddress;
};

/**
 * Clear the current wallet configuration
 */
export const clearBackgroundFetch = () => {
  console.log(`
🧹 Clearing Background Service 🧹
==========================================
🏦 Wallet: ${activeWalletAddress ? `${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}` : "None"}
⏰ Time: ${new Date().toLocaleTimeString()}
⚡ Status: Service Cleared
==========================================
`);
  activeWalletAddress = null;
};

// Define the background task that will be executed periodically
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  console.log(`
🔄 Background Fetch Task Started 🔄
==========================================
⏰ Time: ${new Date().toLocaleTimeString()}
🤖 Task ID: ${BACKGROUND_FETCH_TASK}
==========================================
`);

  try {
    // Check if we have a wallet configured
    if (!activeWalletAddress) {
      console.log(`
⚠️ Background Fetch Warning ⚠️
==========================================
❌ Error: No active wallet configured
⏰ Time: ${new Date().toLocaleTimeString()}
🔍 Details: Background fetch cannot proceed
==========================================
`);
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Log the start of the operation with timestamp
    console.log(`
📊 Starting Transaction Fetch 📊
==========================================
🏦 Wallet: ${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}
⏰ Time: ${new Date().toLocaleTimeString()}
🌐 Network: ${Platform.OS === "ios" ? "iOS" : "Android"}
🔄 Attempt: 1/${FETCH_CONFIG.MAX_RETRIES}
==========================================
`);

    // Attempt to fetch new transactions
    const transactions = await fetchTransactionsWithRetry();

    if (!transactions || transactions.length === 0) {
      console.log(`
ℹ️ Transaction Check Complete ℹ️
==========================================
🏦 Wallet: ${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}
📈 Status: No new transactions
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    console.log(`
✨ New Transactions Found ✨
==========================================
🏦 Wallet: ${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}
📊 Count: ${transactions.length} transactions
⏰ Time: ${new Date().toLocaleTimeString()}
🔄 Status: Processing started
==========================================
`);

    // Process each transaction and prepare notifications
    for (const transaction of transactions) {
      try {
        await processTransactionWithTimeout(transaction);
      } catch (error) {
        console.log(`
❌ Transaction Processing Error ❌
==========================================
🏦 Wallet: ${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}
⚠️ Error: ${error instanceof Error ? error.message : "Unknown error"}
⏰ Time: ${new Date().toLocaleTimeString()}
🔄 Status: Continuing with next transaction
==========================================
`);
      }
    }

    console.log(`
✅ Background Task Completed ✅
==========================================
🏦 Wallet: ${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}
📊 Processed: ${transactions.length} transactions
⏰ Time: ${new Date().toLocaleTimeString()}
🔄 Status: Success
==========================================
`);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.log(`
❌ Background Fetch Failed ❌
==========================================
🏦 Wallet: ${activeWalletAddress ? `${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}` : "None"}
⚠️ Error: ${error instanceof Error ? error.message : "Unknown error"}
⏰ Time: ${new Date().toLocaleTimeString()}
🔄 Status: Failed
==========================================
`);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Fetch transactions with retry logic
 */
async function fetchTransactionsWithRetry(): Promise<LatestBlockTransaction[]> {
  for (let attempt = 1; attempt <= FETCH_CONFIG.MAX_RETRIES; attempt++) {
    try {
      if (!activeWalletAddress) throw new Error("No active wallet address");

      console.log(`
🔍 Fetching Transactions (Attempt ${attempt}) 🔍
==========================================
🏦 Wallet: ${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}
⏰ Time: ${new Date().toLocaleTimeString()}
📡 Status: Connecting to network
==========================================
`);

      return await transactionManager.getLatestTransactions(
        activeWalletAddress,
      );
    } catch (error) {
      if (attempt === FETCH_CONFIG.MAX_RETRIES) {
        console.log(`
❌ All Retry Attempts Failed ❌
==========================================
🏦 Wallet: ${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}
⚠️ Error: ${error instanceof Error ? error.message : "Unknown error"}
🔄 Attempts: ${attempt}/${FETCH_CONFIG.MAX_RETRIES}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
        throw error;
      }

      console.log(`
⚠️ Retry Attempt Failed ⚠️
==========================================
🏦 Wallet: ${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}
🔄 Attempt: ${attempt}/${FETCH_CONFIG.MAX_RETRIES}
⏳ Retry In: ${FETCH_CONFIG.RETRY_DELAY}ms
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
      await new Promise((resolve) =>
        setTimeout(resolve, FETCH_CONFIG.RETRY_DELAY),
      );
    }
  }
  return [];
}

/**
 * Process a transaction with a timeout
 */
async function processTransactionWithTimeout(
  transaction: LatestBlockTransaction,
) {
  const TIMEOUT = 10000; // 10 second timeout

  console.log(`
🔄 Processing Transaction 🔄
==========================================
🏦 Wallet: ${activeWalletAddress!.slice(0, 6)}...${activeWalletAddress!.slice(-4)}
💰 Type: ${transaction.type}
⏳ Timeout: ${TIMEOUT}ms
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);

  try {
    await Promise.race([
      transactionManager.processTransaction(transaction, activeWalletAddress!),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Transaction processing timed out")),
          TIMEOUT,
        ),
      ),
    ]);

    console.log(`
✅ Transaction Processed Successfully ✅
==========================================
🏦 Wallet: ${activeWalletAddress!.slice(0, 6)}...${activeWalletAddress!.slice(-4)}
💰 Type: ${transaction.type}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
  } catch (error) {
    console.log(`
❌ Transaction Processing Error ❌
==========================================
🏦 Wallet: ${activeWalletAddress!.slice(0, 6)}...${activeWalletAddress!.slice(-4)}
⚠️ Error: ${error instanceof Error ? error.message : "Unknown error"}
💰 Type: ${transaction.type}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
    throw error;
  }
}

/**
 * Register the background fetch task with additional safety checks
 */
export async function registerBackgroundFetch(): Promise<boolean> {
  try {
    // First, check if our local state thinks it's registered
    if (isTaskRegistered) {
      console.log(`
ℹ️ Task Already Registered (Local State) ℹ️
==========================================
🤖 Task: ${BACKGROUND_FETCH_TASK}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
      return true;
    }

    // Then verify with the system
    const systemRegistered = await checkTaskRegistration();
    if (systemRegistered) {
      isTaskRegistered = true;
      console.log(`
✅ Task Already Registered (System) ✅
==========================================
🤖 Task: ${BACKGROUND_FETCH_TASK}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
      return true;
    }

    // If not registered anywhere, register it
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: FETCH_CONFIG.MINIMUM_INTERVAL,
      stopOnTerminate: false,
      startOnBoot: true,
    });

    isTaskRegistered = true;
    console.log(`
✅ Task Successfully Registered ✅
==========================================
🤖 Task: ${BACKGROUND_FETCH_TASK}
⚡ Status: Newly Registered
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);

    return true;
  } catch (error) {
    console.log(`
❌ Task Registration Failed ❌
==========================================
🤖 Task: ${BACKGROUND_FETCH_TASK}
⚠️ Error: ${error instanceof Error ? error.message : "Unknown error"}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
    return false;
  }
}

/**
 * Unregister the background fetch task with safety checks
 */
export async function unregisterBackgroundFetch(): Promise<boolean> {
  try {
    // First check if our local state thinks it's not registered
    if (!isTaskRegistered) {
      console.log(`
ℹ️ Task Already Unregistered (Local State) ℹ️
==========================================
🤖 Task: ${BACKGROUND_FETCH_TASK}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
      return true;
    }

    // Verify with the system
    const systemRegistered = await checkTaskRegistration();
    if (!systemRegistered) {
      isTaskRegistered = false;
      console.log(`
ℹ️ Task Already Unregistered (System) ℹ️
==========================================
🤖 Task: ${BACKGROUND_FETCH_TASK}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
      return true;
    }

    // Only attempt to unregister if it's actually registered
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    isTaskRegistered = false;

    console.log(`
✅ Task Successfully Unregistered ✅
==========================================
🤖 Task: ${BACKGROUND_FETCH_TASK}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
    return true;
  } catch (error) {
    // If we get a "task not found" error, update our state but don't treat it as an error
    if (error instanceof Error && error.message.includes("not found")) {
      isTaskRegistered = false;
      console.log(`
ℹ️ Task Not Found During Unregister ℹ️
==========================================
🤖 Task: ${BACKGROUND_FETCH_TASK}
📝 Note: Treating as already unregistered
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
      return true;
    }

    console.log(`
❌ Task Unregister Failed ❌
==========================================
🤖 Task: ${BACKGROUND_FETCH_TASK}
⚠️ Error: ${error instanceof Error ? error.message : "Unknown error"}
⏰ Time: ${new Date().toLocaleTimeString()}
==========================================
`);
    return false;
  }
}
