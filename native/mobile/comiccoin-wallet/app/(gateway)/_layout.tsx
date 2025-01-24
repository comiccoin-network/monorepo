// monorepo/native/mobile/comiccoin-wallet/app/(gateway)/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function GatewayLayout() {
  const router = useRouter();
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: true,
          gestureEnabled: true,
          headerStyle: {
            backgroundColor: "#F3E8FF",
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
              <Ionicons name="chevron-back" size={24} color="#7C3AED" />
              {/* We show the Back text on iOS as per platform convention */}
              {Platform.OS === "ios" && (
                <Text
                  style={{
                    color: "#7C3AED",
                    fontSize: 17, // iOS default size
                    fontWeight: "400",
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
