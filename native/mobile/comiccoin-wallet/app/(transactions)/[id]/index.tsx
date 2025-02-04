// monorepo/native/mobile/comiccoin-wallet/app/(transactions)/[id]/index.tsx
import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useBlockTransaction } from "../../../hooks/useBlockTransactionByNonce";

const TransactionDetails: React.FC = () => {
  const { id } = useLocalSearchParams();

  // Add validation for the transaction ID
  const isValidTransactionId = React.useMemo(() => {
    if (!id) return false;

    // Check if id is numeric
    const numericId = Number(id);
    if (isNaN(numericId)) return false;

    // Ensure it's a positive integer
    return Number.isInteger(numericId) && numericId > 0;
  }, [id]);

  // Early return with error UI if ID is invalid
  if (!isValidTransactionId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Invalid transaction ID format. Please check the URL and try again.
        </Text>
      </View>
    );
  }

  const { blockTxData, isBlockTxLoading, blockTxError } = useBlockTransaction(
    id as string,
  );

  // Log states for debugging
  console.log("Transaction Details States:", {
    id,
    isValidId: isValidTransactionId,
    hasData: !!blockTxData,
    isLoading: isBlockTxLoading,
    error: blockTxError?.message,
  });

  if (isBlockTxLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (blockTxError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error loading transaction: {blockTxError.message}
        </Text>
      </View>
    );
  }

  if (!blockTxData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          No transaction data found. The transaction might not exist or has been
          removed.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Transaction Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{blockTxData.type}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>From:</Text>
          <Text style={styles.value}>{blockTxData.from}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>To:</Text>
          <Text style={styles.value}>{blockTxData.to}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Value:</Text>
          <Text style={styles.value}>{blockTxData.value} CC</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Fee:</Text>
          <Text style={styles.value}>{blockTxData.fee} CC</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Timestamp:</Text>
          <Text style={styles.value}>
            {new Date(blockTxData.timestamp * 1000).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F3FF",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: "#6B7280",
  },
  value: {
    flex: 2,
    fontSize: 16,
    color: "#111827",
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
    textAlign: "center",
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default TransactionDetails;
