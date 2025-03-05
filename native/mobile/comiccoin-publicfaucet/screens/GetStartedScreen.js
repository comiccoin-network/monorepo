// screens/GetStartedScreen.js
import React from "react";
import { useRouter } from "expo-router";
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
import { Feather } from "@expo/vector-icons";

const GetStartedScreen = () => {
  const router = useRouter();

  // Use the hook to fetch faucet data
  const {
    data: faucet,
    isLoading,
    error,
  } = useGetFaucet({
    chainId: 1,
    enabled: true,
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

      <Header showBackButton={true} />

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
              onPress={() => router.push("/home")}
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
              onPress={() => router.push("/register")}
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
              onPress={() => router.push("/login")}
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

// Styles remain the same
const styles = StyleSheet.create({
  // Your existing styles
});

export default GetStartedScreen;
