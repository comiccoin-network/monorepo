import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";

/**
 * This is the layout for the authenticated tab navigation
 * Creates a bottom tab bar with Dashboard, Transactions, Settings, and More
 */
export default function TabLayout() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#8347FF",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#F1F1F1",
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color,
                fontSize: 12,
                fontWeight: focused ? "600" : "400",
              }}
            >
              Dashboard
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color,
                fontSize: 12,
                fontWeight: focused ? "600" : "400",
              }}
            >
              Transactions
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color,
                fontSize: 12,
                fontWeight: focused ? "600" : "400",
              }}
            >
              Settings
            </Text>
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused ? "ellipsis-horizontal" : "ellipsis-horizontal-outline"
              }
              size={24}
              color={color}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color,
                fontSize: 12,
                fontWeight: focused ? "600" : "400",
              }}
            >
              More
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
