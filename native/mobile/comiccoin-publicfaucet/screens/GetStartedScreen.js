import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGetFaucet } from "../api/endpoints/faucetApi";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Import icons from your preferred icon library
// React Native doesn't have Lucide, so we'll use an equivalent
// Example using @expo/vector-icons
import { Feather } from "@expo/vector-icons";

const GetStartedScreen = ({ navigation }) => {
  // Use the hook to fetch faucet data
  const {
    data: faucet,
    isLoading,
    error,
  } = useGetFaucet({
    chainId: 1,
    enabled: true,
    // React Query in React Native still supports refetch intervals
    refetchInterval: 60000,
  });

  // Format balance for display
  const formatBalance = (balanceStr) => {
    if (!balanceStr) return "0";
    try {
      const balance = parseInt(balanceStr);
      return balance.toLocaleString();
    } catch (e) {
      console.error("Error formatting balance:", e);
      return "0";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4c1d95" />

      <Header showBackButton={true} navigation={navigation} />

      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={["#4f46e5", "#4338ca"]}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Welcome to ComicCoin Faucet</Text>
            <Text style={styles.heroSubtitle}>
              Join our community of comic collectors and creators today and get
              free ComicCoins!
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.heroButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.mainContent}>
          <Text style={styles.sectionTitle}>Choose Your Path</Text>

          <View style={styles.cardsContainer}>
            {/* Registration Card */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Register")}
            >
              <View style={styles.iconContainer}>
                <Feather name="user-plus" size={28} color="#7c3aed" />
              </View>
              <Text style={styles.cardTitle}>New to ComicCoin?</Text>
              <Text style={styles.cardText}>
                Create your ComicCoin Network account to join our community of
                comic enthusiasts. Get access to exclusive features and claim
                your daily ComicCoins.
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAction}>Register Now</Text>
                <Feather name="arrow-right" size={18} color="#7c3aed" />
              </View>
            </TouchableOpacity>

            {/* Login Card */}
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Login")}
            >
              <View style={styles.iconContainer}>
                <Feather name="log-in" size={28} color="#7c3aed" />
              </View>
              <Text style={styles.cardTitle}>Already Have an Account?</Text>
              <Text style={styles.cardText}>
                Sign in with your existing credentials to continue your journey.
                Access your collections and claim your daily rewards.
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAction}>Sign In</Text>
                <Feather name="arrow-right" size={18} color="#7c3aed" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Footer
        isLoading={isLoading}
        error={error}
        faucet={faucet}
        formatBalance={formatBalance}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f3ff", // light purple background similar to from-purple-100 to-white
  },
  scrollView: {
    flex: 1,
  },
  heroBanner: {
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  heroContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#e0e7ff", // indigo-100
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  heroButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  heroButtonText: {
    color: "#4f46e5", // indigo-600
    fontWeight: "bold",
    fontSize: 16,
  },
  mainContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6b21a8", // purple-800
    textAlign: "center",
    marginBottom: 24,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#f3e8ff", // purple-100
  },
  iconContainer: {
    backgroundColor: "#f9f5ff", // purple-50
    alignSelf: "center",
    padding: 16,
    borderRadius: 9999,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b21a8", // purple-800
    textAlign: "center",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: "#4b5563", // gray-600
    textAlign: "center",
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cardAction: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7c3aed", // purple-600
    marginRight: 8,
  },
});

export default GetStartedScreen;
