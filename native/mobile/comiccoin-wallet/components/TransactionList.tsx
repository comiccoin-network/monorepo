// monorepo/native/mobile/comiccoin-wallet/components/TransactionList.tsx
import React from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  Platform,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  Coins,
  Image as ImageIcon,
  Clock,
  ArrowUpRight,
} from "lucide-react-native";

// Updated props interface with optional limit
interface TransactionListProps {
  transactions: Transaction[];
  currentWalletAddress: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  limit?: number; // Optional prop to control how many transactions to show
}

const TransactionList = ({
  transactions,
  currentWalletAddress,
  onRefresh,
  isRefreshing,
  limit, // New prop
}) => {
  const router = useRouter();
  const navigation = useNavigation();

  // If limit is provided, slice the transactions, otherwise show all
  const displayedTransactions = limit
    ? transactions?.slice(0, limit)
    : transactions;

  // If there are no transactions, show the empty state
  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <ImageIcon color="#9CA3AF" size={48} style={styles.emptyStateIcon} />
        <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Get started by claiming some free ComicCoins
        </Text>
        <TouchableOpacity
          style={styles.getFreeCoinsButton}
          onPress={() =>
            Alert.alert(
              "Open External Link",
              `You'll be redirected to https://comiccoinfaucet.com in your default browser. Do you want to continue?`,
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Open",
                  onPress: async () => {
                    await Linking.openURL("https://comiccoinfaucet.com");
                  },
                },
              ],
              { cancelable: true },
            )
          }
        >
          <View style={styles.buttonContent}>
            <Coins size={16} color="white" />
            <Text style={styles.buttonText}>Get Free ComicCoins</Text>
            <ArrowUpRight size={14} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // Helper function to render transaction details based on type and direction
  const renderTransactionDetails = (tx, isSent, isNFT, isBurned) => {
    const txValue = Math.floor(Number(tx.value)) || 0;
    const txFee = Math.floor(Number(tx.fee)) || 0;

    if (isSent) {
      return (
        <View>
          {isNFT ? (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Non-Fungible Token:</Text>
                <Text style={styles.nftId}>
                  Token ID: {tx.tokenId || "Unknown"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fee Paid:</Text>
                <Text style={styles.sentAmount}>{txValue} CC</Text>
              </View>
            </>
          ) : (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sent Amount:</Text>
              <Text style={styles.sentAmount}>{txValue} CC</Text>
            </View>
          )}
          <Text style={styles.feeNote}>
            Transaction fee is included in the amount
          </Text>
        </View>
      );
    }

    return (
      <View>
        {isNFT ? (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Non-Fungible Token:</Text>
              <Text style={styles.nftId}>
                Token ID: {tx.tokenId || "Unknown"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Initial Amount:</Text>
              <Text style={styles.amount}>{txValue} CC</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Network Fee:</Text>
              <Text style={styles.feeAmount}>- {txFee} CC</Text>
            </View>
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Actually Received:</Text>
              <Text style={styles.totalAmount}>0 CC</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Initial Amount:</Text>
              <Text style={styles.amount}>{txValue} CC</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Network Fee:</Text>
              <Text style={styles.feeAmount}>- {txFee} CC</Text>
            </View>
            <View style={[styles.detailRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Actually Received:</Text>
              <Text style={styles.receivedAmount}>{txValue - txFee} CC</Text>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={["#7C3AED"]} // Android
          tintColor="#7C3AED" // iOS
        />
      }
      style={styles.transactionList}
    >
      {displayedTransactions.map((tx) => {
        const isSent =
          tx.from.toLowerCase() === currentWalletAddress.toLowerCase();
        const isBurned =
          tx.to.toLowerCase() === "0x0000000000000000000000000000000000000000";
        const isNFT = tx.type === "token";

        return (
          <TouchableOpacity
            key={tx.id || tx.hash}
            style={styles.transactionCard}
            onPress={() => {
              router.push(`/(transactions)/${tx.id}`);
            }}
          >
            <View style={styles.transactionHeader}>
              <View style={styles.transactionTypeContainer}>
                <View
                  style={[
                    styles.transactionTypeIcon,
                    isNFT
                      ? isBurned
                        ? styles.burnedIcon
                        : styles.nftIcon
                      : isSent
                        ? styles.sentIcon
                        : styles.receivedIcon,
                  ]}
                >
                  {isNFT ? (
                    <ImageIcon
                      size={20}
                      color={isBurned ? "#C2410C" : "#7C3AED"}
                    />
                  ) : (
                    <Coins size={20} color={isSent ? "#DC2626" : "#059669"} />
                  )}
                </View>
                <View>
                  <Text
                    style={[
                      styles.transactionType,
                      isNFT
                        ? isBurned
                          ? styles.burnedText
                          : styles.nftText
                        : isSent
                          ? styles.sentText
                          : styles.receivedText,
                    ]}
                  >
                    {isBurned
                      ? `Burned ${isNFT ? "NFT" : "Coins"}`
                      : `${isSent ? "Sent" : "Received"} ${isNFT ? "NFT" : "Coins"}`}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{tx.status}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.timestampContainer}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.timestamp}>
                  {new Date(tx.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.transactionDetails}>
              {renderTransactionDetails(tx, isSent, isNFT, isBurned)}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Only show "View All" button if we're limiting results and there are more to show */}
      {limit && transactions.length > limit && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => {
            router.push(`/(transactions)`);
          }}
        >
          <Text style={styles.viewAllText}>
            View All Transactions ({transactions.length})
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  transactionList: {
    flex: 1,
  },
  transactionCard: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    overflow: "hidden",
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  transactionTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transactionTypeIcon: {
    padding: 8,
    borderRadius: 8,
  },
  sentIcon: {
    backgroundColor: "#FEE2E2",
  },
  receivedIcon: {
    backgroundColor: "#ECFDF5",
  },
  nftIcon: {
    backgroundColor: "#F5F3FF",
  },
  burnedIcon: {
    backgroundColor: "#FFEDD5",
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "500",
  },
  sentText: {
    color: "#DC2626",
  },
  receivedText: {
    color: "#059669",
  },
  nftText: {
    color: "#7C3AED",
  },
  burnedText: {
    color: "#C2410C",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#EFF6FF",
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2563EB",
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#6B7280",
  },
  transactionDetails: {
    padding: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: "#4B5563",
  },
  amount: {
    fontSize: 14,
    color: "#111827",
  },
  sentAmount: {
    fontSize: 14,
    color: "#DC2626",
  },
  feeAmount: {
    fontSize: 14,
    color: "#DC2626",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 4,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  receivedAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#059669",
  },
  nftId: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7C3AED",
  },
  feeNote: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  viewAllButton: {
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#7C3AED",
  },
  // Empty state styles
  emptyState: {
    alignItems: "center",
    padding: 24,
  },
  emptyStateIcon: {
    marginBottom: 8,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  getFreeCoinsButton: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});

// Export the component and its props type for reuse
export type { TransactionListProps };
export default TransactionList;
