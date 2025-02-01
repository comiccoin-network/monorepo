// monorepo/native/mobile/comiccoin-wallet/app/(transactions)/index.tsx
import React, { useCallback, useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useWalletTransactions } from "../../hooks/useWalletTransactions";
import { useWallet } from "../../hooks/useWallet";
import TransactionList from "../../components/TransactionList";
import { transactionManager } from "../../services/transaction/TransactionManager";
import type { TransactionEvent } from "../../services/transaction/TransactionManager";

export default function TransactionsList() {
  const { currentWallet } = useWallet();
  const queryClient = useQueryClient();
  const { transactions, loading, error, refresh } = useWalletTransactions(
    currentWallet?.address,
  );

  const [newTransactionCount, setNewTransactionCount] = useState(0);

  const handleNewTransaction = useCallback(
    async (event: TransactionEvent) => {
      console.log("🔔 New transaction received in Transactions screen:", {
        type: event.transaction.type,
        timestamp: event.timestamp,
      });

      if (!currentWallet?.address) {
        console.warn("No wallet address available for refresh");
        return;
      }

      try {
        // Explicitly invalidate the cache first
        await queryClient.invalidateQueries({
          queryKey: ["transactions", currentWallet.address],
          exact: true,
        });

        // Force an immediate refetch
        await queryClient.fetchQuery({
          queryKey: ["transactions", currentWallet.address],
          staleTime: 0,
        });

        console.log("✅ Transaction refresh completed");
        setNewTransactionCount((prev) => prev + 1);
      } catch (error) {
        console.error("❌ Transaction refresh failed:", error);
      }
    },
    [currentWallet?.address, queryClient],
  );

  const handleRefresh = async () => {
    if (!currentWallet) {
      console.warn("No wallet available for manual refresh");
      return;
    }

    console.log(
      `🔄 Manual Refresh Triggered for ${currentWallet.address.slice(0, 6)}`,
    );

    try {
      await queryClient.invalidateQueries({
        queryKey: ["transactions", currentWallet.address],
        exact: true,
      });

      await queryClient.fetchQuery({
        queryKey: ["transactions", currentWallet.address],
        staleTime: 0,
      });

      setNewTransactionCount(0);
      console.log("✅ Manual refresh completed");
    } catch (error) {
      console.error("❌ Manual refresh failed:", error);
    }
  };

  useEffect(() => {
    if (!currentWallet?.address) {
      console.log("No wallet address available for subscription");
      return;
    }

    console.log(
      `🎧 Setting up transaction listener for ${currentWallet.address.slice(0, 6)}`,
    );

    const subscriberId = transactionManager.subscribe(
      currentWallet.address,
      handleNewTransaction,
    );

    return () => {
      if (currentWallet?.address) {
        console.log(
          `👋 Cleaning up transaction listener for ${currentWallet.address.slice(0, 6)}`,
        );
        transactionManager.unsubscribe(currentWallet.address, subscriberId);
      }
    };
  }, [currentWallet?.address, handleNewTransaction]);

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
