// monorepo/native/mobile/comiccoin-publicfaucet/app/get-started.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function GetStarted() {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={["#7e22ce", "#4338ca"]} // Purple to Indigo
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.safeHeader}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Get Started</Text>
          <View style={styles.placeholderView} />
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <SafeAreaView style={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Join ComicCoin Network</Text>
          <Text style={styles.description}>
            Follow these steps to start collecting your ComicCoins:
          </Text>

          <View style={styles.step}>
            <View style={styles.stepNumberContainer}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Download the Wallet</Text>
              <Text style={styles.stepDescription}>
                Get the ComicCoin Wallet app to securely store your coins.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumberContainer}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Create an Account</Text>
              <Text style={styles.stepDescription}>
                Sign up with your email and set a secure password.
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumberContainer}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Claim Your Coins</Text>
              <Text style={styles.stepDescription}>
                Enter your wallet address to receive daily coins from the
                faucet.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button}>
            <LinearGradient
              colors={["#7e22ce", "#6d28d9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Create Account</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f3ff",
  },
  headerGradient: {
    width: "100%",
  },
  safeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: "white",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  placeholderView: {
    width: 50, // To balance the header
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4c1d95",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
  },
  step: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-start",
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#7e22ce",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    marginTop: 2,
  },
  stepNumber: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4c1d95",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  button: {
    marginTop: 32,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#7e22ce",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
