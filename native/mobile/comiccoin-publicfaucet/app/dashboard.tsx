import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Clipboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";

// Helper component for the countdown section
const HeroCountdown = ({ nextClaimTime, canClaim, userName, onClaimClick }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.heroContainer}>
      <Text style={styles.welcomeTitle}>Welcome back, {userName}!</Text>
      <Text style={styles.welcomeSubtitle}>
        Track your coins and claim daily rewards
      </Text>

      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.toggleButton}
      >
        <Text style={styles.toggleText}>
          {expanded ? "Hide Timer" : "Show Timer"}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#a5b4fc"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.countdownCard}>
          {canClaim ? (
            <View style={styles.claimReady}>
              <Text style={styles.claimReadyText}>
                Your coins are ready to claim!
              </Text>
              <TouchableOpacity
                onPress={onClaimClick}
                style={styles.claimButton}
              >
                <Text style={styles.claimButtonText}>Claim Your Coins Now</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.countdownSection}>
              <Text style={styles.countdownLabel}>
                Next Claim Available In:
              </Text>
              <Text style={styles.countdownTimer}>{nextClaimTime}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Card component for displaying balances
const BalanceCard = ({ title, amount, icon }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.balanceAmount}>{amount} CC</Text>
      </View>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#7c3aed" />
      </View>
    </View>
  </View>
);

// Transaction Item component
const TransactionItem = ({ amount, timestamp }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <View style={styles.transactionItem}>
      <View>
        <Text style={styles.transactionAmount}>
          {amount.toLocaleString()} CC
        </Text>
        <Text style={styles.transactionDate}>{formatDate(timestamp)}</Text>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Completed</Text>
      </View>
    </View>
  );
};

