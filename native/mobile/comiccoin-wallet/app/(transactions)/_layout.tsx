// monorepo/native/mobile/comiccoin-wallet/app/(transactions)/_layout.tsx
import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { Platform, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import UserTransactionBanner from "../../components/UserTransactionBanner";
import { useWallet } from "../../hooks/useWallet";
import { walletTransactionEventEmitter } from "../../utils/eventEmitter";

// Create a stable QueryClient instance outside the component to maintain consistent caching
// This prevents recreation of the client on every render and maintains our cache state
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Consider data stale immediately so we can update as soon as new transactions arrive
      staleTime: 0,
      // Keep unused data in cache for 5 minutes
      cacheTime: 1000 * 60 * 5,
      // Retry failed requests 3 times before showing error
      retry: 3,
      // Show stale data while revalidating
      refetchOnWindowFocus: true,
    },
  },
});

export default function TransactionsLayout() {
  const router = useRouter();
  const { currentWallet } = useWallet();

  // Set up event listener to handle new transactions and cache invalidation
  useEffect(() => {
    if (!currentWallet?.address) return;

    const handleNewTransaction = async (data: {
      walletAddress: string;
      transaction: any;
    }) => {
      // Only handle transactions for the current wallet
      if (currentWallet.address === data.walletAddress) {
        console.log(`
🔄 New Transaction Detected in Layout 🔄
================================
🔗 Wallet: ${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}
⏰ Time: ${new Date().toLocaleTimeString()}
🔄 Invalidating queries...
================================`);

        // Invalidate queries and trigger refetch for this wallet's transactions
        await queryClient.invalidateQueries({
          queryKey: ["transactions", currentWallet.address],
          // Ensure we refetch active queries immediately
          refetchType: "active",
        });
      }
    };

    // Set up event listener for new transactions
    walletTransactionEventEmitter.on("newTransaction", handleNewTransaction);

    // Cleanup event listener when component unmounts or wallet changes
    return () => {
      walletTransactionEventEmitter.off("newTransaction", handleNewTransaction);
    };
  }, [currentWallet?.address]); // Only re-run if wallet address changes

  return (
    <QueryClientProvider client={queryClient}>
      {/* Transaction notification banner - shows new transaction alerts */}
      <UserTransactionBanner />

      {/* Navigation stack configuration */}
      <Stack
        screenOptions={{
          // Style the header with a purple theme
          headerStyle: {
            backgroundColor: "#7e22ce",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerShadowVisible: false,
          // Custom back button that adapts to platform conventions
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                paddingVertical: 8,
                paddingHorizontal: Platform.OS === "ios" ? 8 : 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              })}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
              {/* Show "Back" text only on iOS, following platform conventions */}
              {Platform.OS === "ios" && (
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 17,
                    fontWeight: "600",
                  }}
                >
                  Back
                </Text>
              )}
            </Pressable>
          ),
        }}
      >
        {/* Transaction detail screen */}
        <Stack.Screen
          name="[id]/index"
          options={{
            headerTitle: "Transaction Detail",
            // Adding animation for smooth transitions
            animation: Platform.OS === "ios" ? "default" : "slide_from_right",
          }}
        />

        {/* Main transactions list screen */}
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "Transactions",
            // Prevent going back from the main transactions list
            headerBackVisible: false,
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}

// Styles for components that aren't controlled by the Stack navigator
const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    padding: 8,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    color: "#7C3AED",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
});
