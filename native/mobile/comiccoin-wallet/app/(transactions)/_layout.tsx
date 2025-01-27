// monorepo/native/mobile/comiccoin-wallet/app/(transactions)/_layout.tsx
import { Stack, useRouter } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { ChevronLeft } from "lucide-react-native";

export default function TransactionsLayout() {
  const queryClient = new QueryClient();
  const router = useRouter();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Transactions",
            headerShown: true,
            headerLeft: () => (
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
              >
                <ChevronLeft size={24} color="#7C3AED" />
                <Text style={styles.backButtonText}>More</Text>
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="[id]/index"
          options={{
            title: "Transaction Details",
            headerShown: true,
            headerBackTitle: "Back",
            headerBackVisible: true,
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