// Wallet Section component
const WalletSection = ({ walletAddress, onCopyAddress }) => (
  <View style={styles.walletCard}>
    <View style={styles.sectionHeader}>
      <Ionicons name="wallet-outline" size={20} color="white" />
      <Text style={styles.sectionTitle}>Your Wallet</Text>
    </View>

    <View style={styles.walletContent}>
      <View style={styles.qrContainer}>
        <Image
          source={{
            uri: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=ethereum:${walletAddress}`,
          }}
          style={styles.qrCode}
        />
      </View>

      <Text style={styles.walletLabel}>Receive ComicCoins at:</Text>

      <View style={styles.addressContainer}>
        <Text style={styles.walletAddress}>{walletAddress}</Text>
        <TouchableOpacity onPress={onCopyAddress} style={styles.copyButton}>
          <Ionicons name="copy-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.etherscanLink}>
        <Text style={styles.etherscanLinkText}>View on Etherscan</Text>
        <Ionicons name="open-outline" size={16} color="#7c3aed" />
      </TouchableOpacity>
    </View>
  </View>
);

// Skeleton Loader component
const SkeletonCard = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonHeader} />
    <View style={styles.skeletonBody} />
  </View>
);

// Main Dashboard Screen
export default function Dashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Fetch dashboard data using our custom hook
  const {
    dashboard,
    isLoading,
    error,
    refetch,
    timeUntilNextClaim,
    canClaimNow,
  } = useDashboard();

  // Copy wallet address function
  const copyWalletAddress = () => {
    if (!dashboard?.walletAddress) return;

    const walletAddress = dashboard.walletAddress;
    const displayAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

    Clipboard.setString(walletAddress);
    Alert.alert("Copied", `Wallet address copied: ${displayAddress}`);
  };

  // Navigate to claim coins screen
  const navigateToClaimCoins = () => {
    navigation.navigate("ClaimCoins");
  };

  // Loading state with skeletons
  if (isLoading && !dashboard) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonHero} />
          <View style={styles.cardsContainer}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
          <View style={styles.skeletonTransactions} />
        </View>
      </ScrollView>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Error Loading Dashboard</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No data state
  if (!dashboard) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#f59e0b" />
        <Text style={styles.errorTitle}>No Dashboard Data</Text>
        <Text style={styles.errorMessage}>
          Unable to retrieve your dashboard information
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => refetch()}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.retryButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const walletAddress =
    dashboard.walletAddress || "0x0000000000000000000000000000000000000000";
  const userName = user?.name || user?.first_name || "Comic Enthusiast";

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section with Countdown */}
      <HeroCountdown
        nextClaimTime={timeUntilNextClaim}
        canClaim={canClaimNow}
        userName={userName}
        onClaimClick={navigateToClaimCoins}
      />

      {/* Balance Cards */}
      <View style={styles.cardsContainer}>
        <BalanceCard
          title="Faucet Balance"
          amount={dashboard.faucetBalance.toLocaleString()}
          icon="wallet-outline"
        />

        <BalanceCard
          title="Your Balance"
          amount={dashboard.userBalance.toLocaleString()}
          icon="cash-outline"
        />

        <BalanceCard
          title="Total Claimed"
          amount={dashboard.totalCoinsClaimedByUser.toLocaleString()}
          icon="trending-up-outline"
        />
      </View>

      {/* Transactions Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="calendar-outline" size={20} color="white" />
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </View>

          {dashboard.transactions.length > 0 && (
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate("Transactions")}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionContent}>
          {dashboard.transactions.length > 0 ? (
            dashboard.transactions
              .slice(0, 5)
              .map((tx) => (
                <TransactionItem
                  key={tx.id}
                  amount={tx.amount}
                  timestamp={tx.timestamp}
                />
              ))
          ) : (
            <View style={styles.emptyTransactions}>
              <Ionicons
                name="cash-outline"
                size={40}
                color="#7c3aed"
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyMessage}>
                Your transaction history will appear here after you claim your
                first ComicCoins.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Wallet Section */}
      <WalletSection
        walletAddress={walletAddress}
        onCopyAddress={copyWalletAddress}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  heroContainer: {
    backgroundColor: "#4f46e5",
    padding: 24,
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#a5b4fc",
    textAlign: "center",
    marginBottom: 16,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  toggleText: {
    color: "#a5b4fc",
    marginRight: 4,
  },
  countdownCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  countdownSection: {
    alignItems: "center",
  },
  countdownLabel: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 8,
    fontWeight: "500",
  },
  countdownTimer: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7c3aed",
  },
  claimReady: {
    alignItems: "center",
  },
  claimReadyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 16,
  },
  claimButton: {
    backgroundColor: "#7c3aed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  claimButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  cardsContainer: {
    padding: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "600",
    color: "#7c3aed",
  },
  iconContainer: {
    backgroundColor: "#f3e8ff",
    padding: 10,
    borderRadius: 100,
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: "#7c3aed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "white",
    fontSize: 14,
    marginRight: 4,
  },
  sectionContent: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#6b7280",
  },
  statusBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statusText: {
    color: "#065f46",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyTransactions: {
    alignItems: "center",
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptyMessage: {
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  walletCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  walletContent: {
    padding: 16,
    alignItems: "center",
  },
  qrContainer: {
    width: 150,
    height: 150,
    padding: 8,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  qrCode: {
    width: "100%",
    height: "100%",
  },
  walletLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 8,
    width: "100%",
    marginBottom: 16,
  },
  walletAddress: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 12,
    color: "#374151",
  },
  copyButton: {
    padding: 8,
  },
  etherscanLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  etherscanLinkText: {
    color: "#7c3aed",
    marginRight: 4,
    fontSize: 14,
  },
  loadingContainer: {
    padding: 16,
  },
  skeletonHero: {
    backgroundColor: "#e5e7eb",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  skeletonCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  skeletonHeader: {
    backgroundColor: "#e5e7eb",
    height: 16,
    width: "30%",
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonBody: {
    backgroundColor: "#e5e7eb",
    height: 24,
    width: "50%",
    borderRadius: 4,
  },
  skeletonTransactions: {
    backgroundColor: "#e5e7eb",
    height: 300,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  refreshButton: {
    backgroundColor: "#f59e0b",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
    marginLeft: 8,
  },
});
