// app/(user-initialization)/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function UserInitializationLayout() {
  return (
    <Stack
      screenOptions={{
        // Completely disable the default header for all screens in this group
        headerShown: false,

        // Use modal presentation to prevent back navigation through gestures
        presentation: "card",
        animation: "fade",

        // Disable gesture-based navigation
        gestureEnabled: false,

        // Additional settings to ensure no header rendering
        headerTitle: null,
        header: () => null,
      }}
    />
  );
}
