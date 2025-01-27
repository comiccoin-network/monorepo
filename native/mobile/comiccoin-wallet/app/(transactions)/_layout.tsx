// monorepo/native/mobile/comiccoin-wallet/app/(transactions)/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { Platform, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function TransactionsLayout() {
  const router = useRouter();
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
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
          name="[id]/index"
          options={{
            headerTitle: "NFT Details",
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "Transactions",
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}

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
