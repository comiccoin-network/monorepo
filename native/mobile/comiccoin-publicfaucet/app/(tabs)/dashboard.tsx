import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useDashboard } from "../../hooks/useDashboard";

// Hero section with welcome and countdown
const HeroSection = ({
  userName,
  canClaim,
  timeUntilNextClaim,
  onClaimPress,
}) => {
  const [showTimer, setShowTimer] = useState(true);

  return (
    <View style={styles.heroContainer}>
      <Text style={styles.welcomeTitle}>Welcome back, {userName}!</Text>
      <Text style={styles.welcomeSubtitle}>
        Track your coins and claim daily rewards
      </Text>

      <TouchableOpacity
        onPress={() => setShowTimer(!showTimer)}
        style={styles.timerToggle}
      >
        <Text style={styles.timerToggleText}>
          {showTimer ? "Hide Timer" : "Show Timer"}
        </Text>
        <Ionicons
          name={showTimer ? "chevron-up" : "chevron-down"}
          size={18}
          color="#a5b4fc"
        />
      </TouchableOpacity>

      {showTimer && (
        <View style={styles.timerCard}>
          {canClaim ? (
            <View style={styles.claimReadyContainer}>
              <Text style={styles.claimReadyText}>
                Your coins are ready to claim!
              </Text>
              <TouchableOpacity
                style={styles.claimButton}
                onPress={onClaimPress}
                activeOpacity={0.8}
              >
                <Text style={styles.claimButtonText}>Claim Your Coins Now</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.countdownContainer}>
              <Text style={styles.nextClaimText}>Next claim available in:</Text>
              <Text style={styles.countdownText}>{timeUntilNextClaim}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Balance Card component
const BalanceCard = ({ title, amount, iconName }) => (
  <View style={styles.balanceCard}>
    <View>
      <Text style={styles.balanceTitle}>{title}</Text>
      <Text style={styles.balanceAmount}>
        <Text style={styles.balanceValue}>{amount}</Text> CC
      </Text>
    </View>
    <View style={styles.iconContainer}>
      <Ionicons name={iconName} size={24} color="#8347FF" />
    </View>
  </View>
);

// Transaction Item component
const TransactionItem = ({ amount, date, status = "Completed" }) => (
  <View style={styles.transactionItem}>
    <View>
      <Text style={styles.transactionAmount}>{amount} CC</Text>
      <Text style={styles.transactionDate}>{date}</Text>
    </View>
    <View style={styles.statusBadge}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  </View>
);

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const userName = user?.first_name || user?.name || "ComicCoin User";

  const [refreshing, setRefreshing] = useState(false);

  // Use our dashboard hook
  const {
    dashboard,
    isLoading,
    error,
    refetch,
    timeUntilNextClaim,
    canClaimNow,
  } = useDashboard();

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Navigate to claim screen
  const handleClaimPress = () => {
    router.push("/claim");
  };

  // Loading state
  if (isLoading && !dashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8347FF" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={56} color="#EF4444" />
          <Text style={styles.errorTitle}>Couldn't load dashboard</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Format date for transactions
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
      .replace(",", ",");
  };

  // Main dashboard render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero section with welcome message and timer */}
        <HeroSection
          userName={userName}
          canClaim={canClaimNow}
          timeUntilNextClaim={timeUntilNextClaim}
          onClaimPress={handleClaimPress}
        />

        {/* Balance Cards */}
        <View style={styles.balanceCardsContainer}>
          <BalanceCard
            title="Faucet Balance"
            amount={dashboard?.faucetBalance.toString() || "0"}
            iconName="wallet-outline"
          />

          <BalanceCard
            title="Your Balance"
            amount={dashboard?.userBalance.toString() || "0"}
            iconName="cash-outline"
          />

          <BalanceCard
            title="Total Claimed"
            amount={dashboard?.totalCoinsClaimedByUser.toString() || "0"}
            iconName="trending-up-outline"
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <View style={styles.headerLeft}>
              <Ionicons name="calendar-outline" size={20} color="white" />
              <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            </View>

            {dashboard?.transactions?.length > 0 && (
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => router.push("/transactions")}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.transactionsList}>
            {dashboard?.transactions?.length > 0 ? (
              dashboard.transactions
                .slice(0, 5)
                .map((tx, index) => (
                  <TransactionItem
                    key={tx.id || index}
                    amount={tx.amount}
                    date={formatDate(tx.timestamp)}
                  />
                ))
            ) : (
              <View style={styles.emptyTransactions}>
                <Ionicons
                  name="cash-outline"
                  size={48}
                  color="#8347FF"
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No transactions yet</Text>
                <Text style={styles.emptyText}>
                  Your transaction history will appear here after you claim your
                  coins
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Space at the bottom to prevent content from being hidden by tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  contentContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 12,
  },
  errorMessage: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#8347FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },

  // Hero section styles
  heroContainer: {
    backgroundColor: "#6C47FF",
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 16,
    alignItems: "center",
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
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 16,
  },
  timerToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  timerToggleText: {
    color: "rgba(255, 255, 255, 0.8)",
    marginRight: 4,
  },
  timerCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  claimReadyContainer: {
    alignItems: "center",
  },
  claimReadyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  claimButton: {
    backgroundColor: "#8347FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    maxWidth: 280,
  },
  claimButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  countdownContainer: {
    alignItems: "center",
  },
  nextClaimText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8347FF",
  },

  // Balance cards styles
  balanceCardsContainer: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  balanceTitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 16,
    color: "#1F2937",
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8347FF",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Transactions styles
  transactionsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionsHeader: {
    backgroundColor: "#8347FF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionsTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "white",
    marginRight: 4,
    fontSize: 14,
  },
  transactionsList: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  statusBadge: {
    backgroundColor: "#D1FAE5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  statusText: {
    color: "#065F46",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyTransactions: {
    alignItems: "center",
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
  },
  bottomSpacer: {
    height: 80, // Additional space to account for the tab bar
  },
});
