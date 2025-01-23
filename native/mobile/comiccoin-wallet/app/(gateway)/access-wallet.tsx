// monorepo/native/mobile/comiccoin-wallet/app/(gateway)/access-wallet.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { router, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Empty state component when no wallets are found
const EmptyWalletState = () => (
  <View style={styles.emptyStateContainer}>
    <View style={styles.emptyStateIconContainer}>
      <Ionicons name="wallet-outline" size={32} color="#7C3AED" />
    </View>

    <Text style={styles.emptyStateTitle}>No Wallet Found</Text>
    <Text style={styles.emptyStateDescription}>
      To start using ComicCoin, you'll need to create a new wallet or recover an
      existing one.
    </Text>

    <View style={styles.emptyStateActions}>
      <Link href="/new-wallet" asChild>
        <Pressable style={styles.createWalletButton}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createWalletButtonText}>Create New Wallet</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </Link>

      <Link href="/recover-wallet" asChild>
        <Pressable style={styles.recoverWalletButton}>
          <Ionicons name="refresh" size={20} color="#374151" />
          <Text style={styles.recoverWalletButtonText}>
            Recover Existing Wallet
          </Text>
        </Pressable>
      </Link>
    </View>

    <View style={styles.infoContainer}>
      <Ionicons name="information-circle" size={20} color="#2563EB" />
      <Text style={styles.infoText}>
        New to ComicCoin? Creating a wallet is quick and secure. Make sure to
        safely store your recovery phrase when creating a new wallet.
      </Text>
    </View>
  </View>
);

// Main security notice component
const SecurityNotice = () => (
  <View style={styles.securityNoticeContainer}>
    <Ionicons name="information-circle" size={20} color="#D97706" />
    <View style={styles.securityNoticeContent}>
      <Text style={styles.securityNoticeTitle}>Security Notice:</Text>
      <View style={styles.securityNoticeList}>
        <View style={styles.securityNoticeItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.securityNoticeText}>
            Make sure you're on the official ComicCoin app
          </Text>
        </View>
        <View style={styles.securityNoticeItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.securityNoticeText}>
            Never share your password with anyone
          </Text>
        </View>
        <View style={styles.securityNoticeItem}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.securityNoticeText}>
            ComicCoin team will never ask for your password
          </Text>
        </View>
      </View>
    </View>
  </View>
);

export default function AccessWallet() {
  const [selectedWallet, setSelectedWallet] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const hasWallets = true; // This would be determined by your wallet logic

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#F3E8FF", "#FFFFFF"]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Section */}
            <View style={styles.header}>
              <Text style={styles.title}>Access Your Wallet</Text>
              <Text style={styles.subtitle}>Login to your existing wallet</Text>
            </View>

            {/* Main Content Card */}
            <View style={styles.card}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons name="key" size={20} color="#7C3AED" />
                </View>
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.cardTitle}>Login to Wallet</Text>
                  <Text style={styles.cardSubtitle}>
                    Select your wallet and enter your password to continue.
                  </Text>
                </View>
              </View>

              {!hasWallets ? (
                <EmptyWalletState />
              ) : (
                <View style={styles.formContainer}>
                  <SecurityNotice />

                  {/* Wallet Selection */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Select Wallet</Text>
                    <Text style={styles.inputHelper}>
                      Choose the wallet you want to access
                    </Text>
                    <Pressable style={styles.select}>
                      <Text style={styles.selectText}>
                        {selectedWallet || "Select a wallet"}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#6B7280" />
                    </Pressable>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <Text style={styles.inputHelper}>
                      Enter your wallet password
                    </Text>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIconContainer}>
                        <Ionicons
                          name="key-outline"
                          size={20}
                          color="#9CA3AF"
                        />
                      </View>
                      <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your wallet password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={
                            showPassword ? "eye-off-outline" : "eye-outline"
                          }
                          size={20}
                          color="#6B7280"
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    <Pressable
                      onPress={() => router.back()}
                      style={styles.cancelButton}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={styles.accessButton}>
                      <Ionicons
                        name="log-in-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.accessButtonText}>Access Wallet</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#5B21B6",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  cardHeader: {
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardHeaderIcon: {
    backgroundColor: "#F3E8FF",
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  cardHeaderContent: {
    flex: 1, // This is crucial - it allows the content to take remaining space
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 20,
    paddingRight: 8,
  },
  formContainer: {
    padding: 20,
    gap: 24,
  },
  securityNoticeContainer: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  securityNoticeContent: {
    flex: 1,
  },
  securityNoticeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 8,
  },
  securityNoticeList: {
    gap: 4,
  },
  securityNoticeItem: {
    flexDirection: "row",
    gap: 8,
  },
  bulletPoint: {
    color: "#92400E",
  },
  securityNoticeText: {
    fontSize: 14,
    color: "#92400E",
    flex: 1,
  },
  inputContainer: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  inputHelper: {
    fontSize: 12,
    color: "#6B7280",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
    color: "#111827",
  },
  inputIconContainer: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
  },
  select: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    fontSize: 16,
    color: "#6B7280",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: "#4B5563",
    fontSize: 16,
    fontWeight: "500",
  },
  accessButton: {
    backgroundColor: "#7C3AED",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  accessButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
    margin: 24,
    borderRadius: 16,
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#F3E8FF",
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  emptyStateActions: {
    width: "100%",
    gap: 12,
  },
  createWalletButton: {
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createWalletButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  recoverWalletButton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  recoverWalletButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "500",
  },
  infoContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
  },
});
