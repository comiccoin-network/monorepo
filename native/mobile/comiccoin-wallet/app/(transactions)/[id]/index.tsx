// monorepo/native/mobile/comiccoin-wallet/app/(transactions)/[id]/index.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  Clock,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
} from "lucide-react-native";
import { useWalletTransactions } from "../../../hooks/useWalletTransactions";
import { useWallet } from "../../../hooks/useWallet";

export default function TransactionDetails() {
  const { id } = useLocalSearchParams();
  const { currentWallet } = useWallet();
  const { transactions } = useWalletTransactions(currentWallet?.address);

  const transaction = transactions.find((t) => t.id === id);
  console.log("id:", id);

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Transaction not found</Text>
      </View>
    );
  }

  const isOutgoing =
    transaction.from.toLowerCase() === currentWallet?.address.toLowerCase();
  const formattedDate = new Date(transaction.timestamp).toLocaleDateString();
  const formattedTime = new Date(transaction.timestamp).toLocaleTimeString();

  const openExplorer = async () => {
    const url = `https://explorer.comiccoin.com/tx/${transaction.id}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening explorer:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView}>
        {/* Transaction Type Header */}
        <View style={styles.header}>
          <View style={styles.typeContainer}>
            {isOutgoing ? (
              <ArrowUpRight size={24} color="#DC2626" />
            ) : (
              <ArrowDownLeft size={24} color="#059669" />
            )}
            <Text
              style={[
                styles.typeText,
                isOutgoing ? styles.sent : styles.received,
              ]}
            >
              {isOutgoing ? "Sent" : "Received"}
            </Text>
          </View>
          <Text style={styles.amount}>{transaction.value} CC</Text>
          <Text style={styles.feeText}>Network Fee: {transaction.fee} CC</Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Calendar size={20} color="#6B7280" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Clock size={20} color="#6B7280" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{formattedTime}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconContainer}>
              <Receipt size={20} color="#6B7280" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{transaction.id}</Text>
            </View>
          </View>
        </View>

        {/* View in Explorer Button */}
        <Pressable
          style={({ pressed }) => [
            styles.explorerButton,
            pressed && styles.explorerButtonPressed,
          ]}
          onPress={openExplorer}
        >
          <ExternalLink size={20} color="#7C3AED" />
          <Text style={styles.explorerButtonText}>View in Explorer</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 18,
    fontWeight: "600",
  },
  sent: {
    color: "#DC2626",
  },
  received: {
    color: "#059669",
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  feeText: {
    fontSize: 14,
    color: "#6B7280",
  },
  detailsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    gap: 16,
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
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  explorerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    margin: 16,
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
  explorerButtonPressed: {
    opacity: 0.7,
  },
  explorerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7C3AED",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
  },
});
