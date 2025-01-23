import { Stack } from "expo-router";

export default function GatewayLayout() {
  return (
    // Another Stack navigator for moving between wallet setup screens
    <Stack
      screenOptions={{
        // Show headers in the Gateway section for navigation clarity
        headerShown: true,
        // Allow users to go back during wallet setup
        gestureEnabled: true,
        // Style the headers consistently
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#000000",
      }}
    />
  );
}
