import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import AppHeader from "../components/AppHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Get device dimensions for responsive layout
const { width, height } = Dimensions.get("window");
const isSmallDevice = height < 700; // iPhone SE or similar
const isLargeDevice = height > 812; // iPhone Pro Max models

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

// Balance Card component with icon
const BalanceCard = ({ title, amount, iconName }) => (
  <View style={styles.balanceCard}>
    <View>
      <Text style={styles.balanceTitle}>{title}</Text>
      <Text style={styles.balanceAmount}>
        <Text style={styles.balanceValue}>{amount}</Text> CC
      </Text>
    </View>
    <View style={styles.iconContainer}>
      {iconName === "wallet-outline" ? (
        <Ionicons name="wallet-outline" size={24} color="#8347FF" />
      ) : iconName === "cash-outline" ? (
        <Ionicons name="cash-outline" size={24} color="#8347FF" />
      ) : (
        <Ionicons name="trending-up-outline" size={24} color="#8347FF" />
      )}
    </View>
  </View>
);

// Dynamic Countdown Component with seconds
const CountdownTimer = ({ nextClaimTime }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });

  useEffect(() => {
    // Calculate initial time difference
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const claimTime = new Date(nextClaimTime).getTime();
      const difference = Math.max(0, claimTime - now);

      // If the difference is 0, return all zeros
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
      }

      // Calculate hours, minutes, and seconds
      const totalSeconds = Math.floor(difference / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return { hours, minutes, seconds, totalSeconds };
    };

    // Set initial time
    setTimeRemaining(calculateTimeRemaining());

    // Set up interval to update every second
    const timerId = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining();
      setTimeRemaining(newTimeRemaining);

      // If countdown reaches 0, clear the interval
      if (newTimeRemaining.totalSeconds <= 0) {
        clearInterval(timerId);
      }
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(timerId);
  }, [nextClaimTime]);

  // Format the display
  const formatNumber = (num) => num.toString().padStart(2, "0");

  return (
    <View style={styles.countdownContainer}>
      <Text style={styles.countdownLabel}>Next claim available in:</Text>
      <Text style={styles.countdownValue}>
        {timeRemaining.hours > 0 ? `${timeRemaining.hours}h ` : ""}
        {formatNumber(timeRemaining.minutes)}m{" "}
        {formatNumber(timeRemaining.seconds)}s
      </Text>
    </View>
  );
};

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Get safe area insets for iOS
  const { user } = useAuth();
  const userName = user?.first_name || user?.name || "ComicCoin User";

  const [refreshing, setRefreshing] = useState(false);

  // Use our dashboard hook
  const { dashboard, isLoading, error, refetch, canClaimNow } = useDashboard();

  // Memoize the refresh function to prevent unnecessary rerenders
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      // Add a slight delay for better UX
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    }
  }, [refetch]);

  // Navigate to claim screen
  const handleClaimPress = useCallback(() => {
    router.push("/(tabs-dashboard)/claim");
  }, [router]);

  // Loading state
  if (isLoading && !dashboard) {
    return (
      <View style={styles.container}>
        <AppHeader title="Dashboard" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8347FF" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <View style={styles.container}>
        <AppHeader title="Dashboard" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={56} color="#EF4444" />
          <Text style={styles.errorTitle}>Couldn't load dashboard</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refetch}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    <View style={styles.container}>
      <AppHeader title="Dashboard" />

      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          // Add bottom padding for safe area
          {
            paddingBottom: Math.max(
              styles.contentContainer.paddingBottom,
              insets.bottom + 20,
            ),
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#8347FF"]}
            tintColor="#8347FF" // iOS refresh control color
          />
        }
        showsVerticalScrollIndicator={false}
        bounces={true} // Enable natural iOS bounce behavior
        contentInsetAdjustmentBehavior="automatic" // iOS-specific scroll behavior
      >
        {/* Hero section with welcome message and claim button */}
        <View
          style={[styles.heroSection, isSmallDevice && styles.heroSectionSmall]}
        >
          <LinearGradient
            colors={["#8347FF", "#4338ca"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.welcomeSection}>
              <Text
                style={[
                  styles.welcomeTitle,
                  isSmallDevice && styles.welcomeTitleSmall,
                ]}
              >
                Welcome back, {userName}!
              </Text>
              <Text
                style={[
                  styles.welcomeSubtitle,
                  isSmallDevice && styles.welcomeSubtitleSmall,
                ]}
              >
                Track your coins and claim daily rewards
              </Text>
            </View>

            {canClaimNow ? (
              <View style={styles.claimButtonContainer}>
                <TouchableOpacity
                  style={styles.claimButton}
                  onPress={handleClaimPress}
                  activeOpacity={0.7} // Better iOS touch feedback
                >
                  <Text style={styles.claimButtonText}>
                    Claim Your Coins Now
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#8347FF" />
                </TouchableOpacity>
              </View>
            ) : (
              <CountdownTimer nextClaimTime={dashboard?.nextClaimTime} />
            )}
          </LinearGradient>
        </View>

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
                onPress={() => router.push("/(tabs)/transactions")}
                activeOpacity={0.7} // Better iOS touch feedback
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }} // Increase touch target
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
        <View
          style={[
            styles.bottomSpacer,
            { height: Platform.OS === "ios" ? 20 + insets.bottom : 80 },
          ]}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 80, // Base padding, will be adjusted for iOS safe area
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
    fontWeight: Platform.OS === "ios" ? "500" : "400", // Slightly heavier font for iOS
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
    minHeight: 44, // iOS minimum touch target
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },

  // Hero section styles
  heroSection: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heroSectionSmall: {
    marginTop: 12,
  },
  heroGradient: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeTitleSmall: {
    fontSize: 20,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  welcomeSubtitleSmall: {
    fontSize: 14,
  },
  claimButtonContainer: {
    alignItems: "center",
  },
  claimButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
    width: "100%",
    maxWidth: 300,
    minHeight: 48, // iOS minimum touch target
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  claimButtonText: {
    color: "#8347FF",
    fontWeight: "bold",
    fontSize: 18,
    marginRight: 8,
  },
  countdownContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  countdownLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  countdownValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    fontVariant: ["tabular-nums"], // Monospaced numbers for countdown
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
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
    paddingVertical: 4,
    paddingHorizontal: 8,
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
    fontSize: Platform.OS === "ios" ? 14 : 13, // Slightly larger text for iOS
  },
  bottomSpacer: {
    height: 80, // Will be adjusted for iOS devices with notches
  },
});
