// monorepo/native/mobile/comiccoin-wallet/app/(user)/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import {
  Home,
  ArrowUpCircle,
  ArrowDownCircle,
  Images,
  Menu,
} from "lucide-react-native"; // Changed from Ionicons to lucide-react-native
import { View, Platform } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import UserNavigationBar from "../../components/UserNavigationBar";

export default function UserLayout() {
  const router = useRouter();
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1 }}>
        <UserNavigationBar />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#ffffff",
              borderTopColor: "#e5e5e5",
              height: Platform.OS === "ios" ? 88 : 60,
              paddingBottom: Platform.OS === "ios" ? 28 : 8,
              paddingTop: 8,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 8,
                },
              }),
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "500",
              marginTop: 4,
            },
            tabBarActiveTintColor: "#7C3AED",
            tabBarInactiveTintColor: "#6B7280",
          }}
        >
          <Tabs.Screen
            name="overview"
            options={{
              title: "Overview",
              tabBarIcon: ({ color, size }) => (
                <Home size={size} color={color} strokeWidth={2} />
              ),
            }}
          />
          <Tabs.Screen
            name="send"
            options={{
              title: "Send",
              tabBarIcon: ({ color, size }) => (
                <ArrowUpCircle size={size} color={color} strokeWidth={2} />
              ),
            }}
          />
          <Tabs.Screen
            name="receive"
            options={{
              title: "Receive",
              tabBarIcon: ({ color, size }) => (
                <ArrowDownCircle size={size} color={color} strokeWidth={2} />
              ),
            }}
          />
          <Tabs.Screen
            name="nfts"
            options={{
              title: "NFTs",
              tabBarIcon: ({ color, size }) => (
                <Images size={size} color={color} strokeWidth={2} />
              ),
            }}
          />
          <Tabs.Screen
            name="more"
            options={{
              title: "More",
              tabBarIcon: ({ color, size }) => (
                <Menu size={size} color={color} strokeWidth={2} />
              ),
            }}
          />
        </Tabs>
      </View>
    </QueryClientProvider>
  );
}
