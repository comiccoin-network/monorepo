// monorepo/native/mobile/comiccoin-wallet/app/(user)/_layout.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
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
            // Hide the header since we're using our custom UserNavigationBar
            headerShown: false,

            // Configure the tab bar style
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
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="send"
            options={{
              title: "Send",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="arrow-up-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="receive"
            options={{
              title: "Receive",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="arrow-down-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="nfts"
            options={{
              title: "NFTs",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="images-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="more"
            options={{
              title: "More",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="menu-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </QueryClientProvider>
  );
}
