// monorepo/native/mobile/comiccoin-wallet/app/(nft)/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { Platform, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import UserTransactionBanner from "../../components/UserTransactionBanner";
import { useWalletTransactionMonitor } from "../../hooks/useWalletTransactionMonitor";
import { useWallet } from "../../hooks/useWallet";

export default function NFTDetailLayout() {
  const router = useRouter();
  const queryClient = new QueryClient();

  // The following code will connect our open wallet with the authority and always be up-to-date with latest transactions for this wallet.
  const { currentWallet } = useWallet();
  useWalletTransactionMonitor({
    walletAddress: currentWallet?.address,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <UserTransactionBanner />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#7e22ce", // Purple background
          },
          headerTintColor: "#fff", // White text color
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerShadowVisible: false,
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
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
              {Platform.OS === "ios" && (
                <Text
                  style={{ color: "#fff", fontSize: 17, fontWeight: "600" }}
                >
                  Back
                </Text>
              )}
            </Pressable>
          ),
        }}
      >
        <Stack.Screen
          name="[cid]"
          options={{
            headerTitle: "NFT Details",
          }}
        />
        <Stack.Screen
          name="burn/index"
          options={{
            headerTitle: "Burn NFT",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="transfer/index"
          options={{
            headerTitle: "Transfer NFT",
            presentation: "modal",
          }}
        />
        {/* Customize verifysuccess/index */}
        <Stack.Screen
          name="verifysuccess/index"
          options={{
            title: "Verifying...", // Updated title
            headerLeft: () => null, // Hide the back button
            headerTitleAlign: "center", // Center the title
            headerShadowVisible: false, // Remove the shadow
            headerStyle: {
              backgroundColor: "#7e22ce", // Purple background
            },
            headerTintColor: "#fff", // White text color
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
