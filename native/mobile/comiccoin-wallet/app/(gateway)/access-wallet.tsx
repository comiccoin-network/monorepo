// monorepo/native/mobile/comiccoin-wallet/app/(gateway)/access-wallet.tsx
import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { router, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dropdown } from "react-native-element-dropdown";

import { useWallet } from "../../hooks/useWallet";

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
  const {
    wallets,
    loadWallet,
    loading: serviceLoading,
    error: serviceError,
  } = useWallet();

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Now we can safely use formatDate in the walletOptions transformation
  const walletOptions = wallets.map((wallet) => ({
    label: `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)} - Last accessed: ${formatDate(wallet.lastAccessed)}`,
    value: wallet.id,
  }));

  // When wallets are loaded, select the first one by default
  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets]);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!selectedWalletId) {
        throw new Error("Please select a wallet");
      }
      if (!password) {
        throw new Error("Please enter your password");
      }

      await loadWallet(selectedWalletId, password);
      router.replace("/overview");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (wallets.length === 0 && !serviceLoading) {
    return <EmptyWalletState />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Accessing your wallet...</Text>
          </View>
        </View>
      )}
      <LinearGradient colors={["#F3E8FF", "#FFFFFF"]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Access Your Wallet</Text>
              <Text style={styles.subtitle}>Login to your existing wallet</Text>
            </View>

            {(error || serviceError) && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <View style={styles.errorContent}>
                  <Text style={styles.errorText}>{error || serviceError}</Text>
                </View>
              </View>
            )}

            <View style={styles.card}>
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

              <View style={styles.formContainer}>
                <SecurityNotice />

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Select Wallet</Text>
                  <Text style={styles.inputHelper}>
                    Choose the wallet you want to access
                  </Text>
                  <Dropdown
                    style={[styles.dropdown, styles.select]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={walletOptions}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Select a wallet"
                    value={selectedWalletId}
                    onChange={(item) => setSelectedWalletId(item.value)}
                    disable={isLoading || serviceLoading}
                    renderLeftIcon={() => (
                      <Ionicons
                        name="wallet-outline"
                        size={20}
                        color="#9CA3AF"
                        style={styles.dropdownIcon}
                      />
                    )}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <Text style={styles.inputHelper}>
                    Enter your wallet password
                  </Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIconContainer}>
                      <Ionicons name="key-outline" size={20} color="#9CA3AF" />
                    </View>
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your wallet password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      editable={!isLoading && !serviceLoading}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                      disabled={isLoading || serviceLoading}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#6B7280"
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <Pressable
                    onPress={() => router.back()}
                    style={styles.cancelButton}
                    disabled={isLoading || serviceLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleLogin}
                    style={[
                      styles.accessButton,
                      (isLoading || serviceLoading) && styles.buttonDisabled,
                    ]}
                    disabled={isLoading || serviceLoading}
                  >
                    {isLoading || serviceLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons
                          name="log-in-outline"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.accessButtonText}>
                          Access Wallet
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... (keeping all existing styles)
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
    flex: 1,
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
  // New dropdown-specific styles
  dropdown: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  dropdownIcon: {
    marginRight: 8,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#111827",
  },
  // Additional existing styles...
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  errorContent: {
    flex: 1,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // ... (rest of the existing styles)
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
  loadingOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    width: "80%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
    marginTop: 12,
  },
});
