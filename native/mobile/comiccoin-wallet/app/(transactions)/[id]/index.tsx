// monorepo/native/mobile/comiccoin-wallet/app/(transactions)/[id]/index.tsx
import React, { useEffect } from "react";
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
  Hash,
  Blocks,
  Link,
  Trophy,
  Settings,
  Database,
  Shield,
  Key,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import type {
  BlockData,
  BlockHeader,
  Transaction,
  Validator,
} from "../../../services/blockdata/BlockDataViaTransactionNonceService";
import { useBlockDataViaTransactionNonce } from "../../../hooks/useBlockDataViaTransactionNonce";
import { useWallet } from "../../../hooks/useWallet";
import { useNFTMetadata } from "../../../hooks/useNFTMetadata";
import { formatBytes, base64ToHex } from "../../../utils/byteUtils";

export default function TransactionDetails() {
  console.log("🏗️ Initializing Transaction Details View");

  const { id } = useLocalSearchParams();
  const { currentWallet } = useWallet();

  console.log("📝 Transaction Details Parameters:", {
    id,
    hasWallet: !!currentWallet,
    walletPreview: currentWallet?.address
      ? `${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}`
      : "none",
  });

  const { blockData, loading, error } = useBlockDataViaTransactionNonce(
    id as string,
  );

  const transaction = blockData?.trans?.find((tx: Transaction) => {
    const found =
      tx.nonce_string === id ||
      base64ToHex(tx.nonce_bytes || "") === id ||
      tx.timestamp.toString() === id;

    if (found) {
      console.log("🎯 Found matching transaction:", {
        type: tx.type,
        timestamp: tx.timestamp,
        value: tx.value,
        nonce: tx.nonce_string,
      });
    }
    return found;
  });

  const { metadata: nftMetadata, loading: nftLoading } = useNFTMetadata(
    transaction?.type === "token" ? transaction.token_metadata_uri : null,
  );

  useEffect(() => {
    console.log("🔄 Transaction Details State Update:", {
      loading,
      hasError: !!error,
      transactionFound: !!transaction,
      isNFT: transaction?.type === "token",
      nftLoading,
    });
  }, [loading, error, transaction, nftLoading]);

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      console.log("📋 Copied to clipboard:", {
        textLength: text.length,
        preview: `${text.slice(0, 6)}...${text.slice(-4)}`,
      });
      Alert.alert("Copied", "Text copied to clipboard");
    } catch (error) {
      console.error("❌ Clipboard operation failed:", error);
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  const openExplorer = async () => {
    if (!transaction?.id) {
      console.warn("⚠️ Cannot open explorer - no transaction ID");
      return;
    }

    const url = `https://explorer.comiccoin.com/tx/${transaction.id}`;
    console.log("🔍 Attempting to open explorer:", {
      transactionId: `${transaction.id.slice(0, 6)}...${transaction.id.slice(-4)}`,
      url,
    });

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        console.log("✅ Explorer opened successfully");
      } else {
        console.warn("⚠️ URL scheme not supported:", { url });
      }
    } catch (error) {
      console.error("❌ Failed to open explorer:", {
        error,
        url: url.slice(0, 30) + "...",
      });
    }
  };

  if (loading) {
    console.log("⏳ Loading transaction details...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading transaction details...</Text>
      </View>
    );
  }

  if (error) {
    console.error("❌ Transaction details error:", {
      error,
      searchId: id,
    });
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={24} color="#DC2626" />
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!transaction) {
    console.warn("⚠️ Transaction not found:", {
      searchId: id,
      blockDataExists: !!blockData,
      transactionsCount: blockData?.trans?.length || 0,
    });
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

  console.log("✨ Rendering transaction details:", {
    type: transaction.type,
    isOutgoing,
    value: transaction.value,
    timestamp: `${formattedDate} ${formattedTime}`,
    isNFT: transaction.type === "token",
    hasNFTMetadata: !!nftMetadata,
  });

  // Inside your return statement before SafeAreaProvider
  console.log("🎨 Rendering transaction layout:", {
    type: transaction.type,
    hasNFTData: transaction.type === "token",
    hasAdditionalData: !!(transaction.data || transaction.data_string),
  });

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

          {/* Core Transaction Details */}
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
                  <Text style={styles.detailLabel}>Value</Text>
                  <Text
                    style={styles.detailValue}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {transaction.value} CC
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

            {/* Addresses Section */}
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
          </View>

          {/* Block Information */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Block Information</Text>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Blocks size={20} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Block Number</Text>
                <Text style={styles.detailValue}>
                  #{blockData?.header.number_string}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Settings size={20} color="#6B7280" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Network Details</Text>
                <Text style={styles.detailValue}>
                  Chain ID: {blockData?.header.chain_id} • Difficulty:{" "}
                  {blockData?.header.difficulty}
                </Text>
              </View>
            </View>
          </View>

          {/* NFT Details if applicable */}
          {transaction.type === "token" && (
            <View style={styles.detailsCard}>
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
    overflow: "hidden",
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
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
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
    overflow: "hidden",
    ...Platform.select({
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
    }),
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
    overflow: "hidden",
    ...Platform.select({
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
    }),
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
    overflow: "hidden",
    ...Platform.select({
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
    }),
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
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
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
  blockInfoSection: {
    marginBottom: 16,
  },
  rootsContainer: {
    gap: 4,
  },
  rootValue: {
    fontSize: 12,
    color: "#374151",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace" }),
  },
  validatorSection: {
    marginTop: 16,
  },
});
