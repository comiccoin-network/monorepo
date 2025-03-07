// app/(dashboard)/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function DashboardLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#7e22ce", // Match the gradient start color of AppHeader
        },
        headerTintColor: "#ffffff", // White text for headers
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginLeft: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        ),
        // Apply a modal presentation style with fade animation
        presentation: "modal",
        animation: "fade",
        // Prevent going back with gestures since these are terminal states
        gestureEnabled: false,
      }}
    />
  );
}
