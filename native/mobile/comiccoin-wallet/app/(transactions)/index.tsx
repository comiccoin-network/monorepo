// monorepo/native/mobile/comiccoin-wallet/app/(transactions)/index.tsx
import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useWalletTransactions } from "../../hooks/useWalletTransactions";
import { useWallet } from "../../hooks/useWallet";
import TransactionList from "../../components/TransactionList";
import { useWalletTransactionMonitor } from "../../hooks/useWalletTransactionMonitor";

export default function TransactionsList() {
  const { currentWallet } = useWallet();

  useWalletTransactionMonitor({
    walletAddress: currentWallet?.address,
    onNewTransaction: () => {
      if (currentWallet) {
        console.log(`
 💫 Transaction List Update 💫
 ================================
 🔗 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
 📊 Total Transactions: ${transactions?.length || 0}
 ⏰ Time: ${new Date().toLocaleTimeString()}
 ================================
 🔄 Refreshing transaction list...
         `);
        refresh();
      }
    },
    onConnectionStateChange: (connected) => {
      console.log(`
 ${connected ? "🌟 Transaction Monitor Active" : "⚠️ Transaction Monitor Inactive"}
 ================================
 🔗 Wallet: ${
   currentWallet?.address
     ? `${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}`
     : "No wallet"
 }
 ⏰ Time: ${new Date().toLocaleTimeString()}
 📡 Status: ${connected ? "Monitoring transactions" : "Connection lost"}
 ================================`);
    },
  });

  const { transactions, loading, error, refresh } = useWalletTransactions(
    currentWallet?.address,
  );

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
            onRefresh={refresh}
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
    backgroundColor: "#F5F3FF", // Added for consistency
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center", // Added for better centering
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F5F3FF", // Added for consistency
  },
  errorText: {
    fontSize: 16, // Added for consistency
    color: "#DC2626",
    textAlign: "center",
  },
});
