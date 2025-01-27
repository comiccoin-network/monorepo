// monorepo/native/mobile/comiccoin-wallet/app/(transactions)/index.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
import { useWalletTransactions } from "../../hooks/useWalletTransactions";
import { useWallet } from "../../hooks/useWallet";

export default function TransactionsList() {
  const router = useRouter();
  const { currentWallet } = useWallet();
  const { transactions, loading, error } = useWalletTransactions(
    currentWallet?.address,
  );

  const handleTransactionPress = (id: string) => {
    // Using the correct path structure for dynamic routes
    router.push({
      pathname: "/(transactions)/[id]",
      params: { id },
    });
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

  const renderTransaction = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.transactionItem,
        pressed && styles.transactionItemPressed,
      ]}
      onPress={() => handleTransactionPress(item.id)}
    >
      <View style={styles.transactionContent}>
        <View>
          <Text style={styles.transactionType}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
          <Text style={styles.transactionDate}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.transactionAmount}>{item.value} CC</Text>
          <ArrowRight size={20} color="#6B7280" />
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  listContainer: {
    padding: 16,
  },
  transactionItem: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  transactionItemPressed: {
    opacity: 0.7,
  },
  transactionContent: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  transactionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7C3AED",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
