// monorepo/native/mobile/comiccoin-publicfaucet/screens/FaucetPage.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import { useGetFaucet } from "../hooks/useGetFaucet";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import CoinIcon from "../components/CoinIcon";

const FaucetPage = () => {
  const router = useRouter();
  // Use the hook to fetch faucet data
  const { faucet, loading, error, refetch } = useGetFaucet({
    chainId: 1,
    enabled: true,
    refreshInterval: 60000,
  });

  // Format balance for display
  const formatBalance = (balanceStr?: string): string => {
    if (!balanceStr) return "0";
    try {
      const balance = parseInt(balanceStr);
      return balance.toLocaleString();
    } catch (e) {
      console.error("Error formatting balance:", e);
      return "0";
    }
  };

  const navigateToGetStarted = () => {
    router.push("/get-started");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header that extends to the top of the screen */}
      <LinearGradient
        colors={["#7e22ce", "#4338ca"]} // Purple to Indigo
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.safeHeader}>
          <View style={styles.headerContent}>
            <CoinIcon size={30} color="#FFD700" />
            <Text style={styles.headerTitle}>ComicCoin Faucet</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Balance Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Faucet Balance</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#7e22ce" />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetch()}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.balanceText}>
              {formatBalance(faucet?.balance)} CC
            </Text>
          )}
        </View>

        {/* Stats Cards */}
        {!loading && !error && faucet && (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {faucet.users_count.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Active Users</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {formatBalance(faucet.total_coins_distributed)}
                </Text>
                <Text style={styles.statLabel}>Coins Distributed</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {faucet.distribution_rate_per_day}/day
                </Text>
                <Text style={styles.statLabel}>Distribution Rate</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {faucet.daily_coins_reward} CC
                </Text>
                <Text style={styles.statLabel}>Daily Reward</Text>
              </View>
            </View>
          </>
        )}

        {/* About ComicCoin Section */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>About ComicCoin</Text>
          <Text style={styles.aboutText}>
            ComicCoin is an open-source blockchain platform designed for comic
            collectors and creators. We're building an accessible ecosystem that
            connects fans with their favorite comics while empowering artists
            and publishers through blockchain technology.
          </Text>
          <Text style={styles.aboutText}>
            Our Proof of Authority consensus mechanism ensures fast, efficient,
            and environmentally friendly transactions while maintaining security
            and transparency.
          </Text>
        </View>

        {/* Call to Action Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={navigateToGetStarted}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#7e22ce", "#6d28d9"]} // Purple gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <LinearGradient
          colors={["rgba(126, 34, 206, 0.1)", "rgba(126, 34, 206, 0.2)"]}
          style={styles.footer}
        >
          <View style={styles.footerContent}>
            <Text style={styles.footerText}>
              ComicCoin Network © {new Date().getFullYear()}
            </Text>
            <View style={styles.footerLinks}>
              <Text style={styles.footerLink}>Terms</Text>
              <Text style={styles.footerDot}>•</Text>
              <Text style={styles.footerLink}>Privacy</Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f3ff", // Light purple
  },
  headerGradient: {
    width: "100%",
    // The negative values ensure the gradient extends to the top of the screen
    ...(Platform.OS === "ios"
      ? { paddingTop: 0 }
      : { paddingTop: StatusBar.currentHeight }),
  },
  safeHeader: {
    width: "100%",
    paddingVertical: 32, // Increased padding for more space
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28, // Increased font size
    fontWeight: "bold",
    color: "white",
    letterSpacing: 0.5, // Added letter spacing to prevent squishing
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  coinIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 28, // Increased font size
    fontWeight: "bold",
    color: "white",
    letterSpacing: 0.5, // Added letter spacing to prevent squishing
  },
  scrollContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7e22ce", // Purple
    marginBottom: 16,
  },
  balanceText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4c1d95", // Deep purple
  },
  errorContainer: {
    alignItems: "center",
  },
  errorText: {
    color: "#ef4444", // Red
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#7e22ce", // Purple
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flex: 0.48, // Just under half to create spacing
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7e22ce", // Purple
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280", // Gray
  },
  aboutCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7e22ce", // Purple
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 15,
    color: "#4b5563", // Gray-700
    lineHeight: 22,
    marginBottom: 12,
  },
  ctaButton: {
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 16, // Increased border radius
    overflow: "hidden",
    shadowColor: "#7e22ce",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaGradient: {
    paddingVertical: 18, // Increased padding
    alignItems: "center",
  },
  ctaText: {
    color: "white",
    fontSize: 20, // Increased font size
    fontWeight: "bold",
    letterSpacing: 0.5, // Added letter spacing
  },
  footer: {
    borderRadius: 16,
    marginTop: 8,
    overflow: "hidden",
  },
  footerContent: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 15, // Increased font size
    color: "#7e22ce", // Purple
    fontWeight: "500",
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerLink: {
    fontSize: 14, // Increased font size
    color: "#7e22ce", // Purple
    opacity: 0.8,
  },
  footerDot: {
    fontSize: 14, // Increased font size
    color: "#7e22ce", // Purple
    marginHorizontal: 8, // Increased spacing
    opacity: 0.5,
  },
});

export default FaucetPage;
