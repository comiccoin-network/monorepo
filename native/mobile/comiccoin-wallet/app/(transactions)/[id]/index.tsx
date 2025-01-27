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
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import {
  Calendar,
  Clock,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Copy,
  AlertCircle,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useBlockDataViaTransactionNonce } from "../../../hooks/useBlockDataViaTransactionNonce";
import { useWallet } from "../../../hooks/useWallet";
import { useNFTMetadata } from "../../../hooks/useNFTMetadata";
import { formatBytes, base64ToHex } from "../../../utils/byteUtils";

export default function TransactionDetails() {
  const { id } = useLocalSearchParams();
  const { currentWallet } = useWallet();
  const { blockData, loading, error } = useBlockDataViaTransactionNonce(
    id as string,
  );
  const transaction = blockData?.trans?.find(
    (tx) =>
      tx.timestamp === parseInt(id as string) ||
      tx.nonce_string === id ||
      base64ToHex(tx.nonce_bytes || "") === id,
  );

  const { metadata: nftMetadata, loading: nftLoading } = useNFTMetadata(
    transaction?.type === "token" ? transaction.token_metadata_uri : null,
  );

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Text copied to clipboard");
  };

  const openExplorer = async () => {
    const url = `https://explorer.comiccoin.com/tx/${transaction?.id}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error opening explorer:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={24} color="#DC2626" />
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={24} color="#DC2626" />
        <Text style={styles.errorText}>Transaction not found</Text>
      </View>
    );
  }

  const isOutgoing =
    transaction.from.toLowerCase() === currentWallet?.address.toLowerCase();
  const formattedDate = new Date(transaction.timestamp).toLocaleDateString();
  const formattedTime = new Date(transaction.timestamp).toLocaleTimeString();

  return (
    <SafeAreaProvider>
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
            <Text style={styles.feeText}>
              Network Fee: {transaction.fee} CC
            </Text>
          </View>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            {/* Date & Time */}
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

            {/* Transaction ID */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Receipt size={20} color="#6B7280" />
              </View>
              <View style={styles.idContainer}>
                <View>
                  <Text style={styles.detailLabel}>Transaction ID</Text>
                  <Text
                    style={styles.detailValue}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {transaction.id}
                  </Text>
                </View>
                <Pressable
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(transaction.id)}
                >
                  <Copy size={20} color="#6B7280" />
                </Pressable>
              </View>
            </View>

            {/* Addresses */}
            <View style={styles.addressSection}>
              <Text style={styles.sectionTitle}>Addresses</Text>
              <View style={styles.addressRow}>
                <Text style={styles.addressLabel}>From:</Text>
                <Pressable
                  style={styles.addressValue}
                  onPress={() => copyToClipboard(transaction.from)}
                >
                  <Text
                    style={styles.addressText}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {transaction.from}
                  </Text>
                  <Copy size={16} color="#6B7280" />
                </Pressable>
              </View>
              <View style={styles.addressRow}>
                <Text style={styles.addressLabel}>To:</Text>
                <Pressable
                  style={styles.addressValue}
                  onPress={() => copyToClipboard(transaction.to)}
                >
                  <Text
                    style={styles.addressText}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {transaction.to}
                  </Text>
                  <Copy size={16} color="#6B7280" />
                </Pressable>
              </View>
            </View>

            {/* NFT Details if applicable */}
            {transaction.type === "token" && (
              <View style={styles.nftSection}>
                <Text style={styles.sectionTitle}>NFT Details</Text>
                <View style={styles.nftDetail}>
                  <Text style={styles.nftLabel}>Token ID:</Text>
                  <Text style={styles.nftValue}>
                    {transaction.token_id_string ||
                      formatBytes(transaction.token_id_bytes)}
                  </Text>
                </View>
                {nftLoading ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
                ) : nftMetadata ? (
                  <View style={styles.metadataContainer}>
                    <Text style={styles.metadataLabel}>Metadata:</Text>
                    <Text style={styles.metadataText}>
                      {JSON.stringify(nftMetadata.metadata, null, 2)}
                    </Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          {/* Explorer Button */}
          {/*
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
          */}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
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
    gap: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
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
  idContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  copyButton: {
    padding: 8,
  },
  addressSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: "#6B7280",
    width: 50,
  },
  addressValue: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  nftSection: {
    gap: 8,
  },
  nftDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nftLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  nftValue: {
    fontSize: 14,
    color: "#111827",
    flex: 1,
  },
  metadataContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
  },
  metadataLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 12,
    color: "#111827",
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
});
