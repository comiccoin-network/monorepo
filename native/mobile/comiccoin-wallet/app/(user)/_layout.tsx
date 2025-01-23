import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function UserLayout() {
  return (
    <Tabs
      screenOptions={{
        // Style the tab bar
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e5e5",
        },
        // Style the tab labels
        tabBarLabelStyle: {
          fontSize: 12,
        },
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
  );
}
