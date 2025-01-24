// monorepo/native/mobile/comiccoin-wallet/app/(user)/overview.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Copy,
  RefreshCw,
  Loader,
  AlertCircle,
  Wallet as WalletIcon,
  Coins,
  Image as ImageIcon,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react-native";

import { useWallet } from "../../hooks/useWallet";
import { useAllTransactions } from "../../hooks/useAllTransactions";
import walletService from "../../services/wallet/WalletService";
// import NavigationBar from "../../components/NavigationBar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Transaction } from "../../services/transaction/ListService";
import TransactionList from "../../components/TransactionList";

// Define navigation types
type RootStackParamList = {
  Login: undefined;
  Transaction: { id: string };
  Transactions: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Main Dashboard component
const Dashboard: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    currentWallet,
    wallets,
    loadWallet,
    logout,
    loading: serviceLoading,
    error: serviceError,
  } = useWallet();
  const {
    transactions,
    loading: txloading,
    error: txerror,
    refresh: txrefresh,
    statistics,
  } = useAllTransactions(currentWallet?.address);

  const [error, setError] = useState<string | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // Check wallet session periodically
  useEffect(() => {
    const checkWalletSession = async () => {
      try {
        if (serviceLoading) return;

        if (!currentWallet) {
          navigation.navigate("Login");
          return;
        }

        if (!walletService.checkSession()) {
          throw new Error("Session expired");
        }
      } catch (error) {
        if (error instanceof Error && error.message === "Session expired") {
          handleSessionExpired();
        } else {
          setError(
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          );
        }
      }
    };

    checkWalletSession();
    const sessionCheckInterval = setInterval(checkWalletSession, 60000);

    return () => clearInterval(sessionCheckInterval);
  }, [currentWallet, serviceLoading, navigation]);

  const handleSessionExpired = useCallback(() => {
    setIsSessionExpired(true);
    logout();
    setError("Your session has expired. Please sign in again.");
    setTimeout(() => {
      navigation.navigate("Login");
    }, 3000);
  }, [logout, navigation]);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Address copied to clipboard");
  };

  // Loading state
  if (serviceLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  // Main render
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Manage your ComicCoin wallet</Text>
          </View>

          {/* Error Messages */}
          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {txerror && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#DC2626" />
              <Text style={styles.errorText}>{txerror}</Text>
            </View>
          )}

          {isSessionExpired && (
            <View style={styles.warningContainer}>
              <AlertCircle size={20} color="#D97706" />
              <Text style={styles.warningText}>
                Session expired. Redirecting to login...
              </Text>
            </View>
          )}

          {currentWallet && (
            <View style={styles.mainContent}>
              {/* Wallet Info Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconContainer}>
                    <WalletIcon size={20} color="#7C3AED" />
                  </View>
                  <Text style={styles.cardTitle}>Wallet Details</Text>
                </View>

                <View style={styles.walletDetails}>
                  <Text style={styles.walletLabel}>Wallet Address</Text>
                  <View style={styles.addressContainer}>
                    <TextInput
                      style={styles.addressInput}
                      value={currentWallet.address}
                      editable={false}
                    />
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => copyToClipboard(currentWallet.address)}
                    >
                      <Copy size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Balance Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconContainer}>
                    <WalletIcon size={20} color="#7C3AED" />
                  </View>
                  <Text style={styles.cardTitle}>Wallet Balance</Text>
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={txrefresh}
                    disabled={txloading}
                  >
                    {txloading ? (
                      <ActivityIndicator size="small" color="#6B7280" />
                    ) : (
                      <RefreshCw size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.balanceGrid}>
                  <View style={styles.balanceItem}>
                    <View style={styles.balanceHeader}>
                      <Coins size={16} color="#2563EB" />
                      <Text style={styles.balanceLabel}>CC Balance</Text>
                    </View>
                    <Text style={styles.balanceValue}>
                      {statistics?.totalCoinValue || 0}
                    </Text>
                    <Text style={styles.transactionCount}>
                      {statistics?.coinTransactionsCount || 0} transactions
                    </Text>
                  </View>
                  <View
                    style={[styles.balanceItem, { backgroundColor: "#F5F3FF" }]}
                  >
                    <View style={styles.balanceHeader}>
                      <ImageIcon size={16} color="#7C3AED" />
                      <Text style={[styles.balanceLabel, { color: "#7C3AED" }]}>
                        NFTs Owned
                      </Text>
                    </View>
                    <Text style={styles.balanceValue}>
                      {statistics?.totalNftCount || 0}
                    </Text>
                    <Text style={styles.transactionCount}>
                      {statistics?.nftTransactionsCount || 0} transactions
                    </Text>
                  </View>
                </View>
              </View>

              {/* Transactions List Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Recent Transactions</Text>
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={txrefresh}
                    disabled={txloading}
                    accessibilityLabel="Refresh transactions"
                    accessibilityState={{ busy: txloading }}
                  >
                    {txloading ? (
                      <ActivityIndicator size="small" color="#6B7280" />
                    ) : (
                      <RefreshCw size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                </View>

                {txloading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7C3AED" />
                    <Text style={styles.loadingText}>
                      Loading transactions...
                    </Text>
                  </View>
                ) : (
                  <TransactionList
                    transactions={transactions}
                    currentWalletAddress={currentWallet.address}
                    onRefresh={txrefresh}
                    isRefreshing={txloading}
                  />
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF", // Light purple background
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B21B6",
    marginBottom: 8,
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "Roboto" },
    }),
  },
  mainContent: {
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIconContainer: {
    padding: 8,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  // Wallet details styles
  walletDetails: {
    gap: 8,
  },
  walletLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4B5563",
    marginBottom: 6,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  addressInput: {
    flex: 1,
    padding: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 14,
  },
  copyButton: {
    padding: 12,
  },
  // Balance section styles
  balanceGrid: {
    flexDirection: "row",
    gap: 16,
  },
  balanceItem: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 16,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563EB",
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  transactionCount: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  refreshButton: {
    marginLeft: "auto",
    padding: 12,
  },
  // Loading and error states
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    color: "#991B1B",
    flex: 1,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#D97706",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    marginLeft: 8,
    color: "#92400E",
    flex: 1,
  },
});

export default Dashboard;
