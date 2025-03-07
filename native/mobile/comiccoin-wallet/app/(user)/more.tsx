// monorepo/native/mobile/comiccoin-wallet/app/(user)/more.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  ScrollView,
  Linking,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import {
  History,
  Droplets,
  ExternalLink,
  LogOut,
  Trash2,
} from "lucide-react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useWallet } from "../../hooks/useWallet";
import { transactionManager } from "../../services/transaction/TransactionManager";
import type { TransactionEvent } from "../../services/transaction/TransactionManager";
// import { BackgroundFetchDebugger } from "../../components/BackgroundFetchDebugger";

interface MenuOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  route?: string;
  description: string;
  isExternal?: boolean;
  onPress?: () => void;
  badge?: number;
}

export default function More() {
  const router = useRouter();
  const { logout, deleteWallet, currentWallet, wallets } = useWallet();
  const [newTransactionCount, setNewTransactionCount] = useState(0);

  // Handle new transactions
  const handleNewTransaction = useCallback((event: TransactionEvent) => {
    console.log("🔔 New transaction received in More screen:", {
      type: event.transaction.type,
      timestamp: event.timestamp,
    });

    // Increment transaction count for badge
    setNewTransactionCount((prev) => prev + 1);
  }, []);

  // Set up transaction subscription
  useEffect(() => {
    if (!currentWallet?.address) {
      console.log("👻 No wallet available for transaction monitoring");
      return;
    }

    console.log("🎯 Setting up transaction monitoring in More screen", {
      address: currentWallet.address.slice(0, 6),
    });

    const subscriberId = transactionManager.subscribe(
      currentWallet.address,
      handleNewTransaction,
    );

    return () => {
      console.log("🧹 Cleaning up transaction subscription in More screen");
      if (currentWallet?.address) {
        transactionManager.unsubscribe(currentWallet.address, subscriberId);
      }
    };
  }, [currentWallet?.address, handleNewTransaction]);

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out from your wallet?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🚪 Initiating sign out");
              await logout();
              router.replace("/");
            } catch (error) {
              console.log("❌ Sign out failed:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Reset transaction count when navigating to transactions
  const handleTransactionsPress = useCallback(() => {
    setNewTransactionCount(0);
    router.push("/(transactions)/");
  }, [router]);

  const handleDeleteWallet = () => {
    if (!currentWallet?.address) return;

    Alert.alert(
      "Delete Wallet",
      "Warning: This will permanently delete this wallet and all its data. You will be signed out. Make sure you have your recovery phrase saved before proceeding. Do you want to continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Wallet",
          style: "destructive",
          onPress: async () => {
            try {
              const walletToDelete = wallets.find(
                (w) =>
                  w.address.toLowerCase() ===
                  currentWallet.address.toLowerCase(),
              );
              if (!walletToDelete?.id) {
                throw new Error("Wallet not found");
              }
              await deleteWallet(walletToDelete.id);
              router.replace("/");
            } catch (error) {
              console.log("❌ Wallet deletion failed:", error);
              Alert.alert(
                "Error",
                "Failed to delete wallet. Please try again.",
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const menuOptions: MenuOption[] = [
    {
      id: "transactions",
      title: "Transactions",
      icon: <History size={24} color="#7C3AED" />,
      description: "View your transaction history",
      badge: newTransactionCount,
      onPress: handleTransactionsPress,
    },
    {
      id: "faucet",
      title: "ComicCoin Faucet",
      icon: <Droplets size={24} color="#7C3AED" />,
      route: "https://comiccoinfaucet.com",
      description: "Get free coins for your wallet",
      isExternal: true,
    },
    {
      id: "delete-wallet",
      title: "Delete Wallet",
      icon: <Trash2 size={24} color="#DC2626" />,
      description: "Permanently delete this wallet",
      onPress: handleDeleteWallet,
    },
    {
      id: "signout",
      title: "Sign Out",
      icon: <LogOut size={24} color="#DC2626" />,
      description: "Sign out from your wallet",
      onPress: handleSignOut,
    },
  ];

  const handleOptionPress = async (option: MenuOption) => {
    if (option.onPress) {
      option.onPress();
    } else if (option.isExternal) {
      Alert.alert(
        "Open External Link",
        `You'll be redirected to ${option.route} in your default browser. Do you want to continue?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Open",
            onPress: async () => {
              try {
                console.log("🌐 Opening external link:", option.route);
                const supported = await Linking.canOpenURL(option.route!);
                if (supported) {
                  await Linking.openURL(option.route!);
                } else {
                  Alert.alert("Error", "Cannot open this URL");
                }
              } catch (error) {
                console.log("❌ Failed to open link:", error);
                Alert.alert("Error", "Failed to open the link");
              }
            },
          },
        ],
        { cancelable: true },
      );
    }
  };

  const MenuCard = ({ children, isSignOut = false }) => (
    <View style={[styles.menuCard, isSignOut && styles.signOutCard]}>
      {children}
    </View>
  );
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>More Options</Text>
            <Text style={styles.headerSubtitle}>
              Access additional features and settings
            </Text>
          </View>
          {/*
          <BackgroundFetchDebugger />
          */}
          <View style={styles.grid}>
            {menuOptions.map((option) => (
              <MenuCard key={option.id} isSignOut={option.id === "signout"}>
                <Pressable
                  onPress={() => handleOptionPress(option)}
                  android_ripple={{
                    color:
                      option.id === "signout"
                        ? "rgba(220, 38, 38, 0.1)"
                        : "rgba(124, 58, 237, 0.1)",
                  }}
                  style={({ pressed }) => [
                    styles.pressable,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <View
                      style={[
                        styles.iconContainer,
                        option.id === "signout" && styles.signOutIcon,
                      ]}
                    >
                      {option.icon}
                    </View>
                    {option.isExternal && (
                      <View style={styles.externalBadge}>
                        <ExternalLink size={12} color="#6B7280" />
                        <Text style={styles.externalBadgeText}>
                          External Link
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.itemTitle,
                      option.id === "signout" && styles.signOutText,
                    ]}
                  >
                    {option.title}
                  </Text>
                  <Text style={styles.itemDescription}>
                    {option.description}
                  </Text>
                </Pressable>
              </MenuCard>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B21B6",
    marginBottom: 8,
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "Roboto",
      },
    }),
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    ...Platform.select({
      ios: {
        fontFamily: "System",
      },
      android: {
        fontFamily: "Roboto",
      },
    }),
  },
  grid: {
    padding: 16,
    gap: 16,
  },

  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: "#F3E8FF",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  externalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  externalBadgeText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  signOutItem: {
    borderWidth: 1,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
  },
  signOutIcon: {
    backgroundColor: "#FEE2E2",
  },
  signOutText: {
    color: "#DC2626",
  },
  menuCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
      },
    }),
  },
  signOutCard: {
    ...Platform.select({
      android: {
        borderWidth: 1,
        backgroundColor: "#FEF2F2",
        borderColor: "#FEE2E2",
      },
      ios: {
        backgroundColor: "#FEF2F2",
      },
    }),
  },
  pressable: {
    padding: 16,
  },
});
