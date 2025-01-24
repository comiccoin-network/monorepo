// monorepo/native/mobile/comiccoin-wallet/app/(nft)/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function NFTDetailLayout() {
  const router = useRouter();
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: true,
          gestureEnabled: true,
          headerStyle: {
            backgroundColor: "#7e22ce",
          },
          headerShadowVisible: false,
          headerTitle: "",
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
              {/* We show the Back text on iOS as per platform convention */}
              {Platform.OS === "ios" && (
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 17, // iOS default size
                    fontWeight: "600",
                  }}
                >
                  Back
                </Text>
              )}
            </Pressable>
          ),
          headerTopInsetEnabled: true,
          headerStatusBarHeight: Platform.OS === "ios" ? 44 : 0,
        }}
      />
    </QueryClientProvider>
  );
}
