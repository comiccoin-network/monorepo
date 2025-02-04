// app/(cointx)/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function CoinTransactionLayout() {
  // Using Stack navigation gives us more control over transitions
  // and lets us handle the screens as full-page overlays
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide the header since we want a clean overlay
        presentation: "fullScreenModal", // Make it take up the full screen
        animation: "fade", // Smooth fade transition feels right for transaction states
        // Prevent going back with gestures since these are terminal states
        gestureEnabled: false,
      }}
    />
  );
}
