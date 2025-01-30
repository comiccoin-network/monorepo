// monorepo/native/mobile/comiccoin-wallet/app/index.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useWallet } from "../hooks/useWallet";

const WalletOption = ({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) => (
  <Link href={href} asChild>
    <Pressable
      android_ripple={{
        color: "rgba(124, 58, 237, 0.1)",
        borderless: false,
        foreground: true,
      }}
    >
      {({ pressed }) => (
        <View style={styles.walletOptionWrapper}>
          <View
            style={[styles.walletOption, pressed && styles.walletOptionPressed]}
          >
            <View
              style={[
                styles.iconContainer,
                pressed && styles.iconContainerPressed,
              ]}
            >
              <Ionicons
                name={icon}
                size={24}
                color={pressed ? "#6D28D9" : "#7C3AED"}
              />
            </View>
            <View style={styles.walletOptionContent}>
              <Text style={styles.walletOptionTitle}>{title}</Text>
              <Text style={styles.walletOptionDescription}>{description}</Text>
            </View>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={pressed ? "#6D28D9" : "#7C3AED"}
            />
          </View>
        </View>
      )}
    </Pressable>
  </Link>
);

// Enhanced security item component with improved icon alignment
const SecurityItem = ({ text }: { text: string }) => (
  <View style={styles.securityItem}>
    <View style={styles.securityIconContainer}>
      <Ionicons name="shield-outline" size={20} color="#7C3AED" />
    </View>
    <Text style={styles.securityText}>{text}</Text>
  </View>
);

export default function Index() {
  // Get router for programmatic navigation
  const router = useRouter();

  // Get wallet state from useWallet hook
  const { currentWallet, loading, isInitialized } = useWallet();

  // Effect to handle automatic redirect when wallet is available
  useEffect(() => {
    // Only proceed if the wallet service is initialized and not loading
    if (isInitialized && !loading) {
      // If we have a current wallet, redirect to the overview page
      if (currentWallet) {
        router.replace("/overview");
      }
    }
  }, [currentWallet, loading, isInitialized, router]);

  // If we're still loading the wallet state, we could show a loading state
  // This prevents flash of content before redirect
  if (loading || !isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#F3E8FF", "#FFFFFF"]}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <Text style={styles.loadingText}>Loading wallet status...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // If we have no wallet or loading is complete, show the normal content
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F3E8FF", "#FFFFFF"]} style={styles.gradient}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to ComicCoin</Text>
            <Text style={styles.subtitle}>
              Choose an option below to get started with your wallet
            </Text>
          </View>

          {/* Security Information */}
          <View style={styles.securityContainer}>
            <View style={styles.securityHeader}>
              <View style={styles.securityHeaderIconContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color="#7C3AED"
                />
              </View>
              <Text style={styles.securityTitle}>
                Important Security Information
              </Text>
            </View>

            <SecurityItem text="Never share your recovery phrase or password with anyone" />
            <SecurityItem text="Always keep your recovery phrase in a safe place - you'll need it to restore your wallet" />
          </View>

          {/* Wallet Options */}
          <View style={styles.optionsContainer}>
            <WalletOption
              href="/new-wallet"
              icon="add-outline"
              title="Create New Wallet"
              description="Start fresh with a new wallet, perfect for first-time users"
            />

            <WalletOption
              href="/access-wallet"
              icon="globe-outline"
              title="Access Browser Wallet"
              description="Quick access to your wallet stored in this device"
            />

            <WalletOption
              href="/recover-wallet"
              icon="refresh-outline"
              title="Recover Existing Wallet"
              description="Restore your wallet using your recovery phrase"
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    marginTop: Platform.OS === "ios" ? 60 : 40,
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#5B21B6", // Matches web purple-800
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#6B7280", // Matches web gray-600
    lineHeight: 24,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  securityContainer: {
    backgroundColor: "#F3E8FF", // Matches web purple-50
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: "#E9D5FF", // Matches web purple-200
  },
  securityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  securityHeaderIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Matches web white/50
    padding: 12,
    borderRadius: 12,
  },
  securityTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#5B21B6", // Matches web purple-800
    flex: 1,
  },
  securityIconContainer: {
    backgroundColor: "#F3E8FF",
    padding: 8,
    borderRadius: 8,
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 16,
    color: "#7C3AED", // Matches web purple-600
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 16,
    paddingHorizontal: 1, // Add slight padding to prevent shadow clipping
  },
  walletOptionWrapper: {
    borderRadius: 24,
    backgroundColor: Platform.OS === "android" ? "#F5F3FF" : "transparent", // Very light purple background for Android
    padding: Platform.OS === "android" ? 1 : 0, // Tiny padding for the shadow effect
  },
  walletOption: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E9D5FF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        // Remove all elevation and shadow properties
        borderWidth: 2,
        borderColor: "#E9D5FF",
      },
    }),
  },
  walletOptionPressed: {
    backgroundColor: "#F9FAFB", // Slight background change when pressed
    borderColor: "#7C3AED", // Darker border when pressed
  },
  iconContainer: {
    backgroundColor: "#F3E8FF", // Matches web purple-50
    borderRadius: 16,
    padding: 12,
    marginRight: 16,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainerPressed: {
    backgroundColor: "#EDE9FE", // Slightly darker when pressed
  },
  walletOptionContent: {
    flex: 1,
    marginRight: 12,
  },
  walletOptionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827", // Matches web gray-900
    marginBottom: 6,
  },
  walletOptionDescription: {
    fontSize: 16,
    color: "#6B7280", // Matches web gray-600
    lineHeight: 24,
  },
});
