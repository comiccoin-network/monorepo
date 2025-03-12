// app/(tabs-dashboard)/claim.tsx
import React from "react";
import { Stack } from "expo-router";
import ClaimScreen from "../../screens/ClaimScreen";

export default function ClaimPage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Dashboard",
          headerShown: true,
        }}
      />
      <ClaimScreen />
    </>
  );
}
