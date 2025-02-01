// monorepo/native/mobile/comiccoin-wallet/app/(transactions)/index.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletTransactions } from "../../hooks/useWalletTransactions";
import { useWallet } from "../../hooks/useWallet";
import TransactionList from "../../components/TransactionList";
import { walletTransactionEventEmitter } from "../../utils/eventEmitter";

export default function TransactionsList() {
  const { currentWallet } = useWallet();
  const queryClient = useQueryClient();
  const { transactions, loading, error, refresh } = useWalletTransactions(
    currentWallet?.address,
  );

  // Listen for transaction events
  useEffect(() => {
    if (!currentWallet?.address) return;

    const handleTransaction = async (data: {
      walletAddress: string;
      transaction: any;
    }) => {
      if (currentWallet.address === data.walletAddress) {
        console.log(`
💫 Transaction Update in List 💫
================================
🔗 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
📊 Current Count: ${transactions?.length || 0}
⏰ Time: ${new Date().toLocaleTimeString()}
================================`);

        await refresh();
      }
    };

    walletTransactionEventEmitter.on("newTransaction", handleTransaction);

    return () => {
      walletTransactionEventEmitter.off("newTransaction", handleTransaction);
    };
  }, [currentWallet?.address, refresh]);

  // Enhanced refresh handler for manual refreshes
  const handleRefresh = async () => {
    if (!currentWallet) return;

    console.log(`
🔄 Manual Refresh Triggered 🔄
================================
🔗 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
📊 Current Count: ${transactions?.length || 0}
⏰ Time: ${new Date().toLocaleTimeString()}
================================`);

    try {
      // Invalidate and refetch in one go
      await queryClient.invalidateQueries({
        queryKey: ["transactions", currentWallet.address],
        refetchType: "active",
      });

      await refresh();

      walletTransactionEventEmitter.emit("transactionListRefresh", {
        walletAddress: currentWallet.address,
        timestamp: Date.now(),
        transactionCount: transactions?.length || 0,
      });
    } catch (error) {
      console.log("Refresh failed:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.listContainer}>
          <TransactionList
            transactions={transactions || []}
            currentWalletAddress={currentWallet?.address || ""}
            onRefresh={handleRefresh}
            isRefreshing={loading}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F5F3FF",
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
  },
});
